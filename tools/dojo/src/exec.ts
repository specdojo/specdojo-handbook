import { Command } from 'commander'
import { randomBytes } from 'node:crypto'
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve, join, extname } from 'node:path'
import yaml from 'js-yaml'

type ExecEventType =
  | 'claim'
  | 'note'
  | 'block'
  | 'unblock'
  | 'complete'
  | 'cancel'
  | 'link'
  | 'estimate'

type ExecState = 'todo' | 'doing' | 'blocked' | 'done' | 'cancelled'

type ExecEventV1 = {
  v: 1
  ts: string // UTC ISO8601, e.g. 2026-03-05T03:10:00Z
  type: ExecEventType
  task_id: string
  by: string
  msg: string
  run_id?: string
  refs?: Record<string, string>
  meta?: Record<string, unknown>
}

type ValidateResult = {
  ok: boolean
  errors: string[]
  warnings: string[]
  stats: {
    events: number
    files: number
    schedule_ids: number
  }
}

type CurrentState = {
  state: ExecState
  last_ts?: string
  last_by?: string
  last_type?: ExecEventType
  last_msg?: string
  refs?: Record<string, string>
  meta?: Record<string, unknown>
}

type StateSnapshot = {
  generated_at_utc: string
  project_path: string
  tasks: Record<string, CurrentState>
}

type ReadyItem = {
  task_id: string
  name?: string
  depends_on: string[]
  schedule_file?: string
  is_critical?: boolean // if slack==0 (optional; only if CPM is integrated later)
}

type ScheduleNode = {
  id: string
  name?: string
  depends_on: string[]
  duration_days?: number // only for tasks
  kind: 'task' | 'milestone'
  schedule_file: string
}

type ScheduleIndex = {
  nodes: Map<string, ScheduleNode>
  files: string[]
}

function nowUtcIsoSeconds(): string {
  // e.g. 2026-03-05T03:10:00Z (no milliseconds)
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}

function isUtcIsoSeconds(ts: string): boolean {
  // strict-ish: YYYY-MM-DDTHH:MM:SSZ
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(ts)
}

function tsForFilenameUtc(ts: string): string {
  // 2026-03-05T03:10:00Z -> 20260305T031000Z
  // Assumes ts is UTC iso seconds.
  return ts.replace(/[-:]/g, '').replace('T', 'T')
}

function safeSlug(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .slice(0, 80)
}

function ensureDir(path: string): void {
  if (!existsSync(path)) mkdirSync(path, { recursive: true })
}

function requireNonEmpty(name: string, v: unknown): string {
  if (typeof v !== 'string' || v.trim().length === 0) {
    throw new Error(`${name} is required`)
  }
  return v.trim()
}

function parseKeyValuePairs(pairs: string[] | undefined): Record<string, string> | undefined {
  if (!pairs || pairs.length === 0) return undefined
  const out: Record<string, string> = {}
  for (const p of pairs) {
    const idx = p.indexOf('=')
    if (idx <= 0) throw new Error(`Invalid key=value: ${p}`)
    const k = p.slice(0, idx).trim()
    const v = p.slice(idx + 1).trim()
    if (!k) throw new Error(`Empty key in: ${p}`)
    out[k] = v
  }
  return out
}

function listFilesRecursive(dir: string): string[] {
  const out: string[] = []
  if (!existsSync(dir)) return out

  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      out.push(...listFilesRecursive(full))
    } else if (st.isFile()) {
      out.push(full)
    }
  }
  return out
}

function readJsonFile(path: string): unknown {
  const raw = readFileSync(path, 'utf8')
  return JSON.parse(raw)
}

function normalizeRefs(refs?: Record<string, string>): Record<string, string> | undefined {
  if (!refs) return undefined
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(refs)) out[String(k)] = String(v)
  return Object.keys(out).length ? out : undefined
}

function buildEvent(type: ExecEventType, o: any): ExecEventV1 {
  const task_id = requireNonEmpty('task', o.task)
  const by = requireNonEmpty('by', o.by)
  const msg = requireNonEmpty('msg', o.msg)

  const refs = normalizeRefs(parseKeyValuePairs(o.ref))
  const metaPairs = parseKeyValuePairs(o.meta)
  const meta = metaPairs
    ? (Object.fromEntries(Object.entries(metaPairs)) as Record<string, unknown>)
    : undefined

  const e: ExecEventV1 = {
    v: 1,
    ts: nowUtcIsoSeconds(),
    type,
    task_id,
    by,
    msg,
  }

  if (o.runId) e.run_id = String(o.runId)
  if (refs) e.refs = refs
  if (meta && Object.keys(meta).length) e.meta = meta

  return e
}

function writeEventFile(projectPath: string, event: ExecEventV1): string {
  const execDir = join(projectPath, 'exec', 'events')
  ensureDir(execDir)

  const tsPart = tsForFilenameUtc(event.ts)
  const byPart = safeSlug(event.by)
  const idPart = safeSlug(event.task_id)
  const typePart = event.type
  const rand = randomBytes(2).toString('hex') // 4 hex chars

  const filename = `${tsPart}_${byPart}_${idPart}_${typePart}_${rand}.json`
  const fullpath = join(execDir, filename)

  writeFileSync(fullpath, JSON.stringify(event, null, 2) + '\n', 'utf8')
  return fullpath
}

function readScheduleYamlFile(path: string): any {
  const raw = readFileSync(path, 'utf8')
  return yaml.load(raw)
}

function isSchYamlFilename(path: string): boolean {
  const base = path.split('/').pop() ?? ''
  if (!base.endsWith('.yaml') && !base.endsWith('.yml')) return false
  // accept sch-*.yaml, including templates if you want; for validation we likely want real sch files
  return /^sch-.*\.(yaml|yml)$/.test(base)
}

function buildScheduleIndex(projectPath: string): ScheduleIndex {
  const allFiles = listFilesRecursive(projectPath)
  const schFiles = allFiles.filter(p => isSchYamlFilename(p))

  const nodes = new Map<string, ScheduleNode>()

  for (const f of schFiles) {
    let doc: any
    try {
      doc = readScheduleYamlFile(f)
    } catch (e) {
      // Skip unreadable YAML; validation will catch this via separate checks if desired
      continue
    }
    if (!doc || typeof doc !== 'object') continue

    const tasks = Array.isArray((doc as any).tasks) ? (doc as any).tasks : []
    const milestones = Array.isArray((doc as any).milestones) ? (doc as any).milestones : []

    for (const t of tasks) {
      if (!t || typeof t !== 'object') continue
      const id = String(t.id ?? '')
      if (!id) continue
      nodes.set(id, {
        id,
        name: typeof t.name === 'string' ? t.name : undefined,
        depends_on: Array.isArray(t.depends_on) ? t.depends_on.map(String) : [],
        duration_days: typeof t.duration_days === 'number' ? t.duration_days : undefined,
        kind: 'task',
        schedule_file: f,
      })
    }

    for (const m of milestones) {
      if (!m || typeof m !== 'object') continue
      const id = String(m.id ?? '')
      if (!id) continue
      nodes.set(id, {
        id,
        name: typeof m.name === 'string' ? m.name : undefined,
        depends_on: Array.isArray(m.depends_on) ? m.depends_on.map(String) : [],
        kind: 'milestone',
        schedule_file: f,
      })
    }
  }

  return { nodes, files: schFiles }
}

function validateEventShape(obj: any, source: string): string[] {
  const errs: string[] = []
  function err(msg: string): void {
    errs.push(`${source}: ${msg}`)
  }

  if (!obj || typeof obj !== 'object') {
    err('not a JSON object')
    return errs
  }

  if (obj.v !== 1) err('v must be 1')
  if (typeof obj.ts !== 'string' || !isUtcIsoSeconds(obj.ts))
    err('ts must be UTC ISO8601 seconds like 2026-03-05T03:10:00Z')
  if (typeof obj.type !== 'string') err('type must be a string')
  if (typeof obj.task_id !== 'string' || obj.task_id.trim() === '')
    err('task_id must be a non-empty string')
  if (typeof obj.by !== 'string' || obj.by.trim() === '') err('by must be a non-empty string')
  if (typeof obj.msg !== 'string') err('msg must be a string')

  const allowed: Set<string> = new Set([
    'claim',
    'note',
    'block',
    'unblock',
    'complete',
    'cancel',
    'link',
    'estimate',
  ])
  if (typeof obj.type === 'string' && !allowed.has(obj.type))
    err(`type must be one of ${Array.from(allowed).join(', ')}`)

  // optional
  if (
    obj.refs !== undefined &&
    (typeof obj.refs !== 'object' || obj.refs === null || Array.isArray(obj.refs))
  )
    err('refs must be an object if provided')
  if (
    obj.meta !== undefined &&
    (typeof obj.meta !== 'object' || obj.meta === null || Array.isArray(obj.meta))
  )
    err('meta must be an object if provided')

  return errs
}

function readAllEventFiles(projectPath: string): { path: string; event: ExecEventV1 }[] {
  const dir = join(projectPath, 'exec', 'events')
  const files = listFilesRecursive(dir).filter(p => extname(p).toLowerCase() === '.json')

  const items: { path: string; event: ExecEventV1 }[] = []
  for (const f of files) {
    const raw = readJsonFile(f)
    items.push({ path: f, event: raw as ExecEventV1 })
  }

  // stable sort: by ts, then by path
  items.sort((a, b) => {
    if (a.event.ts < b.event.ts) return -1
    if (a.event.ts > b.event.ts) return 1
    return a.path.localeCompare(b.path)
  })

  return items
}

function foldEventsToState(
  events: { path: string; event: ExecEventV1 }[],
  schedule: ScheduleIndex
): StateSnapshot {
  const tasks: Record<string, CurrentState> = {}

  function ensureTask(id: string): CurrentState {
    if (!tasks[id]) tasks[id] = { state: 'todo' }
    return tasks[id]
  }

  for (const { event } of events) {
    const cur = ensureTask(event.task_id)
    // keep last info
    cur.last_ts = event.ts
    cur.last_by = event.by
    cur.last_type = event.type
    cur.last_msg = event.msg
    cur.refs = event.refs ?? cur.refs
    cur.meta = event.meta ?? cur.meta

    if (event.type === 'claim') cur.state = 'doing'
    else if (event.type === 'block') cur.state = 'blocked'
    else if (event.type === 'unblock') {
      // conservative: unblock returns to todo (agent can re-claim)
      // If you want "return to doing if already doing", change rule.
      cur.state = 'todo'
    } else if (event.type === 'complete') cur.state = 'done'
    else if (event.type === 'cancel') cur.state = 'cancelled'
    // note/link/estimate do not change state
  }

  // ensure all schedule nodes exist in snapshot even without events
  for (const id of schedule.nodes.keys()) {
    if (!tasks[id]) tasks[id] = { state: 'todo' }
  }

  return {
    generated_at_utc: nowUtcIsoSeconds(),
    project_path: projectPathForSnapshot(schedule),
    tasks,
  }
}

function projectPathForSnapshot(schedule: ScheduleIndex): string {
  // We don't carry projectPath in schedule index. We embed later when writing files.
  // This helper exists to keep types; it is overwritten by writer.
  return ''
}

function computeReady(
  schedule: ScheduleIndex,
  snapshot: StateSnapshot,
  opts: { includeDoing?: boolean } = {}
): ReadyItem[] {
  const includeDoing = !!opts.includeDoing
  const out: ReadyItem[] = []

  function getState(id: string): ExecState {
    return snapshot.tasks[id]?.state ?? 'todo'
  }

  function isDone(id: string): boolean {
    return getState(id) === 'done'
  }

  function isExcludedState(s: ExecState): boolean {
    if (s === 'done' || s === 'cancelled') return true
    if (!includeDoing && s === 'doing') return true
    if (s === 'blocked') return true
    return false
  }

  for (const node of schedule.nodes.values()) {
    if (node.kind !== 'task') continue // ready list for executable tasks only
    const s = getState(node.id)
    if (isExcludedState(s)) continue

    const depsOk = node.depends_on.every(d => isDone(d))
    if (!depsOk) continue

    out.push({
      task_id: node.id,
      name: node.name,
      depends_on: node.depends_on,
      schedule_file: node.schedule_file,
    })
  }

  // stable ordering: by schedule_file then task_id
  out.sort((a, b) => {
    const fa = a.schedule_file ?? ''
    const fb = b.schedule_file ?? ''
    const c = fa.localeCompare(fb)
    if (c !== 0) return c
    return a.task_id.localeCompare(b.task_id)
  })

  return out
}

function writeGeneratedFiles(
  projectPath: string,
  events: { path: string; event: ExecEventV1 }[],
  schedule: ScheduleIndex
): void {
  const genDir = join(projectPath, 'generated')
  ensureDir(genDir)

  // exec.jsonl (generated)
  const execJsonlPath = join(genDir, 'exec.jsonl')
  const jsonl = events.map(x => JSON.stringify(x.event)).join('\n') + (events.length ? '\n' : '')
  writeFileSync(execJsonlPath, jsonl, 'utf8')

  // state.json
  const snapshot = foldEventsToState(events, schedule)
  snapshot.project_path = projectPath
  const statePath = join(genDir, 'state.json')
  writeFileSync(statePath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8')

  // ready.md
  const readyItems = computeReady(schedule, snapshot, { includeDoing: false })
  const readyPath = join(genDir, 'ready.md')
  const lines: string[] = []
  lines.push(`# Ready Tasks`)
  lines.push('')
  lines.push(`- generated_at_utc: \`${snapshot.generated_at_utc}\``)
  lines.push(`- project_path: \`${projectPath}\``)
  lines.push(`- ready_count: \`${readyItems.length}\``)
  lines.push('')
  if (readyItems.length === 0) {
    lines.push('_No ready tasks._')
  } else {
    for (const it of readyItems) {
      const name = it.name ? ` — ${it.name}` : ''
      lines.push(`- \`${it.task_id}\`${name}`)
    }
  }
  lines.push('')
  writeFileSync(readyPath, lines.join('\n'), 'utf8')

  // metadata.json (useful for CI)
  const metaPath = join(genDir, 'metadata.json')
  const meta = {
    generated_at_utc: snapshot.generated_at_utc,
    project_path: projectPath,
    schedule_files: schedule.files,
    event_files_count: events.length,
  }
  writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf8')
}

function validateAll(projectPath: string): ValidateResult {
  const errors: string[] = []
  const warnings: string[] = []

  const schedule = buildScheduleIndex(projectPath)
  const scheduleIds = new Set<string>(Array.from(schedule.nodes.keys()))

  const eventsDir = join(projectPath, 'exec', 'events')
  if (!existsSync(eventsDir)) {
    warnings.push(`No exec/events directory: ${eventsDir}`)
  }

  const files = listFilesRecursive(eventsDir).filter(p => extname(p).toLowerCase() === '.json')

  const parsed: { path: string; event: ExecEventV1 }[] = []

  for (const f of files) {
    let obj: any
    try {
      obj = readJsonFile(f)
    } catch (e) {
      errors.push(`${f}: failed to parse JSON`)
      continue
    }

    const shapeErrs = validateEventShape(obj, f)
    errors.push(...shapeErrs)

    if (shapeErrs.length === 0) {
      const ev = obj as ExecEventV1
      parsed.push({ path: f, event: ev })

      // task_id existence check
      if (!scheduleIds.has(ev.task_id)) {
        // might be a milestone/task not in sch yet; treat as error by default
        errors.push(`${f}: task_id ${ev.task_id} not found in any sch-*.yaml under project_path`)
      }
    }
  }

  // schedule sanity checks: depends_on must exist
  for (const node of schedule.nodes.values()) {
    for (const dep of node.depends_on) {
      if (!schedule.nodes.has(dep)) {
        errors.push(`${node.schedule_file}: ${node.id} depends_on missing id: ${dep}`)
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: {
      events: parsed.length,
      files: files.length,
      schedule_ids: schedule.nodes.size,
    },
  }
}

function addCommonAddOptions(cmd: Command): Command {
  return cmd
    .requiredOption('--task <taskId>', 'Task/Milestone ID, e.g. T-AUTH-API-020 or M-200')
    .requiredOption('--by <actor>', 'Actor (human/agent), e.g. agent-1')
    .requiredOption('--msg <message>', 'Short message')
    .option('--run-id <id>', 'Correlation id for a run/session')
    .option('--ref <k=v...>', 'Reference key=value (repeatable)', collectRepeatable, [])
    .option(
      '--meta <k=v...>',
      'Meta key=value (repeatable). Values are strings.',
      collectRepeatable,
      []
    )
    .requiredOption(
      '--project-path <path>',
      'Path to schedule directory that contains sch-*.yaml and exec/events'
    )
}

function collectRepeatable(value: string, previous: string[]): string[] {
  return previous.concat([value])
}

function printValidateResult(res: ValidateResult): void {
  if (res.ok) {
    process.stdout.write(`OK: validation passed\n`)
  } else {
    process.stdout.write(`NG: validation failed\n`)
  }
  process.stdout.write(
    `stats: events=${res.stats.events}, files=${res.stats.files}, schedule_ids=${res.stats.schedule_ids}\n`
  )

  if (res.warnings.length) {
    process.stdout.write(`\nWarnings:\n`)
    for (const w of res.warnings) process.stdout.write(`- ${w}\n`)
  }
  if (res.errors.length) {
    process.stdout.write(`\nErrors:\n`)
    for (const e of res.errors) process.stdout.write(`- ${e}\n`)
  }
}

function exitWithCode(ok: boolean): void {
  process.exitCode = ok ? 0 : 1
}

export function registerExecCommands(program: Command): void {
  const exec = program
    .command('exec')
    .description(
      'Execution event log helpers (1 event = 1 JSON file under exec/events, UTC timestamps)'
    )

  // ---- add event commands ----
  const types: ExecEventType[] = [
    'claim',
    'note',
    'block',
    'unblock',
    'complete',
    'cancel',
    'link',
    'estimate',
  ]

  for (const t of types) {
    const cmd = exec.command(t).description(`Write ${t} event JSON into exec/events/ (UTC ts)`)
    addCommonAddOptions(cmd)

    cmd.action(opts => {
      const projectPath = requireNonEmpty('project-path', opts.projectPath)
      const event = buildEvent(t, opts)
      const out = writeEventFile(projectPath, event)
      process.stdout.write(out + '\n')
    })
  }

  // ---- validate ----
  const vcmd = exec
    .command('validate')
    .description('Validate exec/events JSON + schedule references')
  vcmd.requiredOption(
    '--project-path <path>',
    'Path to schedule directory that contains sch-*.yaml and exec/events'
  )
  vcmd.action(opts => {
    const projectPath = requireNonEmpty('project-path', opts.projectPath)
    const res = validateAll(projectPath)
    printValidateResult(res)
    exitWithCode(res.ok)
  })

  // ---- state ----
  const scmd = exec
    .command('state')
    .description('Generate state snapshot JSON to stdout (does not write files)')
  scmd.requiredOption(
    '--project-path <path>',
    'Path to schedule directory that contains sch-*.yaml and exec/events'
  )
  scmd.action(opts => {
    const projectPath = requireNonEmpty('project-path', opts.projectPath)
    const res = validateAll(projectPath)
    if (!res.ok) {
      printValidateResult(res)
      exitWithCode(false)
      return
    }

    const schedule = buildScheduleIndex(projectPath)
    const events = readAllEventFiles(projectPath)
    const snapshot = foldEventsToState(events, schedule)
    snapshot.project_path = projectPath

    process.stdout.write(JSON.stringify(snapshot, null, 2) + '\n')
  })

  // ---- ready ----
  const rcmd = exec
    .command('ready')
    .description('Compute ready tasks and print as Markdown to stdout (does not write files)')
  rcmd.requiredOption(
    '--project-path <path>',
    'Path to schedule directory that contains sch-*.yaml and exec/events'
  )
  rcmd.option(
    '--include-doing',
    "Include tasks in 'doing' as ready candidates (default: exclude)",
    false
  )
  rcmd.action(opts => {
    const projectPath = requireNonEmpty('project-path', opts.projectPath)
    const res = validateAll(projectPath)
    if (!res.ok) {
      printValidateResult(res)
      exitWithCode(false)
      return
    }

    const schedule = buildScheduleIndex(projectPath)
    const events = readAllEventFiles(projectPath)
    const snapshot = foldEventsToState(events, schedule)
    snapshot.project_path = projectPath

    const ready = computeReady(schedule, snapshot, { includeDoing: !!opts.includeDoing })
    const lines: string[] = []
    lines.push(`# Ready Tasks`)
    lines.push('')
    lines.push(`- generated_at_utc: \`${nowUtcIsoSeconds()}\``)
    lines.push(`- project_path: \`${projectPath}\``)
    lines.push(`- ready_count: \`${ready.length}\``)
    lines.push('')
    if (ready.length === 0) {
      lines.push('_No ready tasks._')
    } else {
      for (const it of ready) {
        const name = it.name ? ` — ${it.name}` : ''
        lines.push(`- \`${it.task_id}\`${name}`)
      }
    }
    lines.push('')

    process.stdout.write(lines.join('\n'))
  })

  // ---- build (validate + generate files) ----
  const bcmd = exec
    .command('build')
    .description(
      'Validate and generate files under generated/ (exec.jsonl, state.json, ready.md, metadata.json)'
    )
  bcmd.requiredOption(
    '--project-path <path>',
    'Path to schedule directory that contains sch-*.yaml and exec/events'
  )
  bcmd.action(opts => {
    const projectPath = requireNonEmpty('project-path', opts.projectPath)

    const res = validateAll(projectPath)
    printValidateResult(res)
    if (!res.ok) {
      exitWithCode(false)
      return
    }

    const schedule = buildScheduleIndex(projectPath)
    const events = readAllEventFiles(projectPath)
    writeGeneratedFiles(projectPath, events, schedule)

    process.stdout.write(`\nGenerated: ${join(projectPath, 'generated')}\n`)
    exitWithCode(true)
  })

  // ---- helper: print inferred paths ----
  const wcmd = exec
    .command('where')
    .description('Print exec/events and generated paths for a given project-path')
  wcmd.requiredOption('--project-path <path>', 'Path to schedule directory')
  wcmd.action(opts => {
    const projectPath = requireNonEmpty('project-path', opts.projectPath)
    process.stdout.write(`exec/events: ${join(projectPath, 'exec', 'events')}\n`)
    process.stdout.write(`generated : ${join(projectPath, 'generated')}\n`)
  })
}
