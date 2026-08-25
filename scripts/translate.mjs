import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const sourceDir = join(root, 'src')
const outputDir = join(sourceDir, 'en')
const cacheFile = join(outputDir, '.translation-cache.json')
const model = process.env.OPENAI_TRANSLATION_MODEL || 'gpt-5.4-mini'
const apiKey = process.env.OPENAI_API_KEY
const required = process.env.TRANSLATION_REQUIRED === '1'
const promptVersion = 'markdown-zh-en-v2'

async function listMarkdown(dir) {
  const files = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'en' && dir === sourceDir) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await listMarkdown(path))
    else if (entry.isFile() && extname(entry.name) === '.md') files.push(path)
  }
  return files.sort()
}

async function readCache() {
  try {
    return JSON.parse(await readFile(cacheFile, 'utf8'))
  } catch {
    return { version: 1, files: {} }
  }
}

function digest(content) {
  return createHash('sha256')
    .update(promptVersion)
    .update('\0')
    .update(model)
    .update('\0')
    .update(content)
    .digest('hex')
}

function outputText(response) {
  return (response.output || [])
    .filter(item => item.type === 'message')
    .flatMap(item => item.content || [])
    .filter(item => item.type === 'output_text')
    .map(item => item.text)
    .join('')
}

function unwrapMarkdown(text) {
  const value = text.trim()
  const match = value.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i)
  return `${match ? match[1] : value}\n`
}

function adjustGeneratedPaths(markdown) {
  // Generated documents live one directory deeper than their Chinese source.
  return markdown.replace(
    /(from\s+['"])(\.\.\/(?:\.\.\/)*\.vitepress\/)/g,
    '$1../$2',
  )
}

async function translate(markdown, path) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      store: false,
      instructions: [
        'Translate Simplified Chinese Markdown into natural technical English.',
        'Return only the complete translated Markdown document.',
        'Preserve YAML frontmatter, HTML, Vue components, imports, code fences, code, inline code, URLs, filenames, and Markdown structure exactly unless prose itself needs translation.',
        'Do not add explanations or wrap the document in an extra code fence.',
        'For absolute internal page links beginning with /, prefix the route with /en (for example /lang/cxx becomes /en/lang/cxx). Do not change asset links or already-localized /en links.',
      ].join(' '),
      input: `Source path: ${path}\n\n${markdown}`,
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`OpenAI API ${response.status}: ${detail}`)
  }

  const translated = outputText(await response.json())
  if (!translated.trim()) throw new Error('The OpenAI API returned no translated text')
  return adjustGeneratedPaths(unwrapMarkdown(translated))
}

async function withRetry(work, attempts = 3) {
  let error
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await work()
    } catch (current) {
      error = current
      if (attempt < attempts) {
        await new Promise(resolveDelay => setTimeout(resolveDelay, 1000 * 2 ** (attempt - 1)))
      }
    }
  }
  throw error
}

const sources = await listMarkdown(sourceDir)
const cache = await readCache()
const jobs = []

for (const source of sources) {
  const path = relative(sourceDir, source).split(sep).join('/')
  const content = await readFile(source, 'utf8')
  const hash = digest(content)
  const destination = join(outputDir, path)
  let current = false
  try {
    current = cache.files[path]?.hash === hash && Boolean(await readFile(destination, 'utf8'))
  } catch {}
  if (!current) jobs.push({ source: content, path, destination, hash })
}

if (jobs.length && !apiKey) {
  const message = `Skipping ${jobs.length} English translation(s): OPENAI_API_KEY is not set.`
  if (required) throw new Error(message)
  console.warn(message)
  process.exit(0)
}

await mkdir(outputDir, { recursive: true })
for (const job of jobs) {
  console.log(`Translating ${job.path}`)
  const translated = await withRetry(() => translate(job.source, job.path))
  await mkdir(dirname(job.destination), { recursive: true })
  const temporary = `${job.destination}.tmp`
  await writeFile(temporary, translated, 'utf8')
  await rename(temporary, job.destination)
  cache.files[job.path] = { hash: job.hash }
}

const expected = new Set(sources.map(source => relative(sourceDir, source).split(sep).join('/')))
for (const path of Object.keys(cache.files)) {
  if (expected.has(path)) continue
  await rm(join(outputDir, path), { force: true })
  delete cache.files[path]
}

cache.model = model
cache.promptVersion = promptVersion
await writeFile(cacheFile, `${JSON.stringify(cache, null, 2)}\n`, 'utf8')
console.log(jobs.length ? `Generated ${jobs.length} English document(s).` : 'English documents are up to date.')
