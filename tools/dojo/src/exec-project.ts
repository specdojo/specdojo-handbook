import { dirname, join, resolve } from 'node:path'
import {
  defaultConfigPath,
  getProjectExecutionPath,
  getProjectSchedulePath,
  loadConfig,
  loadEnv,
} from './dojo-config.js'
import { ResolvedProjectPaths } from './exec-types.js'

function projectBaseDir(): string {
  const { configPath } = loadConfig()
  return dirname(configPath || defaultConfigPath())
}

function resolveProjectRelative(baseDir: string, pathValue: string): string {
  return resolve(baseDir, pathValue.trim())
}

export function activateResolvedProjectPaths(paths: ResolvedProjectPaths): void {
  process.env.DOJO_SCHEDULE_PATH = paths.schedulePath
  process.env.DOJO_EXECUTION_PATH = paths.executionPath
}

export function executionRootForProject(projectPath: string): string {
  loadEnv()
  const baseDir = projectBaseDir()

  const envSchedulePath = process.env.DOJO_SCHEDULE_PATH
  const envExecutionPath = process.env.DOJO_EXECUTION_PATH
  if (
    envSchedulePath &&
    envSchedulePath.trim() &&
    envExecutionPath &&
    envExecutionPath.trim() &&
    resolveProjectRelative(baseDir, envSchedulePath) === projectPath
  ) {
    return resolveProjectRelative(baseDir, envExecutionPath)
  }

  const { config } = loadConfig()
  if (config) {
    for (const project of Object.values(config.projects)) {
      const schedulePath = resolveProjectRelative(baseDir, getProjectSchedulePath(project))
      if (schedulePath !== projectPath) continue

      return resolveProjectRelative(baseDir, getProjectExecutionPath(project))
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
  const { config, configPath } = loadConfig()
  const baseDir = dirname(configPath)

  const envSchedulePath = process.env.DOJO_SCHEDULE_PATH
  const envExecutionPath = process.env.DOJO_EXECUTION_PATH
  const envProject = process.env.DOJO_PROJECT

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
      schedulePath: resolveProjectRelative(baseDir, getProjectSchedulePath(project)),
      executionPath: resolveProjectRelative(baseDir, getProjectExecutionPath(project)),
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
      schedulePath: resolveProjectRelative(baseDir, envSchedulePath),
      executionPath: resolveProjectRelative(baseDir, envExecutionPath),
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
