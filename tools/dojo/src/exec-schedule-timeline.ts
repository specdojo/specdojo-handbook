import {
  CpmNode,
  CpmResult,
  ExecState,
  ScheduleCalendar,
  ScheduleIndex,
  StateSnapshot,
} from './exec-types.js'
import { formatDateOnlyUtc } from './exec-shared.js'

type WorkingTaskSegment = {
  start: Date
  end: Date
}

export type ProgressSummaryInput = {
  cpm: CpmResult
  schedule: ScheduleIndex
  stateCounts: Record<'todo' | 'doing' | 'blocked' | 'done' | 'cancelled', number>
  totalTaskCount: number
  readyCount: number
  nextTaskId: string | null
  criticalDoingCount: number
}

export type TimelineMarkdownSummary = {
  criticalPathTaskCount: number
  progressPercent: string
  doneTasks: string
  taskStateCounts: string
  progressSummaryLines: string[]
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

export function buildTimelineSvg(
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

export function buildTimelineMarkdown(cpm: CpmResult, summary: TimelineMarkdownSummary): string {
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

export function buildProgressSummaryLines(input: ProgressSummaryInput): string[] {
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
