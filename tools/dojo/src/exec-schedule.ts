import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import {
  ClaimNextSnapshot,
  CpmNode,
  CpmResult,
  ExecState,
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
  formatDateOnlyUtc,
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

function scheduleAnchorDateUtc(): number {
  return Date.UTC(2000, 0, 1, 0, 0, 0, 0)
}

function workingMinutesPerDay(calendar: ScheduleCalendar): number {
  return Math.max(1, Math.round(calendar.work_hours_per_day * 60))
}

function endOfWorkingDayUtc(dt: Date, calendar: ScheduleCalendar): Date {
  const end = new Date(dt.getTime())
  end.setUTCHours(0, 0, 0, 0)
  end.setUTCMinutes(workingMinutesPerDay(calendar))
  return end
}

function isWorkingDateUtc(dt: Date, calendar: ScheduleCalendar): boolean {
  const dateOnly = formatDateOnlyUtc(dt)
  return calendar.workdays.has(dt.getUTCDay()) && !calendar.holidays.has(dateOnly)
}

function advanceToNextWorkingInstantUtc(dt: Date, calendar: ScheduleCalendar): void {
  while (true) {
    if (!isWorkingDateUtc(dt, calendar)) {
      dt.setUTCDate(dt.getUTCDate() + 1)
      dt.setUTCHours(0, 0, 0, 0)
      continue
    }

    const minutesFromStart = dt.getUTCHours() * 60 + dt.getUTCMinutes()
    if (minutesFromStart >= workingMinutesPerDay(calendar)) {
      dt.setUTCDate(dt.getUTCDate() + 1)
      dt.setUTCHours(0, 0, 0, 0)
      continue
    }

    return
  }
}

function addWorkingDayOffset(
  startDate: string,
  dayOffset: number,
  calendar: ScheduleCalendar
): Date {
  const [year, month, day] = startDate.split('-').map(Number)
  const dt = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))

  advanceToNextWorkingInstantUtc(dt, calendar)

  let remainingMinutes = Math.round(dayOffset * workingMinutesPerDay(calendar))
  while (remainingMinutes > 0) {
    advanceToNextWorkingInstantUtc(dt, calendar)

    const workingDayEnd = endOfWorkingDayUtc(dt, calendar)

    const usableMinutes = Math.round((workingDayEnd.getTime() - dt.getTime()) / (60 * 1000))
    if (remainingMinutes < usableMinutes) {
      dt.setUTCMinutes(dt.getUTCMinutes() + remainingMinutes)
      remainingMinutes = 0
      break
    }

    dt.setTime(workingDayEnd.getTime())
    remainingMinutes -= usableMinutes
  }

  advanceToNextWorkingInstantUtc(dt, calendar)
  return dt
}

type WorkingTaskSegment = {
  start: Date
  end: Date
}

function buildWorkingTaskSegments(
  startDate: string,
  startOffset: number,
  durationDays: number,
  calendar: ScheduleCalendar
): WorkingTaskSegment[] {
  const cursor = addWorkingDayOffset(startDate, startOffset, calendar)
  let remainingMinutes = Math.round(durationDays * workingMinutesPerDay(calendar))
  const segments: WorkingTaskSegment[] = []

  while (remainingMinutes > 0) {
    advanceToNextWorkingInstantUtc(cursor, calendar)

    const workingDayEnd = endOfWorkingDayUtc(cursor, calendar)

    const usableMinutes = Math.round((workingDayEnd.getTime() - cursor.getTime()) / (60 * 1000))
    const segmentMinutes = Math.min(remainingMinutes, usableMinutes)
    const segmentStart = new Date(cursor.getTime())
    const segmentEnd = new Date(cursor.getTime())
    segmentEnd.setUTCMinutes(segmentEnd.getUTCMinutes() + segmentMinutes)

    segments.push({ start: segmentStart, end: segmentEnd })

    cursor.setTime(segmentEnd.getTime())
    remainingMinutes -= segmentMinutes
  }

  return segments
}
function xmlEscape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function timelineAnchorDate(startDate: string | null): Date {
  if (!startDate) return new Date(scheduleAnchorDateUtc())
  const [year, month, day] = startDate.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

function dateForWorkingOffset(
  dayOffset: number,
  startDate: string | null,
  calendar: ScheduleCalendar
): Date {
  return startDate
    ? addWorkingDayOffset(startDate, dayOffset, calendar)
    : new Date(
        scheduleAnchorDateUtc() + Math.round(dayOffset * workingMinutesPerDay(calendar)) * 60 * 1000
      )
}

function dayLabelUtc(dt: Date): string {
  const mm = (dt.getUTCMonth() + 1).toString().padStart(2, '0')
  const dd = dt.getUTCDate().toString().padStart(2, '0')
  return `${mm}/${dd}`
}

function timelineDayIndex(dt: Date, timelineStart: Date): number {
  const midnight = new Date(dt.getTime())
  midnight.setUTCHours(0, 0, 0, 0)
  return Math.floor((midnight.getTime() - timelineStart.getTime()) / 86400000)
}

function timelinePositionX(
  dt: Date,
  timelineStart: Date,
  calendar: ScheduleCalendar,
  dayWidth: number
): number {
  const dayIndex = timelineDayIndex(dt, timelineStart)
  const minutesFromMidnight = dt.getUTCHours() * 60 + dt.getUTCMinutes()
  const relative = Math.max(0, Math.min(1, minutesFromMidnight / workingMinutesPerDay(calendar)))
  return (dayIndex + relative) * dayWidth
}

function stateColor(state: ExecState | 'milestone', critical: boolean): string {
  if (state === 'milestone') return '#b45309'
  if (state === 'done') return '#16a34a'
  if (state === 'doing') return '#2563eb'
  if (state === 'blocked') return '#f59e0b'
  if (state === 'cancelled') return '#6b7280'
  if (critical) return '#dc2626'
  return '#d1d5db'
}

function buildTimelineSvg(
  cpm: CpmResult,
  schedule: ScheduleIndex,
  stateSnapshot?: StateSnapshot
): string {
  const rows = Object.values(cpm.nodes).sort((a, b) => a.es - b.es || a.id.localeCompare(b.id))
  const criticalSet = new Set(cpm.critical_path)
  const leftPad = 380
  const topPad = 108
  const bottomPad = 32
  const rowHeight = 24
  const sectionHeight = 30
  const sectionGap = 8
  const dayWidth = 56
  const timelineStart = timelineAnchorDate(cpm.project_start_date)

  const rowsByFile = new Map<string, CpmNode[]>()
  for (const row of rows) {
    const group = rowsByFile.get(row.schedule_file)
    if (group) group.push(row)
    else rowsByFile.set(row.schedule_file, [row])
  }

  const taskSegments = new Map<string, WorkingTaskSegment[]>()
  let timelineEnd = new Date(timelineStart.getTime())
  for (const row of rows) {
    if (row.kind === 'task') {
      const segments = cpm.project_start_date
        ? buildWorkingTaskSegments(
            cpm.project_start_date,
            row.es,
            row.duration_days,
            schedule.calendar
          )
        : [
            {
              start: dateForWorkingOffset(row.es, cpm.project_start_date, schedule.calendar),
              end: dateForWorkingOffset(row.ef, cpm.project_start_date, schedule.calendar),
            },
          ]
      taskSegments.set(row.id, segments)
      const end = segments[segments.length - 1]?.end
      if (end && end > timelineEnd) timelineEnd = end
      continue
    }

    const milestoneAt = dateForWorkingOffset(row.es, cpm.project_start_date, schedule.calendar)
    if (milestoneAt > timelineEnd) timelineEnd = milestoneAt
  }

  const totalDays = Math.max(
    1,
    Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / 86400000) + 1
  )
  const chartWidth = totalDays * dayWidth
  const width = leftPad + chartWidth + 40

  const layoutRows: Array<{ type: 'section'; label: string } | { type: 'node'; row: CpmNode }> = []
  for (const [scheduleFile, fileRows] of rowsByFile.entries()) {
    layoutRows.push({
      type: 'section',
      label: schedule.section_labels[scheduleFile] ?? scheduleFile,
    })
    for (const row of fileRows) layoutRows.push({ type: 'node', row })
  }

  const height =
    topPad +
    layoutRows.reduce(
      (sum, entry) => sum + (entry.type === 'section' ? sectionHeight + sectionGap : rowHeight),
      0
    ) +
    bottomPad

  const parts: string[] = []
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="プロジェクトタイムライン">`
  )
  parts.push(`<style>
    text { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #1f2937; }
    .title { font-size: 18px; font-weight: 700; fill: #0f172a; }
    .caption { font-size: 11px; fill: #64748b; }
    .section { font-size: 13px; font-weight: 700; fill: #0f172a; }
    .label { font-size: 12px; font-weight: 500; }
    .axis { font-size: 11px; fill: #475569; }
    .grid { stroke: #d7dee7; stroke-width: 1; }
    .row-grid { stroke: #edf2f7; stroke-width: 1; }
    .shade { fill: #f8fafc; }
    .holiday { fill: #eff6ff; }
    .legend-label { font-size: 11px; fill: #475569; }
  </style>`)
  parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="#fffdf8" />`)
  parts.push(`<rect x="0" y="0" width="${leftPad}" height="${height}" fill="#fffaf0" />`)
  parts.push(
    `<rect x="${leftPad}" y="0" width="${chartWidth + 40}" height="${height}" fill="#ffffff" />`
  )
  parts.push(`<text class="title" x="16" y="28">プロジェクトタイムライン</text>`)
  parts.push(
    `<text class="caption" x="16" y="48">1 タスク 1 行で表示します。1 日の長さは ${schedule.calendar.work_hours_per_day} 時間で、休日と週末は空白のままとし、次の稼働日に作業を再開します。</text>`
  )
  parts.push(`<rect x="0" y="${topPad - 36}" width="${width}" height="28" fill="#fff7ed" />`)

  const legendY = 74
  const legend = [
    { label: 'todo', color: '#d1d5db' },
    { label: 'doing', color: '#2563eb' },
    { label: 'done', color: '#16a34a' },
    { label: 'blocked', color: '#f59e0b' },
    { label: 'critical', color: '#dc2626' },
  ]
  let legendX = 16
  for (const item of legend) {
    parts.push(
      `<rect x="${legendX}" y="${legendY - 10}" width="14" height="14" rx="3" fill="${item.color}" />`
    )
    parts.push(
      `<text class="legend-label" x="${legendX + 20}" y="${legendY + 4}">${xmlEscape(item.label)}</text>`
    )
    legendX += 76
  }
  parts.push(`<rect x="${legendX}" y="${legendY - 10}" width="14" height="14" fill="#eff6ff" />`)
  parts.push(`<text class="legend-label" x="${legendX + 20}" y="${legendY + 4}">holiday</text>`)
  legendX += 90
  parts.push(
    `<rect x="${legendX}" y="${legendY - 10}" width="14" height="14" fill="#f8fafc" stroke="#d7dee7" />`
  )
  parts.push(`<text class="legend-label" x="${legendX + 20}" y="${legendY + 4}">weekend</text>`)

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
    const dayStart = new Date(timelineStart.getTime() + dayIndex * 86400000)
    const x = leftPad + dayIndex * dayWidth
    const isWorking = isWorkingDateUtc(dayStart, schedule.calendar)
    if (!isWorking) {
      const shadeClass = schedule.calendar.holidays.has(formatDateOnlyUtc(dayStart))
        ? 'holiday'
        : 'shade'
      parts.push(
        `<rect class="${shadeClass}" x="${x}" y="${topPad - 20}" width="${dayWidth}" height="${height - topPad}" />`
      )
    }
    parts.push(
      `<line class="grid" x1="${x}" y1="${topPad - 20}" x2="${x}" y2="${height - bottomPad}" />`
    )
    parts.push(
      `<text class="axis" x="${x + 6}" y="${topPad - 18}">${xmlEscape(dayLabelUtc(dayStart))}</text>`
    )
  }
  parts.push(
    `<line class="grid" x1="${leftPad + chartWidth}" y1="${topPad - 20}" x2="${leftPad + chartWidth}" y2="${height - bottomPad}" />`
  )

  let currentY = topPad
  for (const entry of layoutRows) {
    if (entry.type === 'section') {
      parts.push(
        `<rect x="0" y="${currentY - 18}" width="${width}" height="${sectionHeight}" fill="#f1f5f9" />`
      )
      parts.push(`<text class="section" x="16" y="${currentY}">${xmlEscape(entry.label)}</text>`)
      parts.push(
        `<line class="grid" x1="0" y1="${currentY + 8}" x2="${width}" y2="${currentY + 8}" />`
      )
      currentY += sectionHeight + sectionGap
      continue
    }

    const row = entry.row
    const rowTop = currentY - 14
    const rowMid = currentY - 2
    const taskState =
      row.kind === 'task' ? (stateSnapshot?.tasks[row.id]?.state ?? 'todo') : 'milestone'
    const fill = stateColor(taskState, criticalSet.has(row.id))
    const label = row.name ? `${row.id} ${row.name}` : row.id

    parts.push(`<text class="label" x="16" y="${currentY}">${xmlEscape(label)}</text>`)
    parts.push(
      `<line class="row-grid" x1="0" y1="${currentY + 8}" x2="${width}" y2="${currentY + 8}" />`
    )

    if (row.kind === 'task') {
      const segments = taskSegments.get(row.id) ?? []
      for (const segment of segments) {
        const startX =
          leftPad + timelinePositionX(segment.start, timelineStart, schedule.calendar, dayWidth)
        const endX =
          leftPad + timelinePositionX(segment.end, timelineStart, schedule.calendar, dayWidth)
        const widthPx = Math.max(2, endX - startX)
        const stroke = criticalSet.has(row.id)
          ? '#991b1b'
          : taskState === 'todo'
            ? '#9ca3af'
            : taskState === 'blocked'
              ? '#b45309'
              : '#334155'
        parts.push(
          `<rect x="${startX}" y="${rowTop}" width="${widthPx}" height="12" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${criticalSet.has(row.id) ? 1.25 : 0.75}" opacity="0.94" />`
        )
      }
    } else {
      const at = dateForWorkingOffset(row.es, cpm.project_start_date, schedule.calendar)
      const cx = leftPad + timelinePositionX(at, timelineStart, schedule.calendar, dayWidth)
      parts.push(
        `<polygon points="${cx},${rowMid - 7} ${cx + 7},${rowMid} ${cx},${rowMid + 7} ${cx - 7},${rowMid}" fill="${fill}" />`
      )
    }

    currentY += rowHeight
  }

  parts.push(`</svg>`)
  return parts.join('\n')
}

function buildTimelineMarkdown(
  cpm: CpmResult,
  summary: {
    criticalPathTaskCount: number
    progressPercent: string
    doneTasks: string
    taskStateCounts: string
    progressSummaryLines: string[]
  }
): string {
  const lines: string[] = []
  lines.push(`# タイムライン`)
  lines.push('')
  lines.push(...summary.progressSummaryLines)
  lines.push(`- schedule_path: \`${cpm.schedule_path}\``)
  if (cpm.project_start_date) lines.push(`- project_start_date: \`${cpm.project_start_date}\``)
  lines.push(`- project_duration_days: \`${cpm.project_duration_days}\``)
  lines.push(`- scope: \`full_schedule\``)
  lines.push(`- critical_path_task_count: \`${summary.criticalPathTaskCount}\``)
  lines.push(`- progress_percent: \`${summary.progressPercent}%\``)
  lines.push(`- done_tasks: \`${summary.doneTasks}\``)
  lines.push(`- task_state_counts: \`${summary.taskStateCounts}\``)
  lines.push('')
  lines.push(`![プロジェクトタイムライン](./timeline.svg)`)
  lines.push('')
  return lines.join('\n')
}

function parseDateOnlyUtc(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

function addUtcDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 86400000)
}

function elapsedWorkingDaysUntil(
  today: Date,
  startDate: string,
  calendar: ScheduleCalendar
): number {
  const start = parseDateOnlyUtc(startDate)
  const current = parseDateOnlyUtc(formatDateOnlyUtc(today))
  if (current <= start) return 0

  let elapsed = 0
  for (let cursor = new Date(start.getTime()); cursor < current; cursor = addUtcDays(cursor, 1)) {
    if (isWorkingDateUtc(cursor, calendar)) elapsed += 1
  }
  return elapsed
}

function buildProgressSummaryLines(input: {
  cpm: CpmResult
  schedule: ScheduleIndex
  stateCounts: Record<'todo' | 'doing' | 'blocked' | 'done' | 'cancelled', number>
  totalTaskCount: number
  readyCount: number
  nextTaskId: string | null
  criticalDoingCount: number
}): string[] {
  const lines: string[] = []
  const today = new Date()
  const todayLabel = formatDateOnlyUtc(today)
  const doneEquivalent = input.stateCounts.done + input.stateCounts.doing * 0.5
  const actualPercent = input.totalTaskCount > 0 ? (doneEquivalent / input.totalTaskCount) * 100 : 0

  let status = '要確認'
  let overview = '開始日または進捗比較に必要な情報が不足しています。'
  let cause = '開始日未設定のため、計画との差分を自動判定できません。'
  let actions = ['プロジェクト開始日を設定し、進捗判定条件を確定してください。']

  if (input.cpm.project_start_date) {
    const start = parseDateOnlyUtc(input.cpm.project_start_date)
    const todayDate = parseDateOnlyUtc(todayLabel)

    if (todayDate < start) {
      if (input.stateCounts.doing > 0 || input.stateCounts.done > 0) {
        status = '前倒しで進行中'
        overview = `${todayLabel} 時点では計画開始日 ${input.cpm.project_start_date} 前ですが、先行着手が進んでいます。`
        cause = `開始日前のため本来の進捗遅れはなく、doing ${input.stateCounts.doing} 件で先行準備が進んでいます。`
        actions = [
          '進行中タスクを完了させ、開始日までにクリティカルパスの先頭を空けてください。',
          input.nextTaskId
            ? `次の着手候補 ${input.nextTaskId} の前提条件を開始日までに確認してください。`
            : '開始日までに次の着手候補と担当を確定してください。',
        ]
      } else {
        status = '開始前'
        overview = `${todayLabel} 時点では計画開始日 ${input.cpm.project_start_date} 前です。`
        cause = '未着手でも計画上の遅れではなく、まだ実行開始タイミングに入っていません。'
        actions = [
          '開始日に着手できるように担当者と実行順序を最終確認してください。',
          input.nextTaskId
            ? `最初の着手候補 ${input.nextTaskId} に必要な入力・レビュー観点を事前に揃えてください。`
            : '開始時点の最初の着手候補を確定してください。',
        ]
      }
    } else {
      const expectedPercent = Math.min(
        100,
        (elapsedWorkingDaysUntil(today, input.cpm.project_start_date, input.schedule.calendar) /
          Math.max(1, input.cpm.project_duration_days)) *
          100
      )

      if (input.stateCounts.blocked > 0 || actualPercent + 10 < expectedPercent) {
        status = '遅れ気味'
        overview = `${todayLabel} 時点の実績進捗は ${actualPercent.toFixed(1)}% 相当で、計画進捗 ${expectedPercent.toFixed(1)}% を下回っています。`
        cause =
          input.stateCounts.blocked > 0
            ? `blocked が ${input.stateCounts.blocked} 件あり、滞留が進捗を押し下げています。`
            : `完了・進行中件数が計画消化ペースに対して不足しています。`
        actions = [
          input.stateCounts.blocked > 0
            ? 'blocked タスクの解消担当と期限を直ちに決めてください。'
            : 'クリティカルパス上の進行中タスクを優先完了させてください。',
          input.nextTaskId
            ? `次の着手候補 ${input.nextTaskId} を前倒しで着手できるか確認してください。`
            : 'Ready タスクが不足していないか依存関係と完了登録を確認してください。',
        ]
      } else {
        status = '順調'
        overview = `${todayLabel} 時点の実績進捗は ${actualPercent.toFixed(1)}% 相当で、計画進捗 ${expectedPercent.toFixed(1)}% に対して大きな遅れはありません。`
        cause =
          input.criticalDoingCount > 0
            ? `クリティカルパス上のタスクが ${input.criticalDoingCount} 件進行中で、主要経路の作業が継続しています。`
            : `blocked がなく、Ready タスク ${input.readyCount} 件を維持できています。`
        actions = [
          '進行中タスクの完了登録を遅らせず、実績状態を最新化してください。',
          input.nextTaskId
            ? `次の着手候補 ${input.nextTaskId} を待たせないよう、依存完了の確認を継続してください。`
            : 'Ready タスクを切らさないよう、後続依存の完了条件を継続確認してください。',
        ]
      }
    }
  }

  lines.push(`## 進捗サマリー`)
  lines.push('')
  lines.push(`- 判定: ${status}`)
  lines.push(`- 概況: ${overview}`)
  lines.push(`- 主な要因: ${cause}`)
  lines.push('')
  lines.push(`## 今後のアクション案`)
  lines.push('')
  actions.forEach((action, index) => lines.push(`${index + 1}. ${action}`))
  lines.push('')
  return lines
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
