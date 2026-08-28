import { readFile, readdir, writeFile } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const sourceDir = join(root, 'src')
const noteRoots = ['language', 'lang', 'compile', 'cc', 'tool', 'git']

async function markdownFiles(dir) {
  const files = []
  try {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) files.push(...await markdownFiles(path))
      else if (entry.isFile() && extname(entry.name) === '.md') files.push(path)
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  return files
}

function defaults(path, source) {
  const route = `/${relative(sourceDir, path).split(sep).join('/')}`
  const title = source.match(/^#\s+(.+)$/m)?.[1]?.replace(/[`*_]/g, '').trim() || '笔记'
  const slug = route.split('/').at(-1)?.replace(/\.md$/, '') || ''

  let cover = 'gcc'
  let language = 'GCC'
  let topic = '编译工具链'

  if (/\/(?:lang|language)\/cxx\//.test(route)) {
    cover = 'cpp'
    language = 'C++'
    if (route.includes('/stl/container/')) topic = 'STL · 容器'
    else if (route.includes('/stl/iterator/')) topic = 'STL · 迭代器'
    else if (route.includes('/stl/adapter/')) topic = 'STL · 适配器'
    else if (route.includes('/stream/')) topic = '流与 I/O'
    else if (route.includes('/0x/') || route.includes('/17/')) topic = '现代 C++'
    else if (route.includes('/oop/')) topic = '面向对象'
    else if (route.includes('/mm/')) topic = '类型与内存'
    else topic = 'C++ 基础'
  } else if (/\/(?:lang|language)\/c\//.test(route)) {
    cover = 'c'
    language = 'C'
    topic = 'C 语言'
  } else if (/\/(?:lang|language)\/bash\//.test(route)) {
    cover = 'bash'
    language = 'Bash'
    topic = 'Shell'
  } else if (/\/(?:lang|language)\/asm\/i386\//.test(route)) {
    cover = 'i386'
    language = 'i386'
    topic = '汇编与系统'
  } else if (/\/(?:lang|language)\/asm\//.test(route)) {
    cover = 'asm'
    language = 'Assembly'
    topic = '汇编与系统'
  } else if (route.startsWith('/git/') || route.startsWith('/tool/vcs/')) {
    cover = 'git'
    language = 'Git'
    topic = '版本控制'
  }

  return {
    cover,
    topic,
    keywords: [...new Set([language, topic, slug === 'index' ? title : slug].filter(Boolean))],
  }
}

function metadataBlock(metadata) {
  return [
    `cover: ${metadata.cover}`,
    `topic: ${JSON.stringify(metadata.topic)}`,
    'keywords:',
    ...metadata.keywords.map(keyword => `  - ${JSON.stringify(keyword)}`),
  ]
}

function insertMissing(source, metadata) {
  const fields = metadataBlock(metadata)
  if (!source.startsWith('---\n') && !source.startsWith('---\r\n')) {
    return `---\n${fields.join('\n')}\n---\n\n${source}`
  }

  const newline = source.includes('\r\n') ? '\r\n' : '\n'
  const end = source.indexOf(`${newline}---`, 4)
  if (end < 0) throw new Error('Unclosed frontmatter block')
  const frontmatter = source.slice(4, end)
  const missing = []
  if (!/^cover:/m.test(frontmatter)) missing.push(fields[0])
  if (!/^topic:/m.test(frontmatter)) missing.push(fields[1])
  if (!/^keywords:/m.test(frontmatter)) missing.push(...fields.slice(2))
  if (!missing.length) return source
  return `${source.slice(0, end)}${newline}${missing.join(newline)}${source.slice(end)}`
}

const files = (await Promise.all(noteRoots.map(dir => markdownFiles(join(sourceDir, dir))))).flat()
let changed = 0
for (const path of files) {
  const source = await readFile(path, 'utf8')
  const next = insertMissing(source, defaults(path, source))
  if (next === source) continue
  await writeFile(path, next, 'utf8')
  changed += 1
}

console.log(`Metadata ready: ${changed} updated, ${files.length - changed} unchanged.`)
