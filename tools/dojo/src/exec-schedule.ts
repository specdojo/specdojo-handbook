import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import {
  ClaimNextSnapshot,
  CpmNode,
  CpmResult,
  ExecEventV1,
  ReadySnapshot,
  ScheduleCalendar,
  ScheduleDiff,
  ScheduleHash,
  ScheduleIndex,
  ScheduleNode,
  SchedulerStrategy,
  StateSnapshot,
  ValidateResult,
} from './exec-types.js'
import { computeReadyIds, foldEventsToState, validateEventShape } from './exec-events.js'
import {
  ensureDir,
  isSchYamlFilename,
  listFilesRecursive,
  normalizeDateOnly,
  nowUtcIsoSeconds,
  readJson,
  readYaml,
  toArtifactPath,
  toScheduleFilePath,
  writeJson,
} from './exec-shared.js'
import {
  eventsDirForProject,
  generatedDirForProject,
  executionRootForProject,
} from './exec-project.js'
import {
  buildProgressSummaryLines,
  buildTimelineMarkdown,
  buildTimelineSvg,
} from './exec-schedule-timeline.js'

function defaultScheduleCalendar(): ScheduleCalendar {
  return {
    timezone: 'UTC',
    workdays: new Set([1, 2, 3, 4, 5]),
    holidays: new Set<string>(),
    work_hours_per_day: 24,
  }
}

function parseWorkdayToken(value: string): number | null {
  const key = value.trim().slice(0, 3).toLowerCase()
  const map: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  }
  return key in map ? map[key] : null
}

function applyScheduleCalendar(base: ScheduleCalendar, calendar: any): ScheduleCalendar | null {
  if (!calendar || typeof calendar !== 'object') return null

  const parsed = cloneScheduleCalendar(base)
  if (typeof calendar.timezone === 'string' && calendar.timezone.trim()) {
    parsed.timezone = calendar.timezone.trim()
  }
  if (Array.isArray(calendar.workdays) && calendar.workdays.length) {
    const workdays = new Set<number>()
    for (const token of calendar.workdays) {
      if (typeof token !== 'string') continue
      const day = parseWorkdayToken(token)
      if (day !== null) workdays.add(day)
    }
    if (workdays.size) parsed.workdays = workdays
  }

  if (Array.isArray(calendar.holidays) && calendar.holidays.length) {
    for (const holiday of calendar.holidays
      .map((value: unknown) => normalizeDateOnly(value))
      .filter(Boolean) as string[]) {
      parsed.holidays.add(holiday)
    }
  }

  if (
    typeof calendar.work_hours_per_day === 'number' &&
    Number.isFinite(calendar.work_hours_per_day) &&
    calendar.work_hours_per_day > 0 &&
    calendar.work_hours_per_day <= 24
  ) {
    parsed.work_hours_per_day = calendar.work_hours_per_day
  }

  return parsed
}

function cloneScheduleCalendar(calendar: ScheduleCalendar): ScheduleCalendar {
  return {
    timezone: calendar.timezone,
    workdays: new Set(calendar.workdays),
    holidays: new Set(calendar.holidays),
    work_hours_per_day: calendar.work_hours_per_day,
  }
}

function mergeScheduleCalendar(base: ScheduleCalendar, extra: ScheduleCalendar): ScheduleCalendar {
  const merged = cloneScheduleCalendar(base)
  merged.timezone = extra.timezone
  merged.workdays = new Set(extra.workdays)
  merged.work_hours_per_day = extra.work_hours_per_day
  for (const holiday of extra.holidays) merged.holidays.add(holiday)
  return merged
}

function extractScheduleStartDate(doc: any): string | null {
  return normalizeDateOnly(doc?.settings?.start_date ?? doc?.start_date)
}

function minDateOnly(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  return a <= b ? a : b
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function scheduleSectionLabelForDoc(doc: any, fallback: string): string {
  const scheduleLevel = nonEmptyString(doc?.schedule_level)
  if (!scheduleLevel) return fallback

  if (scheduleLevel === 'milestones') return scheduleLevel

  if (scheduleLevel === 'domain') {
    const domain = nonEmptyString(doc?.domain)
    return domain ?? fallback
  }

  if (scheduleLevel === 'container') {
    const domain = nonEmptyString(doc?.domain)
    const container = nonEmptyString(doc?.container)
    if (domain && container) return `${domain} / ${container}`
    return domain ?? container ?? fallback
  }

  return fallback
}

export function buildScheduleIndex(projectPath: string): ScheduleIndex {
  const all = listFilesRecursive(projectPath)
  const files = all.filter(p => isSchYamlFilename(p))
  const defaultsPath = join(projectPath, 'schedule-defaults.yaml')

  const nodes = new Map<string, ScheduleNode>()
  const sectionLabels: Record<string, string> = {}
  let startDate: string | null = null
  let calendar = defaultScheduleCalendar()
  let hasCalendar = false

  if (existsSync(defaultsPath)) {
    try {
      const defaultsDoc = readYaml(defaultsPath)
      if (defaultsDoc && typeof defaultsDoc === 'object') {
        startDate = minDateOnly(startDate, extractScheduleStartDate(defaultsDoc))
        const defaultCalendar = applyScheduleCalendar(
          defaultScheduleCalendar(),
          defaultsDoc.calendar
        )
        if (defaultCalendar) {
          calendar = defaultCalendar
          hasCalendar = true
        }
      }
    } catch {
      // Ignore malformed defaults here; schema/editor validation should catch it.
    }
  }

  for (const f of files) {
    let doc: any
    try {
      doc = readYaml(f)
    } catch {
      continue
    }
    if (!doc || typeof doc !== 'object') continue

    const scheduleFile = toScheduleFilePath(projectPath, f)
    sectionLabels[scheduleFile] = scheduleSectionLabelForDoc(doc, scheduleFile)

    startDate = minDateOnly(startDate, extractScheduleStartDate(doc))

    const docCalendar = applyScheduleCalendar(calendar, doc.calendar)
    if (docCalendar && doc.calendar && typeof doc.calendar === 'object') {
      if (!hasCalendar) {
        calendar = cloneScheduleCalendar(docCalendar)
        hasCalendar = true
      } else {
        calendar = mergeScheduleCalendar(calendar, docCalendar)
      }
    }

    const tasks = Array.isArray(doc.tasks) ? doc.tasks : []
    const milestones = Array.isArray(doc.milestones) ? doc.milestones : []

    for (const t of tasks) {
      if (!t || typeof t !== 'object') continue
      const id = String(t.id ?? '').trim()
      if (!id) continue
      nodes.set(id, {
        id,
        name: typeof t.name === 'string' ? t.name : undefined,
        owner: typeof t.owner === 'string' ? t.owner : undefined,
        depends_on: Array.isArray(t.depends_on) ? t.depends_on.map(String) : [],
        duration_days: typeof t.duration_days === 'number' ? t.duration_days : 0,
        kind: 'task',
        schedule_file: f,
      })
    }

    for (const m of milestones) {
      if (!m || typeof m !== 'object') continue
      const id = String(m.id ?? '').trim()
      if (!id) continue
      nodes.set(id, {
        id,
        name: typeof m.name === 'string' ? m.name : undefined,
        owner: typeof m.owner === 'string' ? m.owner : undefined,
        depends_on: Array.isArray(m.depends_on) ? m.depends_on.map(String) : [],
        duration_days: 0,
        kind: 'milestone',
        schedule_file: f,
      })
    }
  }

  return { nodes, files, start_date: startDate, calendar, section_labels: sectionLabels }
}

function topoSort(schedule: ScheduleIndex): { order: string[]; cycle?: string[] } {
  const indeg = new Map<string, number>()
  const out = new Map<string, string[]>()

  for (const id of schedule.nodes.keys()) {
    indeg.set(id, 0)
    out.set(id, [])
  }

  for (const node of schedule.nodes.values()) {
    for (const dep of node.depends_on) {
      out.get(dep)!.push(node.id)
      indeg.set(node.id, (indeg.get(node.id) ?? 0) + 1)
    }
  }

  const q: string[] = []
  for (const [id, d] of indeg.entries()) if (d === 0) q.push(id)
  q.sort()

  const order: string[] = []
  while (q.length) {
    const id = q.shift()!
    order.push(id)
    for (const nxt of out.get(id)!) {
      indeg.set(nxt, (indeg.get(nxt) ?? 0) - 1)
      if ((indeg.get(nxt) ?? 0) === 0) {
        q.push(nxt)
        q.sort()
      }
    }
  }

  if (order.length !== schedule.nodes.size) {
    const rem = Array.from(indeg.entries())
      .filter(([, d]) => d > 0)
      .map(([id]) => id)
    return { order, cycle: rem }
  }
  return { order }
}

export function validateAll(projectPath: string): ValidateResult {
  const errors: string[] = []
  const warnings: string[] = []

  const schedule = buildScheduleIndex(projectPath)
  const scheduleIds = new Set<string>(Array.from(schedule.nodes.keys()))

  if (schedule.nodes.size === 0) {
    warnings.push(`No schedule nodes loaded from sch-*.yaml under: ${projectPath}`)
  }

  for (const node of schedule.nodes.values()) {
    for (const dep of node.depends_on) {
      if (!schedule.nodes.has(dep)) {
        errors.push(`${node.schedule_file}: ${node.id} depends_on missing id: ${dep}`)
      }
    }
  }

  const topo = topoSort(schedule)
  if (topo.cycle && topo.cycle.length) {
    errors.push(`schedule dependency cycle detected (nodes involved): ${topo.cycle.join(', ')}`)
  }

  const eventsDir = eventsDirForProject(projectPath)
  if (!existsSync(eventsDir)) warnings.push(`No exec/events directory: ${eventsDir}`)

  const files = listFilesRecursive(eventsDir).filter(p => extname(p).toLowerCase() === '.json')
  let parsedEvents = 0

  for (const f of files) {
    let obj: any
    try {
      obj = readJson(f)
    } catch {
      errors.push(`${f}: failed to parse JSON`)
      continue
    }
    const shapeErrs = validateEventShape(obj, f)
    errors.push(...shapeErrs)
    if (shapeErrs.length === 0) {
      parsedEvents++
      const ev = obj as ExecEventV1
      if (!scheduleIds.has(ev.task_id))
        errors.push(`${f}: task_id ${ev.task_id} not found in sch-*.yaml`)
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: {
      events: parsedEvents,
      event_files: files.length,
      schedule_ids: schedule.nodes.size,
      schedule_files: schedule.files.length,
    },
  }
}

export function printValidateResult(res: ValidateResult): void {
  process.stdout.write(res.ok ? 'OK: validation passed\n' : 'NG: validation failed\n')
  process.stdout.write(
    `stats: events=${res.stats.events}, event_files=${res.stats.event_files}, schedule_ids=${res.stats.schedule_ids}, schedule_files=${res.stats.schedule_files}\n`
  )
  if (res.warnings.length) {
    process.stdout.write('\nWarnings:\n')
    for (const w of res.warnings) process.stdout.write(`- ${w}\n`)
  }
  if (res.errors.length) {
    process.stdout.write('\nErrors:\n')
    for (const e of res.errors) process.stdout.write(`- ${e}\n`)
  }
}

export function exitWithCode(ok: boolean): void {
  process.exitCode = ok ? 0 : 1
}

export function computeCpm(schedule: ScheduleIndex, projectPath: string): CpmResult {
  const { order, cycle } = topoSort(schedule)
  if (cycle && cycle.length)
    throw new Error(`schedule dependency cycle detected: ${cycle.join(', ')}`)

  const nodes: Record<string, CpmNode> = {}

  for (const id of order) {
    const n = schedule.nodes.get(id)!
    const es = n.depends_on.length === 0 ? 0 : Math.max(...n.depends_on.map(d => nodes[d].ef))
    const ef = es + n.duration_days

    nodes[id] = {
      id,
      name: n.name,
      owner: n.owner,
      kind: n.kind,
      duration_days: n.duration_days,
      es,
      ef,
      ls: 0,
      lf: 0,
      slack: 0,
      depends_on: n.depends_on,
      schedule_file: toScheduleFilePath(projectPath, n.schedule_file),
    }
  }

  const projectDuration = Math.max(...Object.values(nodes).map(n => n.ef), 0)

  const succ = new Map<string, string[]>()
  for (const id of schedule.nodes.keys()) succ.set(id, [])
  for (const n of schedule.nodes.values()) {
    for (const dep of n.depends_on) succ.get(dep)!.push(n.id)
  }

  const rev = [...order].reverse()
  for (const id of rev) {
    const s = succ.get(id)!
    const lf = s.length === 0 ? projectDuration : Math.min(...s.map(child => nodes[child].ls))
    const ls = lf - nodes[id].duration_days
    nodes[id].lf = lf
    nodes[id].ls = ls
    nodes[id].slack = ls - nodes[id].es
  }

  const critical = new Set(
    Object.values(nodes)
      .filter(n => n.slack === 0)
      .map(n => n.id)
  )
  const starts = Object.values(nodes)
    .filter(n => critical.has(n.id) && n.es === 0)
    .sort((a, b) => a.id.localeCompare(b.id))

  const path: string[] = []
  if (starts.length) {
    let cur = starts[0].id
    path.push(cur)
    while (true) {
      const nexts = (succ.get(cur) ?? [])
        .filter(x => critical.has(x))
        .filter(x => nodes[x].es === nodes[cur].ef)
        .sort((a, b) => a.localeCompare(b))
      if (!nexts.length) break
      cur = nexts[0]
      path.push(cur)
    }
  }

  return {
    schedule_path: toArtifactPath(projectPath),
    project_start_date: schedule.start_date,
    project_duration_days: projectDuration,
    nodes,
    critical_path: path,
  }
}

function orderReadyIds(
  ready: string[],
  cpm: CpmResult | null,
  strategy: SchedulerStrategy
): string[] {
  const ordered = [...ready]
  if (ordered.length === 0) return ordered

  if (strategy === 'fifo' || !cpm) {
    ordered.sort((a, b) => a.localeCompare(b))
    return ordered
  }

  ordered.sort((a, b) => {
    const an = cpm.nodes[a]
    const bn = cpm.nodes[b]
    if (an && bn) {
      if (an.slack !== bn.slack) return an.slack - bn.slack
      if (an.es !== bn.es) return an.es - bn.es
      return a.localeCompare(b)
    }
    if (an && !bn) return -1
    if (!an && bn) return 1
    return a.localeCompare(b)
  })

  return ordered
}

function buildReadySnapshot(
  projectPath: string,
  schedule: ScheduleIndex,
  ready: string[],
  cpm: CpmResult | null
): ReadySnapshot {
  const fifo = orderReadyIds(ready, cpm, 'fifo')
  const criticalFirst = orderReadyIds(ready, cpm, 'critical-first')
  const fifoRank = new Map(fifo.map((id, idx) => [id, idx + 1]))
  const criticalRank = new Map(criticalFirst.map((id, idx) => [id, idx + 1]))
  const executionPath = executionRootForProject(projectPath)
  const generatedDir = generatedDirForProject(projectPath)

  const tasks = criticalFirst.map(id => {
    const node = schedule.nodes.get(id)
    const cpmNode = cpm?.nodes[id]
    return {
      id,
      name: node?.name,
      owner: node?.owner,
      schedule_file: node?.schedule_file ? toScheduleFilePath(projectPath, node.schedule_file) : '',
      fifo_rank: fifoRank.get(id) ?? 0,
      critical_first_rank: criticalRank.get(id) ?? 0,
      cpm: cpmNode
        ? {
            es: cpmNode.es,
            ef: cpmNode.ef,
            ls: cpmNode.ls,
            lf: cpmNode.lf,
            slack: cpmNode.slack,
          }
        : undefined,
    }
  })

  return {
    schedule_path: toArtifactPath(projectPath),
    execution_path: toArtifactPath(executionPath),
    generated_dir: toArtifactPath(generatedDir),
    ready_count: ready.length,
    default_strategy: 'critical-first',
    strategies: {
      'critical-first': {
        next_task_id: criticalFirst[0] ?? null,
        ordered_task_ids: criticalFirst,
      },
      fifo: {
        next_task_id: fifo[0] ?? null,
        ordered_task_ids: fifo,
      },
    },
    tasks,
  }
}

function writeReadyFiles(projectPath: string, readySnapshot: ReadySnapshot): void {
  const genDir = generatedDirForProject(projectPath)
  ensureDir(genDir)

  writeJson(join(genDir, 'ready.json'), readySnapshot)

  const claimNext: ClaimNextSnapshot = {
    schedule_path: readySnapshot.schedule_path,
    execution_path: readySnapshot.execution_path,
    generated_dir: readySnapshot.generated_dir,
    default_strategy: readySnapshot.default_strategy,
    strategies: readySnapshot.strategies,
  }
  writeJson(join(genDir, 'claim-next.json'), claimNext)

  const lines: string[] = []
  lines.push(`# Ready Tasks`)
  lines.push('')
  lines.push(`- schedule_path: \`${readySnapshot.schedule_path}\``)
  lines.push(`- execution_path: \`${readySnapshot.execution_path}\``)
  lines.push(`- ready_count: \`${readySnapshot.ready_count}\``)
  lines.push(`- default_strategy: \`${readySnapshot.default_strategy}\``)
  lines.push('')
  lines.push(`## Claim Targets`)
  lines.push('')
  lines.push(`| strategy | next_task_id |`)
  lines.push(`|---|---|`)
  lines.push(
    `| critical-first | ${readySnapshot.strategies['critical-first'].next_task_id ? `\`${readySnapshot.strategies['critical-first'].next_task_id}\`` : '_none_'} |`
  )
  lines.push(
    `| fifo | ${readySnapshot.strategies.fifo.next_task_id ? `\`${readySnapshot.strategies.fifo.next_task_id}\`` : '_none_'} |`
  )
  lines.push('')

  if (!readySnapshot.tasks.length) {
    lines.push('_No ready tasks._')
    lines.push('')
  } else {
    lines.push(`## Ready Order (critical-first)`)
    lines.push('')
    lines.push(`| rank | id | owner | slack | ES | schedule_file |`)
    lines.push(`|---:|---|---|---:|---:|---|`)
    for (const task of readySnapshot.tasks) {
      lines.push(
        `| ${task.critical_first_rank} | \`${task.id}\` | ${task.owner ?? '-'} | ${task.cpm?.slack ?? '-'} | ${task.cpm?.es ?? '-'} | ${task.schedule_file || '-'} |`
      )
    }
    lines.push('')
    lines.push(`## FIFO Order`)
    lines.push('')
    for (const id of readySnapshot.strategies.fifo.ordered_task_ids) lines.push(`- \`${id}\``)
    lines.push('')
  }

  writeFileSync(join(genDir, 'ready.md'), lines.join('\n'), 'utf8')
}

export function writeCpmFiles(
  projectPath: string,
  cpm: CpmResult,
  stateSnapshot?: StateSnapshot
): void {
  const genDir = generatedDirForProject(projectPath)
  ensureDir(genDir)

  writeJson(join(genDir, 'cpm.json'), cpm)

  const rows = Object.values(cpm.nodes).sort((a, b) => a.es - b.es || a.id.localeCompare(b.id))
  const lines: string[] = []
  lines.push(`# CPM`)
  lines.push('')
  lines.push(`- project_duration_days: \`${cpm.project_duration_days}\``)
  lines.push('')
  lines.push(`| id | owner | kind | dur | ES | EF | LS | LF | slack | depends_on |`)
  lines.push(`|---|---|---:|---:|---:|---:|---:|---:|---:|---|`)
  for (const r of rows) {
    lines.push(
      `| \`${r.id}\` | ${r.owner ?? '-'} | ${r.kind} | ${r.duration_days} | ${r.es} | ${r.ef} | ${r.ls} | ${r.lf} | ${r.slack} | ${r.depends_on.join(', ')} |`
    )
  }
  lines.push('')
  writeFileSync(join(genDir, 'cpm.md'), lines.join('\n'), 'utf8')

  const cp: string[] = []
  cp.push(`# Critical Path`)
  cp.push('')
  cp.push(`- project_duration_days: \`${cpm.project_duration_days}\``)
  cp.push('')
  if (!cpm.critical_path.length) cp.push('_No critical path computed._')
  else {
    cp.push(`Critical path (one path, tie-broken):`)
    cp.push('')
    for (const id of cpm.critical_path) {
      const n = cpm.nodes[id]
      cp.push(`- \`${id}\`${n.name ? ` — ${n.name}` : ''} (ES=${n.es}, EF=${n.ef})`)
    }
  }
  cp.push('')
  writeFileSync(join(genDir, 'critical-path.md'), cp.join('\n'), 'utf8')

  const schedule = buildScheduleIndex(projectPath)
  const criticalSet = new Set(cpm.critical_path)
  const taskRows = rows.filter(row => row.kind === 'task')
  const stateCounts: Record<'todo' | 'doing' | 'blocked' | 'done' | 'cancelled', number> = {
    todo: 0,
    doing: 0,
    blocked: 0,
    done: 0,
    cancelled: 0,
  }

  for (const row of taskRows) {
    const state = stateSnapshot?.tasks[row.id]?.state ?? 'todo'
    stateCounts[state] += 1
  }

  const doneCount = stateCounts.done
  const totalTaskCount = taskRows.length
  const progressPercent =
    totalTaskCount > 0 ? ((doneCount / totalTaskCount) * 100).toFixed(1) : '0.0'
  const ready = computeReadyIds(schedule, {
    schedule_path: cpm.schedule_path,
    tasks: stateSnapshot?.tasks ?? {},
  })
  const readyOrdered = orderReadyIds(ready, cpm, 'critical-first')
  const criticalDoingCount = taskRows.filter(
    row => criticalSet.has(row.id) && (stateSnapshot?.tasks[row.id]?.state ?? 'todo') === 'doing'
  ).length
  const progressSummaryLines = buildProgressSummaryLines({
    cpm,
    schedule,
    stateCounts,
    totalTaskCount,
    readyCount: ready.length,
    nextTaskId: readyOrdered[0] ?? null,
    criticalDoingCount,
  })

  writeFileSync(
    join(genDir, 'timeline.svg'),
    buildTimelineSvg(cpm, schedule, stateSnapshot),
    'utf8'
  )
  writeFileSync(
    join(genDir, 'timeline.md'),
    buildTimelineMarkdown(cpm, {
      criticalPathTaskCount: criticalSet.size,
      progressPercent,
      doneTasks: `${doneCount}/${totalTaskCount}`,
      taskStateCounts: `todo=${stateCounts.todo}, doing=${stateCounts.doing}, blocked=${stateCounts.blocked}, done=${stateCounts.done}, cancelled=${stateCounts.cancelled}`,
      progressSummaryLines,
    }),
    'utf8'
  )
}

function normalizeNodeForHash(n: ScheduleNode): any {
  return {
    id: n.id,
    name: n.name ?? '',
    owner: n.owner ?? '',
    kind: n.kind,
    duration_days: n.duration_days,
    depends_on: [...n.depends_on].sort(),
    schedule_file: basename(n.schedule_file),
  }
}

function sha256Json(obj: any): string {
  return createHash('sha256').update(JSON.stringify(obj)).digest('hex')
}

function buildScheduleHash(schedule: ScheduleIndex, projectPath: string): ScheduleHash {
  const node_hashes: Record<string, string> = {}
  for (const n of schedule.nodes.values()) node_hashes[n.id] = sha256Json(normalizeNodeForHash(n))

  return {
    schema_version: 1,
    schedule_path: toArtifactPath(projectPath),
    schedule_files: schedule.files.map(p => toScheduleFilePath(projectPath, p)).sort(),
    node_hashes,
  }
}

function computeScheduleDiff(prev: ScheduleHash | null, cur: ScheduleHash): ScheduleDiff {
  const prevMap = prev?.node_hashes ?? {}
  const curMap = cur.node_hashes

  const prevIds = new Set(Object.keys(prevMap))
  const curIds = new Set(Object.keys(curMap))

  const added = Array.from(curIds)
    .filter(id => !prevIds.has(id))
    .sort()
  const removed = Array.from(prevIds)
    .filter(id => !curIds.has(id))
    .sort()
  const changed = Array.from(curIds)
    .filter(id => prevIds.has(id) && prevMap[id] !== curMap[id])
    .sort()

  return {
    schedule_path: cur.schedule_path,
    added,
    removed,
    changed,
  }
}

export function writeScheduleHashAndDiff(projectPath: string, schedule: ScheduleIndex): void {
  const genDir = generatedDirForProject(projectPath)
  ensureDir(genDir)

  const cur = buildScheduleHash(schedule, projectPath)
  const hashPath = join(genDir, 'schedule-hash.json')

  let prev: ScheduleHash | null = null
  if (existsSync(hashPath)) {
    try {
      prev = readJson(hashPath) as ScheduleHash
    } catch {
      prev = null
    }
  }

  const diff = computeScheduleDiff(prev, cur)
  writeJson(hashPath, cur)

  const lines: string[] = []
  lines.push(`# Schedule Diff`)
  lines.push('')
  lines.push(`## Added`)
  lines.push('')
  lines.push(diff.added.length ? diff.added.map(x => `- \`${x}\``).join('\n') : '_none_')
  lines.push('')
  lines.push(`## Removed`)
  lines.push('')
  lines.push(diff.removed.length ? diff.removed.map(x => `- \`${x}\``).join('\n') : '_none_')
  lines.push('')
  lines.push(`## Changed`)
  lines.push('')
  lines.push(diff.changed.length ? diff.changed.map(x => `- \`${x}\``).join('\n') : '_none_')
  lines.push('')
  writeFileSync(join(genDir, 'schedule-diff.md'), lines.join('\n'), 'utf8')
}

export function writeGeneratedCore(
  projectPath: string,
  events: { path: string; event: ExecEventV1 }[],
  schedule: ScheduleIndex,
  cpm: CpmResult | null
): StateSnapshot {
  const genDir = generatedDirForProject(projectPath)
  ensureDir(genDir)

  const jsonl = events.map(x => JSON.stringify(x.event)).join('\n') + (events.length ? '\n' : '')
  writeFileSync(join(genDir, 'exec.jsonl'), jsonl, 'utf8')

  const snapshot = foldEventsToState(events, schedule, projectPath)
  writeJson(join(genDir, 'state.json'), snapshot)

  const ready = computeReadyIds(schedule, snapshot)
  const readySnapshot = buildReadySnapshot(projectPath, schedule, ready, cpm)
  writeReadyFiles(projectPath, readySnapshot)

  writeJson(join(genDir, 'metadata.json'), {
    generated_at_utc: nowUtcIsoSeconds(),
    schedule_path: toArtifactPath(projectPath),
    execution_path: toArtifactPath(executionRootForProject(projectPath)),
    generated_dir: toArtifactPath(genDir),
    schedule_files: schedule.files.map(p => toScheduleFilePath(projectPath, p)).sort(),
    event_files_count: events.length,
    default_scheduler_strategy: 'critical-first',
    derived_files: [
      'claim-next.json',
      'cpm.json',
      'cpm.md',
      'critical-path.md',
      'exec.jsonl',
      'metadata.json',
      'ready.json',
      'ready.md',
      'schedule-diff.md',
      'schedule-hash.json',
      'state.json',
      'timeline.md',
      'timeline.svg',
    ],
  })

  return snapshot
}

export function selectNextTask(
  ready: string[],
  cpm: CpmResult | null,
  strategy: SchedulerStrategy
): string | null {
  return orderReadyIds(ready, cpm, strategy)[0] ?? null
}
