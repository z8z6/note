import { readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRiscvPseudocode } from '../.vitepress/data/riscvPseudocode.mjs'

const workspace = fileURLToPath(new URL('..', import.meta.url))
const instructionDirectory = join(workspace, 'src/language/asm/riscv/V1.0')
const filenames = (await readdir(instructionDirectory))
  .filter(filename => filename.endsWith('.md') && filename !== 'index.md')
  .sort()

let changed = 0
for (const filename of filenames) {
  const path = join(instructionDirectory, filename)
  const source = await readFile(path, 'utf8')
  const kind = basename(filename, '.md')
  if (!getRiscvPseudocode(kind)) throw new Error(`${filename} 缺少伪代码语义映射`)
  if (source.includes('## 语义伪代码')) continue

  const marker = source.includes('\n## 注意点\n') ? '\n## 注意点\n' : '\n## 示例\n'
  if (!source.includes(marker)) throw new Error(`${filename} 缺少“## 注意点”或“## 示例”插入锚点`)

  const section = `\n## 语义伪代码\n\n<InstructionPseudocode kind="${kind}" />\n`
  await writeFile(path, source.replace(marker, `${section}${marker}`), 'utf8')
  changed += 1
}

console.log(`RISC-V pseudocode sections: ${filenames.length}; added: ${changed}`)
