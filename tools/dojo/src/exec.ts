import { Command } from 'commander'
import {
  acquireSchedulerLock,
  buildEvent,
  canBlockTask,
  canCancelTask,
  canClaimTask,
  canCompleteTask,
  canUnblockTask,
  collectRepeatable,
  computeReadyIds,
  findDoingTasksForActor,
  foldEventsToState,
  readAllEventFiles,
  releaseSchedulerLock,
  schedulerLockPath,
  writeEventFile,
} from './exec-events.js'
import {
  activateResolvedProjectPaths,
  eventsDirForProject,
  generatedDirForProject,
  resolveProjectPaths,
} from './exec-project.js'
import {
  buildScheduleIndex,
  computeCpm,
  exitWithCode,
  printValidateResult,
  selectNextTask,
  validateAll,
  writeCpmFiles,
  writeGeneratedCore,
  writeScheduleHashAndDiff,
} from './exec-schedule.js'
import { ExecEventType, ExecEventV1, SchedulerStrategy } from './exec-types.js'
import { nowUtcIsoSeconds, requireNonEmpty } from './exec-shared.js'

function addProjectOptions(cmd: Command): Command {
  return cmd.option('--project <projectId>', 'Project id in dojo.config.json (e.g. shj-0001)')
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
          const resolvedPaths = resolveProjectPaths({ project: opts.project })
          activateResolvedProjectPaths(resolvedPaths)
          projectPath = resolvedPaths.schedulePath
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
          const resolvedPaths = resolveProjectPaths({ project: opts.project })
          activateResolvedProjectPaths(resolvedPaths)
          projectPath = resolvedPaths.schedulePath
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
          const resolvedPaths = resolveProjectPaths({ project: opts.project })
          activateResolvedProjectPaths(resolvedPaths)
          projectPath = resolvedPaths.schedulePath
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
          const resolvedPaths = resolveProjectPaths({ project: opts.project })
          activateResolvedProjectPaths(resolvedPaths)
          projectPath = resolvedPaths.schedulePath
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
          const resolvedPaths = resolveProjectPaths({ project: opts.project })
          activateResolvedProjectPaths(resolvedPaths)
          projectPath = resolvedPaths.schedulePath
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
          const resolvedPaths = resolveProjectPaths({ project: opts.project })
          activateResolvedProjectPaths(resolvedPaths)
          projectPath = resolvedPaths.schedulePath
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
      const resolvedPaths = resolveProjectPaths({ project: opts.project })
      activateResolvedProjectPaths(resolvedPaths)
      projectPath = resolvedPaths.schedulePath
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
      const resolvedPaths = resolveProjectPaths({ project: opts.project })
      activateResolvedProjectPaths(resolvedPaths)
      projectPath = resolvedPaths.schedulePath
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
    const cpm = computeCpm(schedule, projectPath)

    writeGeneratedCore(projectPath, events, schedule, cpm)
    writeScheduleHashAndDiff(projectPath, schedule)
    writeCpmFiles(projectPath, cpm)

    process.stdout.write(`\nGenerated: ${generatedDirForProject(projectPath)}\n`)
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
      const resolvedPaths = resolveProjectPaths({ project: opts.project })
      activateResolvedProjectPaths(resolvedPaths)
      projectPath = resolvedPaths.schedulePath

      const actor = requireNonEmpty('by', opts.by)
      const strategy = String(opts.strategy) as SchedulerStrategy
      const dryRun = !!opts.dryRun
      const msg = String(opts.msg ?? 'auto-claim')
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

      const ready = computeReadyIds(schedule, snapshot)

      let cpm = null
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
    try {
      const resolvedPaths = resolveProjectPaths({ project: opts.project })
      activateResolvedProjectPaths(resolvedPaths)
      process.stdout.write(`schedule-path: ${resolvedPaths.schedulePath}\n`)
      process.stdout.write(`execution-path: ${resolvedPaths.executionPath}\n`)
      const projectPath = resolvedPaths.schedulePath
      process.stdout.write(`exec/events : ${eventsDirForProject(projectPath)}\n`)
      process.stdout.write(`generated   : ${generatedDirForProject(projectPath)}\n`)
      process.stdout.write(`scheduler-lock: ${schedulerLockPath(projectPath)}\n`)
    } catch (e: any) {
      process.stdout.write(String(e?.message ?? e) + '\n')
      process.exitCode = 1
    }
  })
}
