const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { load } = require('js-yaml')
const Ajv2020 = require('ajv/dist/2020').default

const DEFAULT_SCHEMAS = {
  deliverables: 'docs/shared/schemas/deliverable-frontmatter.schema.yaml',
  rulebook: 'docs/shared/schemas/rulebook-frontmatter.schema.yaml',
  instruction: 'docs/shared/schemas/instruction-frontmatter.schema.yaml',
}

const validatorCache = new Map()

function toPosix(p) {
  return p.split(path.sep).join('/')
}

function decodePointerToken(token) {
  return token.replace(/~1/g, '/').replace(/~0/g, '~')
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findKeyLine(frontmatterBody, key) {
  if (!key) return 2
  const lines = frontmatterBody.split(/\r?\n/)
  const matcher = new RegExp(`^\\s*${escapeRegExp(key)}\\s*:`)
  const index = lines.findIndex(line => matcher.test(line))
  return index >= 0 ? index + 2 : 2
}

function selectSchemaPath(relativePath, schemas) {
  const filePath = toPosix(relativePath || '')
  if (!filePath.startsWith('docs/')) return null
  if (filePath.startsWith('docs/ja/handbook/rulebooks/')) {
    return schemas.rulebook
  }
  if (filePath.startsWith('docs/ja/handbook/instructions/')) {
    return schemas.instruction
  }
  if (filePath.endsWith('.md') || filePath.endsWith('.mdx')) {
    return schemas.deliverables
  }
  return null
}

function getValidator(workspaceRoot, schemaPath, strictMode) {
  const absoluteSchemaPath = path.resolve(workspaceRoot, schemaPath)
  const cacheKey = `${absoluteSchemaPath}::${strictMode}`
  const cached = validatorCache.get(cacheKey)
  if (cached) return cached

  const schema = load(fs.readFileSync(absoluteSchemaPath, 'utf8'))
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    throw new Error(`Schema root must be an object: ${schemaPath}`)
  }

  const schemaId = schema.$id || pathToFileURL(absoluteSchemaPath).href
  if (!schema.$id) schema.$id = schemaId

  const ajv = new Ajv2020({
    allErrors: true,
    strict: strictMode,
  })

  const commonRef = './common-frontmatter.schema.yaml'
  const schemaText = JSON.stringify(schema)
  if (schemaText.includes(commonRef)) {
    const commonAbsolutePath = path.resolve(path.dirname(absoluteSchemaPath), commonRef)
    const commonSchema = load(fs.readFileSync(commonAbsolutePath, 'utf8'))
    if (commonSchema && typeof commonSchema === 'object' && !Array.isArray(commonSchema)) {
      const commonId = commonSchema.$id || pathToFileURL(commonAbsolutePath).href
      if (!commonSchema.$id) commonSchema.$id = commonId
      ajv.addSchema(commonSchema, commonId)
    }
  }

  const validate = ajv.compile(schema)
  const result = { validate, schemaPath }
  validatorCache.set(cacheKey, result)
  return result
}

module.exports = function remarkFrontmatterAjv2020(options = {}) {
  const strictMode = options.strict !== false
  const optionSchemas = options.schemas || {}
  const schemas = {
    ...DEFAULT_SCHEMAS,
    ...optionSchemas,
    ...(optionSchemas.spec && !optionSchemas.deliverables
      ? { deliverables: optionSchemas.spec }
      : {}),
  }

  return function transformer(tree, file) {
    const workspaceRoot = options.workspaceRoot || process.cwd()
    const currentPath = file.path ? path.resolve(String(file.path)) : ''
    const relativePath = currentPath ? toPosix(path.relative(workspaceRoot, currentPath)) : ''
    const schemaPath = selectSchemaPath(relativePath, schemas)
    if (!schemaPath) return

    const source = String(file.value || '')
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
    if (!match) return

    const frontmatterBody = match[1]

    let data
    try {
      data = load(frontmatterBody)
    } catch (error) {
      const line =
        error && error.mark && Number.isInteger(error.mark.line) ? error.mark.line + 2 : 2
      const column =
        error && error.mark && Number.isInteger(error.mark.column) ? error.mark.column + 1 : 1
      file.message(
        `Frontmatter YAML parse error: ${error.message || 'invalid YAML'}`,
        { start: { line, column } },
        'frontmatter-schema-2020'
      )
      return
    }

    if (data == null) data = {}
    if (typeof data !== 'object' || Array.isArray(data)) {
      file.message(
        'Frontmatter root must be an object.',
        { start: { line: 2, column: 1 } },
        'frontmatter-schema-2020'
      )
      return
    }

    const { validate } = getValidator(workspaceRoot, schemaPath, strictMode)
    const valid = validate(data)
    if (valid) return

    for (const err of validate.errors || []) {
      const segments = String(err.instancePath || '')
        .split('/')
        .filter(Boolean)
        .map(decodePointerToken)
      const key = segments[segments.length - 1] || ''
      const line = findKeyLine(frontmatterBody, key)
      const reason = `Frontmatter schema error (${err.keyword}): ${err.message || 'validation error'}`
      file.message(reason, { start: { line, column: 1 } }, 'frontmatter-schema-2020')
    }
  }
}
