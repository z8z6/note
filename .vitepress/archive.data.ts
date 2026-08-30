import { createContentLoader, createMarkdownRenderer } from 'vitepress'
import { stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface ArchiveNote {
  title: string
  description: string
  descriptionHtml: string
  url: string
  cover: string
  language: string
  topic: string
  keywords: string[]
  date: string
  readingMinutes: number
  locale: 'zh' | 'en'
}

const sourceDir = resolve(dirname(fileURLToPath(import.meta.url)), '../src')

async function fileDate(url: string) {
  const route = decodeURIComponent(url).replace(/^\//, '')
  const path = resolve(sourceDir, route.endsWith('/') ? `${route}index.md` : `${route}.md`)
  try {
    return (await stat(path)).mtime.toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

function normalizedDate(value: unknown) {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value).match(/^\d{4}-\d{2}-\d{2}/)?.[0] || ''
}

const covers: Record<string, string> = {
  cxx: '/note-covers/cpp-logo.webp',
  cpp: '/note-covers/cpp-logo.webp',
  c: '/note-covers/c-family.png',
  bash: '/note-covers/terminal.svg',
  asm: '/note-covers/asm-logo.png',
  riscv: '/note-covers/risc-v-logo.svg',
  i386: '/note-covers/microsoft.svg',
  git: '/note-covers/git-logo.svg',
  gcc: '/note-covers/gcc-logo.png',
  llvm: '/note-covers/llvm-wyvern.png',
}

function metadata(url: string) {
  const route = url.replace(/^\/en(?=\/)/, '')

  if (/\/(?:lang|language)\/cxx\//.test(route)) {
    if (route.includes('/stl/container/')) return { language: 'C++', topic: 'STL · 容器', cover: covers.cxx }
    if (route.includes('/stl/iterator/')) return { language: 'C++', topic: 'STL · 迭代器', cover: covers.cxx }
    if (route.includes('/stl/adapter/')) return { language: 'C++', topic: 'STL · 适配器', cover: covers.cxx }
    if (route.includes('/stream/')) return { language: 'C++', topic: '流与 I/O', cover: covers.cxx }
    if (route.includes('/0x/') || route.includes('/17/')) return { language: 'C++', topic: '现代 C++', cover: covers.cxx }
    if (route.includes('/oop/')) return { language: 'C++', topic: '面向对象', cover: covers.cxx }
    if (route.includes('/mm/')) return { language: 'C++', topic: '类型与内存', cover: covers.cxx }
    return { language: 'C++', topic: 'C++ 基础', cover: covers.cxx }
  }
  if (/\/(?:lang|language)\/c\//.test(route)) return { language: 'C', topic: 'C 语言', cover: covers.c }
  if (/\/(?:lang|language)\/bash\//.test(route)) return { language: 'Bash', topic: 'Shell', cover: covers.bash }
  if (/\/(?:lang|language)\/asm\/i386\//.test(route)) return { language: 'i386', topic: '汇编与系统', cover: covers.i386 }
  if (/\/(?:lang|language)\/asm\//.test(route)) return { language: 'Assembly', topic: '汇编与系统', cover: covers.asm }
  if (route.startsWith('/debug/gdb/')) return { language: 'GDB', topic: '调试与追踪', cover: covers.bash }
  if (route.startsWith('/debug/strace/')) return { language: 'strace', topic: '调试与追踪', cover: covers.bash }
  if (route.startsWith('/debug/')) return { language: 'Debug', topic: '调试与追踪', cover: covers.bash }
  if (route.startsWith('/git/') || route.startsWith('/tool/vcs/')) return { language: 'Git', topic: '版本控制', cover: covers.git }
  if (route.startsWith('/compile/llvm/')) return { language: 'LLVM', topic: 'LLVM', cover: covers.llvm }
  return { language: 'GCC', topic: '编译工具链', cover: covers.gcc }
}

function plainText(value = '') {
  return value
    .replace(/^---[\s\S]*?---\s*/, '')
    .replace(/^#.+$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function markdownExcerpt(value = '') {
  const blocks = value
    .replace(/^---[\s\S]*?---\s*/, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s+.+$/gm, '')
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(block => block && !block.startsWith('<') && !block.startsWith('|') && !block.startsWith(':::'))

  return blocks[0] || plainText(value).slice(0, 180)
}

export default createContentLoader([
  'language/**/*.md',
  'lang/**/*.md',
  'cc/**/*.md',
  'compile/**/*.md',
  'debug/**/*.md',
  'git/**/*.md',
  'tool/**/*.md',
  'en/language/**/*.md',
  'en/lang/**/*.md',
  'en/cc/**/*.md',
  'en/compile/**/*.md',
  'en/debug/**/*.md',
  'en/git/**/*.md',
  'en/tool/**/*.md',
], {
  includeSrc: true,
  async transform(data): Promise<ArchiveNote[]> {
    const markdown = await createMarkdownRenderer(sourceDir)
    const notes = await Promise.all(data.map(async ({ url, src = '', frontmatter }) => {
      const defaults = metadata(url)
      const heading = src.match(/^#\s+(.+)$/m)?.[1]?.trim()
      const requestedCover = String(frontmatter.cover || '')
      const cover = covers[requestedCover.toLowerCase()] || requestedCover || defaults.cover
      const configuredKeywords = Array.isArray(frontmatter.keywords)
        ? frontmatter.keywords
        : String(frontmatter.keywords || '').split(',')
      const keywords = configuredKeywords.map(String).map(value => value.trim()).filter(Boolean)
      const description = String(frontmatter.description || markdownExcerpt(src))
      const articleText = plainText(src.replace(/<script\b[\s\S]*?<\/script>/gi, ''))

      return {
        title: String(frontmatter.title || heading || url.split('/').filter(Boolean).at(-1) || 'Untitled'),
        description: plainText(description).slice(0, 132),
        descriptionHtml: markdown.render(description),
        url,
        cover,
        language: String(frontmatter.language || defaults.language),
        topic: String(frontmatter.topic || defaults.topic),
        keywords: keywords.length ? keywords : [defaults.language, defaults.topic],
        date: normalizedDate(frontmatter.date) || await fileDate(url),
        readingMinutes: Math.max(1, Math.ceil(articleText.length / 400)),
        locale: url.startsWith('/en/') ? 'en' : 'zh',
      }
    }))
    return notes.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))
  },
})
