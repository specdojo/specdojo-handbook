import { Command } from 'commander'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import dotenv from 'dotenv'

export type DojoProjectConfig = {
  schedule_path: string
  execution_path: string
}

export type DojoConfig = {
  version: 1
  projects: Record<string, DojoProjectConfig>
}

export type ConfigLoadResult = {
  configPath: string
  config: DojoConfig | null
}

function findUpward(startDir: string, name: string): string | null {
  let currentDir = resolve(startDir)

  while (true) {
    const candidate = resolve(currentDir, name)
    if (existsSync(candidate)) return candidate

    const parentDir = resolve(currentDir, '..')
    if (parentDir === currentDir) return null
    currentDir = parentDir
  }
}

export function dojoRootDir(): string {
  const configPath = findUpward(process.cwd(), 'dojo.config.json')
  if (configPath) return dirname(configPath)

  const gitMarker = findUpward(process.cwd(), '.git')
  if (gitMarker) return dirname(gitMarker)

  return process.cwd()
}

export function loadEnv(): void {
  // Load .env from the repository root if present.
  // Safe if missing.
  dotenv.config({ path: resolve(dojoRootDir(), '.env') })
}

export function defaultConfigPath(): string {
  return resolve(dojoRootDir(), 'dojo.config.json')
}

export function getProjectSchedulePath(project: DojoProjectConfig): string {
  return project.schedule_path
}

export function getProjectExecutionPath(project: DojoProjectConfig): string {
  return project.execution_path
}

function isValidProjectConfig(project: unknown): project is DojoProjectConfig {
  if (!project || typeof project !== 'object' || Array.isArray(project)) return false

  const candidate = project as { schedule_path?: unknown; execution_path?: unknown }
  if (typeof candidate.schedule_path !== 'string' || candidate.schedule_path.trim().length === 0) {
    return false
  }
  if (
    typeof candidate.execution_path !== 'string' ||
    candidate.execution_path.trim().length === 0
  ) {
    return false
  }
  return true
}

export function loadConfig(): ConfigLoadResult {
  loadEnv()

  const configPath = defaultConfigPath()
  if (!existsSync(configPath)) {
    return { configPath, config: null }
  }

  const raw = readFileSync(configPath, 'utf8')
  const parsed = JSON.parse(raw) as DojoConfig

  if (!parsed || parsed.version !== 1 || typeof parsed.projects !== 'object') {
    throw new Error(`Invalid dojo.config.json: expected { version: 1, projects: { ... } }`)
  }

  for (const [projectId, project] of Object.entries(parsed.projects)) {
    if (!isValidProjectConfig(project)) {
      throw new Error(
        `Invalid dojo.config.json: projects.${projectId} must be { schedule_path, execution_path }`
      )
    }
  }

  return { configPath, config: parsed }
}

export function writeConfig(config: DojoConfig): void {
  const configPath = defaultConfigPath()
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8')
}

export function registerConfigCommands(program: Command): void {
  const cfg = program.command('config').description('Config helpers (dojo.config.json)')

  cfg
    .command('init')
    .description('Create dojo.config.json template (does not overwrite existing)')
    .action(() => {
      const { configPath, config } = loadConfig()
      if (config) {
        process.stdout.write(`Already exists: ${configPath}\n`)
        return
      }
      const template: DojoConfig = {
        version: 1,
        projects: {
          'shj-0001': {
            schedule_path: 'docs/ja/sdh-ja-projects/prj-0001/060-schedule',
            execution_path: 'docs/ja/sdh-ja-projects/prj-0001/070-execution',
          },
        },
      }
      writeConfig(template)
      process.stdout.write(`Created: ${configPath}\n`)
    })
}

export function registerProjectCommands(program: Command): void {
  const pj = program.command('project').description('Project registry commands')

  pj.command('list')
    .description('List projects from dojo.config.json')
    .action(() => {
      const { configPath, config } = loadConfig()
      if (!config) {
        process.stdout.write(`No config found: ${configPath}\n`)
        process.stdout.write(`Run: dojo config init\n`)
        process.exitCode = 1
        return
      }

      const entries = Object.entries(config.projects).sort((a, b) => a[0].localeCompare(b[0]))
      if (entries.length === 0) {
        process.stdout.write(`No projects in ${configPath}\n`)
        return
      }

      for (const [id, project] of entries) {
        const schedulePath = getProjectSchedulePath(project)
        const executionPath = getProjectExecutionPath(project)
        const suffix = executionPath ? `\t${executionPath}` : ''
        process.stdout.write(`${id}\t${schedulePath}${suffix}\n`)
      }
    })
}
