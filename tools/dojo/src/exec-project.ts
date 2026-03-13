import { resolve, join } from 'node:path'
import {
  getProjectExecutionPath,
  getProjectSchedulePath,
  loadConfig,
  loadEnv,
} from './dojo-config.js'
import { ResolvedProjectPaths } from './exec-types.js'

export function activateResolvedProjectPaths(paths: ResolvedProjectPaths): void {
  process.env.DOJO_SCHEDULE_PATH = paths.schedulePath
  process.env.DOJO_EXECUTION_PATH = paths.executionPath
}

export function executionRootForProject(projectPath: string): string {
  loadEnv()

  const envSchedulePath = process.env.DOJO_SCHEDULE_PATH
  const envExecutionPath = process.env.DOJO_EXECUTION_PATH
  if (
    envSchedulePath &&
    envSchedulePath.trim() &&
    envExecutionPath &&
    envExecutionPath.trim() &&
    resolve(process.cwd(), envSchedulePath.trim()) === projectPath
  ) {
    return resolve(process.cwd(), envExecutionPath.trim())
  }

  const { config } = loadConfig()
  if (config) {
    for (const project of Object.values(config.projects)) {
      const schedulePath = resolve(process.cwd(), getProjectSchedulePath(project))
      if (schedulePath !== projectPath) continue

      return resolve(process.cwd(), getProjectExecutionPath(project).trim())
    }
  }

  throw new Error(
    `Execution path not specified for schedule path: ${projectPath}\n` +
      `Provide --project <id>, or DOJO_PROJECT, or DOJO_SCHEDULE_PATH together with DOJO_EXECUTION_PATH.`
  )
}

export function generatedDirForProject(projectPath: string): string {
  return join(executionRootForProject(projectPath), 'generated')
}

export function eventsDirForProject(projectPath: string): string {
  return join(executionRootForProject(projectPath), 'exec', 'events')
}

export function resolveProjectPaths(opts: { project?: string }): ResolvedProjectPaths {
  loadEnv()

  const envSchedulePath = process.env.DOJO_SCHEDULE_PATH
  const envExecutionPath = process.env.DOJO_EXECUTION_PATH
  const envProject = process.env.DOJO_PROJECT

  const { config, configPath } = loadConfig()

  function fromProjectId(
    projectId: string,
    source: '--project' | 'DOJO_PROJECT'
  ): ResolvedProjectPaths {
    if (!config) {
      throw new Error(
        `${source} requires dojo.config.json: ${configPath}\n` +
          `Define the project id there, or use DOJO_SCHEDULE_PATH/DOJO_EXECUTION_PATH.`
      )
    }
    const project = config.projects[projectId]
    if (!project) {
      throw new Error(`Unknown ${source} value: ${projectId} (check ${configPath})`)
    }
    return {
      schedulePath: resolve(process.cwd(), getProjectSchedulePath(project)),
      executionPath: resolve(process.cwd(), getProjectExecutionPath(project)),
    }
  }

  if (opts.project && opts.project.trim()) {
    return fromProjectId(opts.project.trim(), '--project')
  }

  if (
    (envSchedulePath && envSchedulePath.trim()) ||
    (envExecutionPath && envExecutionPath.trim())
  ) {
    if (
      !envSchedulePath ||
      !envSchedulePath.trim() ||
      !envExecutionPath ||
      !envExecutionPath.trim()
    ) {
      throw new Error(
        `DOJO_SCHEDULE_PATH and DOJO_EXECUTION_PATH must be specified together when using direct environment path overrides.`
      )
    }
    return {
      schedulePath: resolve(process.cwd(), envSchedulePath.trim()),
      executionPath: resolve(process.cwd(), envExecutionPath.trim()),
    }
  }

  if (envProject && envProject.trim()) {
    return fromProjectId(envProject.trim(), 'DOJO_PROJECT')
  }

  throw new Error(
    `Project path not specified.\n` +
      `Provide --project <id>, or DOJO_PROJECT, or DOJO_SCHEDULE_PATH together with DOJO_EXECUTION_PATH.\n` +
      `DOJO_PROJECT must match a project id in ${configPath}.`
  )
}
