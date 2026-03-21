#!/usr/bin/env node

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { load } from 'js-yaml'

type CpmNode = {
  id: string
  es: number
  ef: number
  ls: number
  lf: number
  slack: number
}

type CpmJson = {
  nodes?: Record<string, CpmNode>
}

type StateJson = {
  tasks?: Record<string, { state?: string }>
}

type CatalogRow = {
  id: string
  kind: 'task' | 'milestone'
  owner: string
  what: string
  dependsOn: string[]
  durationDays: number
  scheduleFile: string
  es: string
  ef: string
  ls: string
  lf: string
  slack: string
  state: string
}

function parseArgs(argv: string[]): { schedulePath: string; executionPath: string } {
  let schedulePath = ''
  let executionPath = ''

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--schedule-path') {
      schedulePath = argv[++i] ?? ''
    } else if (arg === '--execution-path') {
      executionPath = argv[++i] ?? ''
    }
  }

  if (!schedulePath || !executionPath) {
    throw new Error('Usage: gen-task-catalog.ts --schedule-path <path> --execution-path <path>')
  }

  return { schedulePath, executionPath }
}

function listFilesRecursive(dirPath: string): string[] {
  const out: string[] = []
  const names = readdirSync(dirPath)
  for (const name of names) {
    const fullPath = join(dirPath, name)
    const st = statSync(fullPath)
    if (st.isDirectory()) {
      out.push(...listFilesRecursive(fullPath))
    } else {
      out.push(fullPath)
    }
  }
  return out
}

function isScheduleYaml(filePath: string): boolean {
  const base = filePath.split('/').pop() ?? filePath
  const ext = extname(base).toLowerCase()
  if (ext !== '.yaml' && ext !== '.yml') return false
  if (base === 'schedule-defaults.yaml' || base === 'schedule-defaults.yml') return false
  return /^sch-.+\.ya?ml$/i.test(base)
}

function safeString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function toArrayOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map(v => String(v).trim()).filter(Boolean)
}

function cleanupCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim()
}

function pickWhat(task: any): string {
  const notes = safeString(task?.notes)
  const name = safeString(task?.name)
  return notes || name || '-'
}

function toScheduleFile(projectPath: string, filePath: string): string {
  const normalizedProject = projectPath.endsWith('/') ? projectPath : `${projectPath}/`
  if (filePath.startsWith(normalizedProject)) return filePath.slice(normalizedProject.length)
  return filePath
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as T
  } catch {
    return fallback
  }
}

function buildRows(schedulePath: string, generatedDir: string): CatalogRow[] {
  const cpm = readJsonFile<CpmJson>(join(generatedDir, 'cpm.json'), {})
  const state = readJsonFile<StateJson>(join(generatedDir, 'state.json'), {})

  const cpmById = cpm.nodes ?? {}
  const stateById = state.tasks ?? {}

  const files = listFilesRecursive(schedulePath)
    .filter(isScheduleYaml)
    .sort((a, b) => a.localeCompare(b))
  const rows: CatalogRow[] = []

  for (const filePath of files) {
    let doc: any
    try {
      doc = load(readFileSync(filePath, 'utf8'))
    } catch {
      continue
    }
    const tasks = Array.isArray(doc?.tasks) ? doc.tasks : []
    const milestones = Array.isArray(doc?.milestones) ? doc.milestones : []

    for (const t of tasks) {
      const id = safeString(t?.id)
      if (!id) continue
      const cpmNode = cpmById[id]
      rows.push({
        id,
        kind: 'task',
        owner: safeString(t?.owner) || '-',
        what: pickWhat(t),
        dependsOn: toArrayOfStrings(t?.depends_on),
        durationDays: typeof t?.duration_days === 'number' ? t.duration_days : 0,
        scheduleFile: toScheduleFile(schedulePath, filePath),
        es: cpmNode ? String(cpmNode.es) : '-',
        ef: cpmNode ? String(cpmNode.ef) : '-',
        ls: cpmNode ? String(cpmNode.ls) : '-',
        lf: cpmNode ? String(cpmNode.lf) : '-',
        slack: cpmNode ? String(cpmNode.slack) : '-',
        state: stateById[id]?.state ?? 'todo',
      })
    }

    for (const m of milestones) {
      const id = safeString(m?.id)
      if (!id) continue
      const cpmNode = cpmById[id]
      rows.push({
        id,
        kind: 'milestone',
        owner: safeString(m?.owner) || '-',
        what: pickWhat(m),
        dependsOn: toArrayOfStrings(m?.depends_on),
        durationDays: 0,
        scheduleFile: toScheduleFile(schedulePath, filePath),
        es: cpmNode ? String(cpmNode.es) : '-',
        ef: cpmNode ? String(cpmNode.ef) : '-',
        ls: cpmNode ? String(cpmNode.ls) : '-',
        lf: cpmNode ? String(cpmNode.lf) : '-',
        slack: cpmNode ? String(cpmNode.slack) : '-',
        state: stateById[id]?.state ?? 'todo',
      })
    }
  }

  rows.sort((a, b) => {
    if (a.scheduleFile !== b.scheduleFile) return a.scheduleFile.localeCompare(b.scheduleFile)
    return a.id.localeCompare(b.id)
  })

  return rows
}

function buildMarkdown(rows: CatalogRow[]): string {
  const lines: string[] = []
  lines.push('# Task Catalog')
  lines.push('')
  lines.push('Generated by `dojo exec build`. Human-readable summary of schedule tasks.')
  lines.push('')
  lines.push(`- total_items: \`${rows.length}\``)
  lines.push('')
  lines.push(
    '| id | kind | owner | what | depends_on | dur | ES | EF | LS | LF | slack | state | schedule_file |'
  )
  lines.push('|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---|---|')

  for (const r of rows) {
    lines.push(
      `| \`${cleanupCell(r.id)}\` | ${r.kind} | ${cleanupCell(r.owner)} | ${cleanupCell(r.what)} | ${cleanupCell(r.dependsOn.join(', ')) || '-'} | ${r.durationDays} | ${r.es} | ${r.ef} | ${r.ls} | ${r.lf} | ${r.slack} | ${cleanupCell(r.state)} | ${cleanupCell(r.scheduleFile)} |`
    )
  }

  lines.push('')
  return lines.join('\n')
}

function main(): void {
  const { schedulePath, executionPath } = parseArgs(process.argv)
  const generatedDir = join(executionPath, 'generated')
  const rows = buildRows(schedulePath, generatedDir)
  const outPath = join(generatedDir, 'task-catalog.md')
  writeFileSync(outPath, buildMarkdown(rows), 'utf8')
  process.stdout.write(`Generated: ${outPath}\n`)
}

main()
