import { Command } from 'commander'
import { randomBytes, createHash } from 'node:crypto'
import {
  mkdirSync,
  writeFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  rmSync,
} from 'node:fs'
import { join, extname, basename, resolve } from 'node:path'
import yaml from 'js-yaml'
import { loadConfig, loadEnv } from './dojo-config.js'

/* =========================
   Types
========================= */

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
  ts: string
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
    event_files: number
    schedule_ids: number
    schedule_files: number
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

type ScheduleNode = {
  id: string
  name?: string
  depends_on: string[]
  duration_days: number
  kind: 'task' | 'milestone'
  schedule_file: string
}

type ScheduleIndex = {
  nodes: Map<string, ScheduleNode>
  files: string[]
}

type CpmNode = {
  id: string
  name?: string
  kind: 'task' | 'milestone'
  duration_days: number
  es: number
  ef: number
  ls: number
  lf: number
  slack: number
  depends_on: string[]
  schedule_file: string
}

type CpmResult = {
  generated_at_utc: string
  project_path: string
  project_duration_days: number
  nodes: Record<string, CpmNode>
  critical_path: string[]
}

type ScheduleHash = {
  schema_version: 1
  generated_at_utc: string
  project_path: string
  schedule_files: string[]
  node_hashes: Record<string, string>
}

type ScheduleDiff = {
  generated_at_utc: string
  project_path: string
  added: string[]
  removed: string[]
  changed: string[]
}

type SchedulerLockOptions = {
  actor: string
  lockTimeoutMs: number
  lockStaleMs: number
}

/* =========================
   Small utils
========================= */

function nowUtcIsoSeconds(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}

function isUtcIsoSeconds(ts: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(ts)
}

function tsForFilenameUtc(ts: string): string {
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
  if (typeof v !== 'string' || v.trim().length === 0) throw new Error(`${name} is required`)
  return v.trim()
}

function collectRepeatable(value: string, previous: string[]): string[] {
  return previous.concat([value])
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
  return Object.keys(out).length ? out : undefined
}

function listFilesRecursive(dir: string): string[] {
  const out: string[] = []
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...listFilesRecursive(full))
    else if (st.isFile()) out.push(full)
  }
  return out
}

function readJson(path: string): any {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeJson(path: string, data: any): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function readYaml(path: string): any {
  return yaml.load(readFileSync(path, 'utf8'))
}

function isSchYamlFilename(path: string): boolean {
  return /^sch-.*\.(yaml|yml)$/.test(basename(path))
}

function sleepMs(ms: number): void {
  const sab = new SharedArrayBuffer(4)
  const int32 = new Int32Array(sab)
  Atomics.wait(int32, 0, 0, ms)
}

/* =========================
   Project path resolution
========================= */

function detectProjectPaths(repoRoot: string): string[] {
  const all = listFilesRecursive(repoRoot)
  const schFiles = all.filter(p => isSchYamlFilename(p))

  const candidates = new Map<string, { hasSch: boolean; hasExecEvents: boolean }>()

  for (const sch of schFiles) {
    const dir = resolve(sch, '..')
    const cur = candidates.get(dir) ?? { hasSch: false, hasExecEvents: false }
    cur.hasSch = true
    const eventsDir = join(dir, 'exec', 'events')
    if (existsSync(eventsDir)) cur.hasExecEvents = true
    candidates.set(dir, cur)
  }

  return Array.from(candidates.entries())
    .filter(([, v]) => v.hasSch && v.hasExecEvents)
    .map(([k]) => k)
    .sort()
}

function resolveProjectPath(opts: { projectPath?: string; project?: string }): string {
  loadEnv()

  if (opts.projectPath && opts.projectPath.trim()) {
    return resolve(process.cwd(), opts.projectPath.trim())
  }

  const envPath = process.env.DOJO_PROJECT_PATH
  const envProject = process.env.DOJO_PROJECT

  const { config, configPath } = loadConfig()

  function fromProjectId(projectId: string): string | null {
    if (!config) return null
    const rel = config.projects[projectId]
    if (!rel) return null
    return resolve(process.cwd(), rel)
  }

  if (opts.project && opts.project.trim()) {
    const p = fromProjectId(opts.project.trim())
    if (!p) throw new Error(`Unknown project id: ${opts.project} (check ${configPath})`)
    return p
  }

  if (envPath && envPath.trim()) {
    return resolve(process.cwd(), envPath.trim())
  }

  if (envProject && envProject.trim()) {
    const p = fromProjectId(envProject.trim())
    if (!p) throw new Error(`Unknown DOJO_PROJECT: ${envProject} (check ${configPath})`)
    return p
  }

  const repoRoot = process.cwd()
  const candidates = detectProjectPaths(repoRoot)
  if (candidates.length === 1) return candidates[0]
  if (candidates.length === 0) {
    throw new Error(
      `Project path not specified.\n` +
        `Provide --project-path, or --project, or DOJO_PROJECT_PATH/DOJO_PROJECT.\n` +
        `Auto-detect found no candidates.`
    )
  }
  throw new Error(
    `Project path not specified and auto-detect is ambiguous.\n` +
      `Candidates:\n` +
      candidates.map(c => `- ${c}`).join('\n') +
      `\nUse --project-path or --project.`
  )
}

/* =========================
   Schedule loading
========================= */

function buildScheduleIndex(projectPath: string): ScheduleIndex {
  const all = listFilesRecursive(projectPath)
  const files = all.filter(p => isSchYamlFilename(p))

  const nodes = new Map<string, ScheduleNode>()

  for (const f of files) {
    let doc: any
    try {
      doc = readYaml(f)
    } catch {
      continue
    }
    if (!doc || typeof doc !== 'object') continue

    const tasks = Array.isArray(doc.tasks) ? doc.tasks : []
    const milestones = Array.isArray(doc.milestones) ? doc.milestones : []

    for (const t of tasks) {
      if (!t || typeof t !== 'object') continue
      const id = String(t.id ?? '').trim()
      if (!id) continue
      nodes.set(id, {
        id,
        name: typeof t.name === 'string' ? t.name : undefined,
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
        depends_on: Array.isArray(m.depends_on) ? m.depends_on.map(String) : [],
        duration_days: 0,
        kind: 'milestone',
        schedule_file: f,
      })
    }
  }

  return { nodes, files }
}

/* =========================
   Events + validation
========================= */

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
    err('ts must be UTC ISO seconds like 2026-03-05T03:10:00Z')
  const allowed = new Set<ExecEventType>([
    'claim',
    'note',
    'block',
    'unblock',
    'complete',
    'cancel',
    'link',
    'estimate',
  ])
  if (typeof obj.type !== 'string' || !allowed.has(obj.type))
    err(`type must be one of ${Array.from(allowed).join(', ')}`)
  if (typeof obj.task_id !== 'string' || obj.task_id.trim() === '')
    err('task_id must be non-empty string')
  if (typeof obj.by !== 'string' || obj.by.trim() === '') err('by must be non-empty string')
  if (typeof obj.msg !== 'string') err('msg must be string')
  if (
    obj.refs !== undefined &&
    (typeof obj.refs !== 'object' || obj.refs === null || Array.isArray(obj.refs))
  )
    err('refs must be object if provided')
  if (
    obj.meta !== undefined &&
    (typeof obj.meta !== 'object' || obj.meta === null || Array.isArray(obj.meta))
  )
    err('meta must be object if provided')
  return errs
}

function readAllEventFiles(projectPath: string): { path: string; event: ExecEventV1 }[] {
  const dir = join(projectPath, 'exec', 'events')
  const files = listFilesRecursive(dir).filter(p => extname(p).toLowerCase() === '.json')

  const items: { path: string; event: ExecEventV1 }[] = []
  for (const f of files) items.push({ path: f, event: readJson(f) as ExecEventV1 })

  items.sort((a, b) => {
    if (a.event.ts < b.event.ts) return -1
    if (a.event.ts > b.event.ts) return 1
    return a.path.localeCompare(b.path)
  })

  return items
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

function validateAll(projectPath: string): ValidateResult {
  const errors: string[] = []
  const warnings: string[] = []

  const schedule = buildScheduleIndex(projectPath)
  const scheduleIds = new Set<string>(Array.from(schedule.nodes.keys()))

  if (schedule.nodes.size === 0)
    warnings.push(`No schedule nodes loaded from sch-*.yaml under: ${projectPath}`)

  for (const node of schedule.nodes.values()) {
    for (const dep of node.depends_on) {
      if (!schedule.nodes.has(dep))
        errors.push(`${node.schedule_file}: ${node.id} depends_on missing id: ${dep}`)
    }
  }

  const topo = topoSort(schedule)
  if (topo.cycle && topo.cycle.length) {
    errors.push(`schedule dependency cycle detected (nodes involved): ${topo.cycle.join(', ')}`)
  }

  const eventsDir = join(projectPath, 'exec', 'events')
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

function printValidateResult(res: ValidateResult): void {
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

function exitWithCode(ok: boolean): void {
  process.exitCode = ok ? 0 : 1
}

function buildEvent(type: ExecEventType, o: any): ExecEventV1 {
  const task_id = requireNonEmpty('task', o.task)
  const by = requireNonEmpty('by', o.by)
  const msg = requireNonEmpty('msg', o.msg)

  const refs = parseKeyValuePairs(o.ref)
  const metaPairs = parseKeyValuePairs(o.meta)
  const meta = metaPairs
    ? (Object.fromEntries(Object.entries(metaPairs)) as Record<string, unknown>)
    : undefined

  const e: ExecEventV1 = { v: 1, ts: nowUtcIsoSeconds(), type, task_id, by, msg }
  if (o.runId) e.run_id = String(o.runId)
  if (refs) e.refs = refs
  if (meta) e.meta = meta
  return e
}

function writeEventFile(projectPath: string, event: ExecEventV1): string {
  const execDir = join(projectPath, 'exec', 'events')
  ensureDir(execDir)

  const tsPart = tsForFilenameUtc(event.ts)
  const byPart = safeSlug(event.by)
  const idPart = safeSlug(event.task_id)
  const rand = randomBytes(2).toString('hex')

  const filename = `${tsPart}_${byPart}_${idPart}_${event.type}_${rand}.json`
  const fullpath = join(execDir, filename)

  writeFileSync(fullpath, JSON.stringify(event, null, 2) + '\n', 'utf8')
  return fullpath
}

/* =========================
   State + guards
========================= */

function foldEventsToState(
  events: { path: string; event: ExecEventV1 }[],
  schedule: ScheduleIndex,
  projectPath: string
): StateSnapshot {
  const tasks: Record<string, CurrentState> = {}

  function ensure(id: string): CurrentState {
    if (!tasks[id]) tasks[id] = { state: 'todo' }
    return tasks[id]
  }

  for (const { event } of events) {
    const cur = ensure(event.task_id)
    cur.last_ts = event.ts
    cur.last_by = event.by
    cur.last_type = event.type
    cur.last_msg = event.msg
    if (event.refs) cur.refs = event.refs
    if (event.meta) cur.meta = event.meta

    if (event.type === 'claim') cur.state = 'doing'
    else if (event.type === 'block') cur.state = 'blocked'
    else if (event.type === 'unblock') cur.state = 'todo'
    else if (event.type === 'complete') cur.state = 'done'
    else if (event.type === 'cancel') cur.state = 'cancelled'
  }

  for (const id of schedule.nodes.keys()) ensure(id)

  return {
    generated_at_utc: nowUtcIsoSeconds(),
    project_path: projectPath,
    tasks,
  }
}

function computeReadyIds(schedule: ScheduleIndex, snapshot: StateSnapshot): string[] {
  function stateOf(id: string): ExecState {
    return snapshot.tasks[id]?.state ?? 'todo'
  }
  function isDone(id: string): boolean {
    return stateOf(id) === 'done'
  }

  const ready: string[] = []
  for (const n of schedule.nodes.values()) {
    if (n.kind !== 'task') continue
    const st = stateOf(n.id)
    if (st === 'done' || st === 'cancelled' || st === 'doing' || st === 'blocked') continue
    if (n.depends_on.every(d => isDone(d))) ready.push(n.id)
  }
  ready.sort()
  return ready
}

function findDoingTasksForActor(snapshot: StateSnapshot, actor: string): string[] {
  return Object.entries(snapshot.tasks)
    .filter(([, st]) => st.state === 'doing' && st.last_by === actor)
    .map(([taskId]) => taskId)
    .sort()
}

function canClaimTask(
  schedule: ScheduleIndex,
  snapshot: StateSnapshot,
  taskId: string
): { ok: boolean; reason?: string } {
  const node = schedule.nodes.get(taskId)
  if (!node) return { ok: false, reason: `task not found in schedule: ${taskId}` }
  if (node.kind !== 'task') return { ok: false, reason: `cannot claim non-task node: ${taskId}` }

  const cur = snapshot.tasks[taskId]
  const state = cur?.state ?? 'todo'

  if (state === 'doing') return { ok: false, reason: `task already doing: ${taskId}` }
  if (state === 'done') return { ok: false, reason: `task already done: ${taskId}` }
  if (state === 'cancelled') return { ok: false, reason: `task cancelled: ${taskId}` }
  if (state === 'blocked') return { ok: false, reason: `task blocked: ${taskId}` }

  for (const dep of node.depends_on) {
    const depState = snapshot.tasks[dep]?.state ?? 'todo'
    if (depState !== 'done') return { ok: false, reason: `dependency not done: ${dep}` }
  }

  return { ok: true }
}

function canCompleteTask(
  schedule: ScheduleIndex,
  snapshot: StateSnapshot,
  taskId: string,
  actor: string
): { ok: boolean; reason?: string } {
  const node = schedule.nodes.get(taskId)
  if (!node) return { ok: false, reason: `task not found in schedule: ${taskId}` }
  if (node.kind !== 'task') return { ok: false, reason: `cannot complete non-task node: ${taskId}` }

  const cur = snapshot.tasks[taskId]
  const state = cur?.state ?? 'todo'

  if (state === 'todo') return { ok: false, reason: `task not started: ${taskId}` }
  if (state === 'blocked') return { ok: false, reason: `task is blocked: ${taskId}` }
  if (state === 'done') return { ok: false, reason: `task already done: ${taskId}` }
  if (state === 'cancelled') return { ok: false, reason: `task cancelled: ${taskId}` }

  if (state !== 'doing') return { ok: false, reason: `task is not doing: ${taskId}` }
  if (cur?.last_by !== actor) {
    return {
      ok: false,
      reason: `task is being worked on by another actor: ${cur?.last_by ?? '(unknown)'}`,
    }
  }

  return { ok: true }
}

function canBlockTask(
  schedule: ScheduleIndex,
  snapshot: StateSnapshot,
  taskId: string,
  actor: string
): { ok: boolean; reason?: string } {
  const node = schedule.nodes.get(taskId)
  if (!node) return { ok: false, reason: `task not found in schedule: ${taskId}` }
  if (node.kind !== 'task') return { ok: false, reason: `cannot block non-task node: ${taskId}` }

  const cur = snapshot.tasks[taskId]
  const state = cur?.state ?? 'todo'

  if (state === 'todo') return { ok: false, reason: `task not started: ${taskId}` }
  if (state === 'blocked') return { ok: false, reason: `task already blocked: ${taskId}` }
  if (state === 'done') return { ok: false, reason: `task already done: ${taskId}` }
  if (state === 'cancelled') return { ok: false, reason: `task cancelled: ${taskId}` }

  if (state !== 'doing') return { ok: false, reason: `task is not doing: ${taskId}` }
  if (cur?.last_by !== actor) {
    return {
      ok: false,
      reason: `task is being worked on by another actor: ${cur?.last_by ?? '(unknown)'}`,
    }
  }

  return { ok: true }
}

function canUnblockTask(
  schedule: ScheduleIndex,
  snapshot: StateSnapshot,
  taskId: string
): { ok: boolean; reason?: string } {
  const node = schedule.nodes.get(taskId)
  if (!node) return { ok: false, reason: `task not found in schedule: ${taskId}` }
  if (node.kind !== 'task') return { ok: false, reason: `cannot unblock non-task node: ${taskId}` }

  const cur = snapshot.tasks[taskId]
  const state = cur?.state ?? 'todo'

  if (state === 'todo') return { ok: false, reason: `task is not blocked: ${taskId}` }
  if (state === 'doing') return { ok: false, reason: `task is not blocked: ${taskId}` }
  if (state === 'done') return { ok: false, reason: `task already done: ${taskId}` }
  if (state === 'cancelled') return { ok: false, reason: `task cancelled: ${taskId}` }

  if (state !== 'blocked') return { ok: false, reason: `task is not blocked: ${taskId}` }

  return { ok: true }
}

function canCancelTask(
  schedule: ScheduleIndex,
  snapshot: StateSnapshot,
  taskId: string,
  actor: string
): { ok: boolean; reason?: string } {
  const node = schedule.nodes.get(taskId)
  if (!node) return { ok: false, reason: `task not found in schedule: ${taskId}` }
  if (node.kind !== 'task') return { ok: false, reason: `cannot cancel non-task node: ${taskId}` }

  const cur = snapshot.tasks[taskId]
  const state = cur?.state ?? 'todo'

  if (state === 'done') return { ok: false, reason: `task already done: ${taskId}` }
  if (state === 'cancelled') return { ok: false, reason: `task already cancelled: ${taskId}` }

  if (state === 'doing' && cur?.last_by !== actor) {
    return {
      ok: false,
      reason: `task is being worked on by another actor: ${cur?.last_by ?? '(unknown)'}`,
    }
  }

  return { ok: true }
}

/* =========================
   CPM / Critical Path
========================= */

function computeCpm(schedule: ScheduleIndex, projectPath: string): CpmResult {
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
      kind: n.kind,
      duration_days: n.duration_days,
      es,
      ef,
      ls: 0,
      lf: 0,
      slack: 0,
      depends_on: n.depends_on,
      schedule_file: n.schedule_file,
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
    generated_at_utc: nowUtcIsoSeconds(),
    project_path: projectPath,
    project_duration_days: projectDuration,
    nodes,
    critical_path: path,
  }
}

function writeCpmFiles(projectPath: string, cpm: CpmResult): void {
  const genDir = join(projectPath, 'generated')
  ensureDir(genDir)

  writeJson(join(genDir, 'cpm.json'), cpm)

  const rows = Object.values(cpm.nodes).sort((a, b) => a.es - b.es || a.id.localeCompare(b.id))
  const lines: string[] = []
  lines.push(`# CPM`)
  lines.push('')
  lines.push(`- generated_at_utc: \`${cpm.generated_at_utc}\``)
  lines.push(`- project_duration_days: \`${cpm.project_duration_days}\``)
  lines.push('')
  lines.push(`| id | kind | dur | ES | EF | LS | LF | slack | depends_on |`)
  lines.push(`|---|---:|---:|---:|---:|---:|---:|---:|---|`)
  for (const r of rows) {
    lines.push(
      `| \`${r.id}\` | ${r.kind} | ${r.duration_days} | ${r.es} | ${r.ef} | ${r.ls} | ${r.lf} | ${r.slack} | ${r.depends_on.join(', ')} |`
    )
  }
  lines.push('')
  writeFileSync(join(genDir, 'cpm.md'), lines.join('\n'), 'utf8')

  const cp: string[] = []
  cp.push(`# Critical Path`)
  cp.push('')
  cp.push(`- generated_at_utc: \`${cpm.generated_at_utc}\``)
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
}

/* =========================
   Schedule diff
========================= */

function normalizeNodeForHash(n: ScheduleNode): any {
  return {
    id: n.id,
    name: n.name ?? '',
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
    generated_at_utc: nowUtcIsoSeconds(),
    project_path: projectPath,
    schedule_files: schedule.files.map(p => basename(p)).sort(),
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
    generated_at_utc: nowUtcIsoSeconds(),
    project_path: cur.project_path,
    added,
    removed,
    changed,
  }
}

function writeScheduleHashAndDiff(projectPath: string, schedule: ScheduleIndex): void {
  const genDir = join(projectPath, 'generated')
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
  lines.push(`- generated_at_utc: \`${diff.generated_at_utc}\``)
  lines.push('')
  lines.push(`## Added`)
  lines.push(diff.added.length ? diff.added.map(x => `- \`${x}\``).join('\n') : '_none_')
  lines.push('')
  lines.push(`## Removed`)
  lines.push(diff.removed.length ? diff.removed.map(x => `- \`${x}\``).join('\n') : '_none_')
  lines.push('')
  lines.push(`## Changed`)
  lines.push(diff.changed.length ? diff.changed.map(x => `- \`${x}\``).join('\n') : '_none_')
  lines.push('')
  writeFileSync(join(genDir, 'schedule-diff.md'), lines.join('\n'), 'utf8')
}

/* =========================
   Generated core
========================= */

function writeGeneratedCore(
  projectPath: string,
  events: { path: string; event: ExecEventV1 }[],
  schedule: ScheduleIndex
): StateSnapshot {
  const genDir = join(projectPath, 'generated')
  ensureDir(genDir)

  const jsonl = events.map(x => JSON.stringify(x.event)).join('\n') + (events.length ? '\n' : '')
  writeFileSync(join(genDir, 'exec.jsonl'), jsonl, 'utf8')

  const snapshot = foldEventsToState(events, schedule, projectPath)
  writeJson(join(genDir, 'state.json'), snapshot)

  const ready = computeReadyIds(schedule, snapshot)
  const lines: string[] = []
  lines.push(`# Ready Tasks`)
  lines.push('')
  lines.push(`- generated_at_utc: \`${nowUtcIsoSeconds()}\``)
  lines.push(`- project_path: \`${projectPath}\``)
  lines.push(`- ready_count: \`${ready.length}\``)
  lines.push('')
  if (!ready.length) lines.push('_No ready tasks._')
  else for (const id of ready) lines.push(`- \`${id}\``)
  lines.push('')
  writeFileSync(join(genDir, 'ready.md'), lines.join('\n'), 'utf8')

  writeJson(join(genDir, 'metadata.json'), {
    generated_at_utc: nowUtcIsoSeconds(),
    project_path: projectPath,
    schedule_files: schedule.files.map(p => basename(p)).sort(),
    event_files_count: events.length,
  })

  return snapshot
}

/* =========================
   Lock
========================= */

function schedulerLockDir(projectPath: string): string {
  return join(projectPath, 'exec', '.locks', 'scheduler.lock')
}

function acquireSchedulerLock(projectPath: string, opts: SchedulerLockOptions): string {
  const lockDir = schedulerLockDir(projectPath)
  const lockParent = resolve(lockDir, '..')
  ensureDir(lockParent)

  const start = Date.now()

  while (true) {
    try {
      mkdirSync(lockDir)
      writeJson(join(lockDir, 'owner.json'), {
        actor: opts.actor,
        pid: process.pid,
        acquired_at_utc: nowUtcIsoSeconds(),
      })
      return lockDir
    } catch (e: any) {
      if (e?.code !== 'EEXIST') throw e

      try {
        const st = statSync(lockDir)
        const ageMs = Date.now() - st.mtimeMs
        if (ageMs > opts.lockStaleMs) {
          rmSync(lockDir, { recursive: true, force: true })
          continue
        }
      } catch {
        continue
      }

      if (Date.now() - start > opts.lockTimeoutMs) {
        let ownerInfo = ''
        try {
          ownerInfo = readFileSync(join(lockDir, 'owner.json'), 'utf8')
        } catch {
          ownerInfo = '(owner metadata unavailable)'
        }
        throw new Error(
          `Failed to acquire scheduler lock within ${opts.lockTimeoutMs} ms.\n` +
            `Lock: ${lockDir}\n` +
            `Owner: ${ownerInfo}`
        )
      }

      sleepMs(200)
    }
  }
}

function releaseSchedulerLock(lockDir: string): void {
  rmSync(lockDir, { recursive: true, force: true })
}

/* =========================
   Scheduler selection
========================= */

function selectNextTask(
  ready: string[],
  cpm: CpmResult | null,
  strategy: 'critical-first' | 'fifo'
): string | null {
  if (ready.length === 0) return null
  if (strategy === 'fifo' || !cpm) return ready[0]

  const candidates = ready.map(id => ({ id, n: cpm.nodes[id] })).filter(x => !!x.n)

  candidates.sort((a, b) => {
    if (a.n.slack !== b.n.slack) return a.n.slack - b.n.slack
    if (a.n.es !== b.n.es) return a.n.es - b.n.es
    return a.id.localeCompare(b.id)
  })

  return candidates[0]?.id ?? ready[0]
}

/* =========================
   CLI
========================= */

function addProjectOptions(cmd: Command): Command {
  return cmd
    .option('--project <projectId>', 'Project id in dojo.config.json (e.g. prj-0001)')
    .option('--project-path <path>', 'Direct path to schedule dir. Overrides --project/env.')
}

function addLockOptions(cmd: Command): Command {
  return cmd
    .option('--allow-multiple-doing', 'Allow this actor to hold multiple doing tasks', false)
    .option('--lock-timeout-ms <ms>', 'Lock acquisition timeout in ms', '10000')
    .option('--lock-stale-ms <ms>', 'Lock stale threshold in ms', '300000')
}

function addCommonAddOptions(cmd: Command): Command {
  addProjectOptions(cmd)
  return cmd
    .requiredOption('--task <taskId>', 'Task/Milestone ID')
    .requiredOption('--by <actor>', 'Actor (human/agent)')
    .requiredOption('--msg <message>', 'Short message')
    .option('--run-id <id>', 'Correlation id')
    .option('--ref <k=v...>', 'refs key=value (repeatable)', collectRepeatable, [])
    .option('--meta <k=v...>', 'meta key=value (repeatable)', collectRepeatable, [])
}

export function registerExecCommands(program: Command): void {
  const exec = program.command('exec').description('Execution helpers')

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
    const cmd = exec.command(t).description(`Write ${t} event JSON into exec/events/ (UTC)`)
    addCommonAddOptions(cmd)

    if (t === 'claim' || t === 'complete' || t === 'block' || t === 'unblock' || t === 'cancel') {
      addLockOptions(cmd)
    }

    if (t === 'claim') {
      cmd.action(opts => {
        let projectPath = ''
        let lockDir = ''
        try {
          projectPath = resolveProjectPath({ projectPath: opts.projectPath, project: opts.project })
          const actor = requireNonEmpty('by', opts.by)
          const taskId = requireNonEmpty('task', opts.task)
          const allowMultipleDoing = !!opts.allowMultipleDoing
          const lockTimeoutMs = Number(opts.lockTimeoutMs)
          const lockStaleMs = Number(opts.lockStaleMs)

          lockDir = acquireSchedulerLock(projectPath, { actor, lockTimeoutMs, lockStaleMs })

          const res = validateAll(projectPath)
          if (!res.ok) {
            printValidateResult(res)
            exitWithCode(false)
            return
          }

          const schedule = buildScheduleIndex(projectPath)
          const events = readAllEventFiles(projectPath)
          const snapshot = foldEventsToState(events, schedule, projectPath)

          const doingTasks = findDoingTasksForActor(snapshot, actor)
          if (!allowMultipleDoing && doingTasks.length > 0) {
            process.stdout.write(
              `Actor ${actor} already has doing task(s): ${doingTasks.join(', ')}\n` +
                `Use --allow-multiple-doing to override.\n`
            )
            exitWithCode(false)
            return
          }

          const claimCheck = canClaimTask(schedule, snapshot, taskId)
          if (!claimCheck.ok) {
            process.stdout.write(`Cannot claim ${taskId}: ${claimCheck.reason}\n`)
            exitWithCode(false)
            return
          }

          const event = buildEvent('claim', opts)
          const out = writeEventFile(projectPath, event)
          process.stdout.write(out + '\n')
          exitWithCode(true)
        } catch (e: any) {
          process.stdout.write(String(e?.message ?? e) + '\n')
          exitWithCode(false)
        } finally {
          if (lockDir) {
            try {
              releaseSchedulerLock(lockDir)
            } catch {}
          }
        }
      })
    } else if (t === 'complete') {
      cmd.action(opts => {
        let projectPath = ''
        let lockDir = ''
        try {
          projectPath = resolveProjectPath({ projectPath: opts.projectPath, project: opts.project })
          const actor = requireNonEmpty('by', opts.by)
          const taskId = requireNonEmpty('task', opts.task)
          const lockTimeoutMs = Number(opts.lockTimeoutMs)
          const lockStaleMs = Number(opts.lockStaleMs)

          lockDir = acquireSchedulerLock(projectPath, { actor, lockTimeoutMs, lockStaleMs })

          const res = validateAll(projectPath)
          if (!res.ok) {
            printValidateResult(res)
            exitWithCode(false)
            return
          }

          const schedule = buildScheduleIndex(projectPath)
          const events = readAllEventFiles(projectPath)
          const snapshot = foldEventsToState(events, schedule, projectPath)

          const completeCheck = canCompleteTask(schedule, snapshot, taskId, actor)
          if (!completeCheck.ok) {
            process.stdout.write(`Cannot complete ${taskId}: ${completeCheck.reason}\n`)
            exitWithCode(false)
            return
          }

          const event = buildEvent('complete', opts)
          const out = writeEventFile(projectPath, event)
          process.stdout.write(out + '\n')
          exitWithCode(true)
        } catch (e: any) {
          process.stdout.write(String(e?.message ?? e) + '\n')
          exitWithCode(false)
        } finally {
          if (lockDir) {
            try {
              releaseSchedulerLock(lockDir)
            } catch {}
          }
        }
      })
    } else if (t === 'block') {
      cmd.action(opts => {
        let projectPath = ''
        let lockDir = ''
        try {
          projectPath = resolveProjectPath({ projectPath: opts.projectPath, project: opts.project })
          const actor = requireNonEmpty('by', opts.by)
          const taskId = requireNonEmpty('task', opts.task)
          const lockTimeoutMs = Number(opts.lockTimeoutMs)
          const lockStaleMs = Number(opts.lockStaleMs)

          lockDir = acquireSchedulerLock(projectPath, { actor, lockTimeoutMs, lockStaleMs })

          const res = validateAll(projectPath)
          if (!res.ok) {
            printValidateResult(res)
            exitWithCode(false)
            return
          }

          const schedule = buildScheduleIndex(projectPath)
          const events = readAllEventFiles(projectPath)
          const snapshot = foldEventsToState(events, schedule, projectPath)

          const blockCheck = canBlockTask(schedule, snapshot, taskId, actor)
          if (!blockCheck.ok) {
            process.stdout.write(`Cannot block ${taskId}: ${blockCheck.reason}\n`)
            exitWithCode(false)
            return
          }

          const event = buildEvent('block', opts)
          const out = writeEventFile(projectPath, event)
          process.stdout.write(out + '\n')
          exitWithCode(true)
        } catch (e: any) {
          process.stdout.write(String(e?.message ?? e) + '\n')
          exitWithCode(false)
        } finally {
          if (lockDir) {
            try {
              releaseSchedulerLock(lockDir)
            } catch {}
          }
        }
      })
    } else if (t === 'unblock') {
      cmd.action(opts => {
        let projectPath = ''
        let lockDir = ''
        try {
          projectPath = resolveProjectPath({ projectPath: opts.projectPath, project: opts.project })
          const actor = requireNonEmpty('by', opts.by)
          const taskId = requireNonEmpty('task', opts.task)
          const lockTimeoutMs = Number(opts.lockTimeoutMs)
          const lockStaleMs = Number(opts.lockStaleMs)

          lockDir = acquireSchedulerLock(projectPath, { actor, lockTimeoutMs, lockStaleMs })

          const res = validateAll(projectPath)
          if (!res.ok) {
            printValidateResult(res)
            exitWithCode(false)
            return
          }

          const schedule = buildScheduleIndex(projectPath)
          const events = readAllEventFiles(projectPath)
          const snapshot = foldEventsToState(events, schedule, projectPath)

          const unblockCheck = canUnblockTask(schedule, snapshot, taskId)
          if (!unblockCheck.ok) {
            process.stdout.write(`Cannot unblock ${taskId}: ${unblockCheck.reason}\n`)
            exitWithCode(false)
            return
          }

          const event = buildEvent('unblock', opts)
          const out = writeEventFile(projectPath, event)
          process.stdout.write(out + '\n')
          exitWithCode(true)
        } catch (e: any) {
          process.stdout.write(String(e?.message ?? e) + '\n')
          exitWithCode(false)
        } finally {
          if (lockDir) {
            try {
              releaseSchedulerLock(lockDir)
            } catch {}
          }
        }
      })
    } else if (t === 'cancel') {
      cmd.action(opts => {
        let projectPath = ''
        let lockDir = ''
        try {
          projectPath = resolveProjectPath({ projectPath: opts.projectPath, project: opts.project })
          const actor = requireNonEmpty('by', opts.by)
          const taskId = requireNonEmpty('task', opts.task)
          const lockTimeoutMs = Number(opts.lockTimeoutMs)
          const lockStaleMs = Number(opts.lockStaleMs)

          lockDir = acquireSchedulerLock(projectPath, { actor, lockTimeoutMs, lockStaleMs })

          const res = validateAll(projectPath)
          if (!res.ok) {
            printValidateResult(res)
            exitWithCode(false)
            return
          }

          const schedule = buildScheduleIndex(projectPath)
          const events = readAllEventFiles(projectPath)
          const snapshot = foldEventsToState(events, schedule, projectPath)

          const cancelCheck = canCancelTask(schedule, snapshot, taskId, actor)
          if (!cancelCheck.ok) {
            process.stdout.write(`Cannot cancel ${taskId}: ${cancelCheck.reason}\n`)
            exitWithCode(false)
            return
          }

          const event = buildEvent('cancel', opts)
          const out = writeEventFile(projectPath, event)
          process.stdout.write(out + '\n')
          exitWithCode(true)
        } catch (e: any) {
          process.stdout.write(String(e?.message ?? e) + '\n')
          exitWithCode(false)
        } finally {
          if (lockDir) {
            try {
              releaseSchedulerLock(lockDir)
            } catch {}
          }
        }
      })
    } else {
      cmd.action(opts => {
        let projectPath = ''
        try {
          projectPath = resolveProjectPath({ projectPath: opts.projectPath, project: opts.project })
        } catch (e: any) {
          process.stdout.write(String(e?.message ?? e) + '\n')
          process.exitCode = 1
          return
        }
        const event = buildEvent(t, opts)
        const out = writeEventFile(projectPath, event)
        process.stdout.write(out + '\n')
      })
    }
  }

  const vcmd = exec.command('validate').description('Validate schedule + events')
  addProjectOptions(vcmd)
  vcmd.action(opts => {
    let projectPath = ''
    try {
      projectPath = resolveProjectPath({ projectPath: opts.projectPath, project: opts.project })
    } catch (e: any) {
      process.stdout.write(String(e?.message ?? e) + '\n')
      process.exitCode = 1
      return
    }
    const res = validateAll(projectPath)
    printValidateResult(res)
    exitWithCode(res.ok)
  })

  const bcmd = exec.command('build').description('Generate all files under generated/')
  addProjectOptions(bcmd)
  bcmd.action(opts => {
    let projectPath = ''
    try {
      projectPath = resolveProjectPath({ projectPath: opts.projectPath, project: opts.project })
    } catch (e: any) {
      process.stdout.write(String(e?.message ?? e) + '\n')
      process.exitCode = 1
      return
    }

    const res = validateAll(projectPath)
    printValidateResult(res)
    if (!res.ok) {
      exitWithCode(false)
      return
    }

    const schedule = buildScheduleIndex(projectPath)
    const events = readAllEventFiles(projectPath)

    writeGeneratedCore(projectPath, events, schedule)
    writeScheduleHashAndDiff(projectPath, schedule)

    const cpm = computeCpm(schedule, projectPath)
    writeCpmFiles(projectPath, cpm)

    process.stdout.write(`\nGenerated: ${join(projectPath, 'generated')}\n`)
    exitWithCode(true)
  })

  const scmd = exec
    .command('scheduler')
    .description('Auto-claim next task safely (with project-level lock).')
  addProjectOptions(scmd)
  scmd.requiredOption('--by <actor>', 'Actor (agent name)')
  scmd.option('--strategy <strategy>', 'critical-first|fifo', 'critical-first')
  scmd.option('--dry-run', 'Do not write; print selected task only', false)
  scmd.option('--msg <message>', 'Claim message', 'auto-claim')
  addLockOptions(scmd)

  scmd.action(opts => {
    let projectPath = ''
    let lockDir = ''
    try {
      projectPath = resolveProjectPath({ projectPath: opts.projectPath, project: opts.project })

      const actor = requireNonEmpty('by', opts.by)
      const strategy = String(opts.strategy) as 'critical-first' | 'fifo'
      const dryRun = !!opts.dryRun
      const msg = String(opts.msg ?? 'auto-claim')
      const allowMultipleDoing = !!opts.allowMultipleDoing
      const lockTimeoutMs = Number(opts.lockTimeoutMs)
      const lockStaleMs = Number(opts.lockStaleMs)

      lockDir = acquireSchedulerLock(projectPath, {
        actor,
        lockTimeoutMs,
        lockStaleMs,
      })

      const res = validateAll(projectPath)
      if (!res.ok) {
        printValidateResult(res)
        exitWithCode(false)
        return
      }

      const schedule = buildScheduleIndex(projectPath)
      const events = readAllEventFiles(projectPath)
      const snapshot = foldEventsToState(events, schedule, projectPath)

      const doingTasks = findDoingTasksForActor(snapshot, actor)
      if (!allowMultipleDoing && doingTasks.length > 0) {
        process.stdout.write(
          `Actor ${actor} already has doing task(s): ${doingTasks.join(', ')}\n` +
            `Use --allow-multiple-doing to override.\n`
        )
        exitWithCode(false)
        return
      }

      const ready = computeReadyIds(schedule, snapshot)

      let cpm: CpmResult | null = null
      try {
        cpm = computeCpm(schedule, projectPath)
      } catch {
        cpm = null
      }

      const next = selectNextTask(ready, cpm, strategy)
      if (!next) {
        process.stdout.write('No ready task to claim.\n')
        exitWithCode(true)
        return
      }

      if (dryRun) {
        process.stdout.write(next + '\n')
        exitWithCode(true)
        return
      }

      const ev: ExecEventV1 = {
        v: 1,
        ts: nowUtcIsoSeconds(),
        type: 'claim',
        task_id: next,
        by: actor,
        msg,
        meta: {
          scheduler_strategy: strategy,
          claimed_via: 'dojo-exec-scheduler',
        },
      }

      const out = writeEventFile(projectPath, ev)
      process.stdout.write(out + '\n')
      exitWithCode(true)
    } catch (e: any) {
      process.stdout.write(String(e?.message ?? e) + '\n')
      exitWithCode(false)
    } finally {
      if (lockDir) {
        try {
          releaseSchedulerLock(lockDir)
        } catch {
          // ignore
        }
      }
    }
  })

  const wcmd = exec.command('where').description('Print resolved paths')
  addProjectOptions(wcmd)
  wcmd.action(opts => {
    const projectPath = resolveProjectPath({ projectPath: opts.projectPath, project: opts.project })
    process.stdout.write(`project-path: ${projectPath}\n`)
    process.stdout.write(`exec/events : ${join(projectPath, 'exec', 'events')}\n`)
    process.stdout.write(`generated   : ${join(projectPath, 'generated')}\n`)
    process.stdout.write(`scheduler-lock: ${schedulerLockDir(projectPath)}\n`)
  })
}
