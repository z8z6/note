# CXXCXX Field Notes

`cxxcxx.com` 的 Markdown 驱动个人技术档案，使用 VitePress 构建。

## 本地开发

需要 Node.js 22 或更高版本。

```bash
npm ci
npm run dev
```

生产构建与本地预览：

```bash
npm run build
npm run preview
```

## 内容约定

中文是唯一需要维护的源内容，文章直接保存在 `src/`。不要手动编辑
`src/en/`：它由翻译脚本生成，并已被 Git 忽略。新文章建议至少提供标题和摘要：

```yaml
---
title: 文章标题
description: 一句话说明这篇文章解决什么问题
date: 2026-08-24
tags:
  - C++
---
```

Markdown 中可以直接使用全局注册的交互组件：

```md
<script setup>
const example = `console.log('hello')`
</script>

<CodePlayground title="最小实验" :code="example" />
```

多张 Markdown 表格可以使用 `ParallelTables` 并排展示；每个直接子元素是一张表格面板，窄屏下会自动改为纵向布局：

```md
<ParallelTables title="容器对比" :columns="2">

<div>

### 连续容器

| 容器 | 随机访问 |
| --- | --- |
| vector | O(1) |

</div>

<div>

### 链式容器

| 容器 | 随机访问 |
| --- | --- |
| list | O(n) |

</div>

</ParallelTables>
```

可通过 `:min-width="300"` 设置单列最小宽度，添加 `compact` 可使用紧凑单元格间距。

任意组件可以放入通用组件组。`slots` 指定总槽位数，`layout` 支持 `grid`、`row`、`column`、`featured-left` 和 `featured-right`：

```md
<ComponentGroup title="性能对比" :slots="3" layout="grid" :columns="3" :gap="16">
  <BarChart :data="compileData" />
  <LineChart :data="runtimeData" />
  <CodePlayground :code="example" />
</ComponentGroup>
```

需要精细控制时，用 `ComponentSlot` 设置跨列、跨行和对齐：

```md
<ComponentGroup :slots="3" layout="grid" :columns="3">
  <ComponentSlot :col-span="2"><BarChart :data="metrics" /></ComponentSlot>
  <ComponentSlot><PieChart :data="metrics" /></ComponentSlot>
</ComponentGroup>
```

组件组还支持 `min-width`、`gap`，以及 `mobile="stack|scroll"`。`ParallelTables` 和 `CodeCompare` 的并排布局也统一建立在 `ComponentGroup` 上。

柱形图、折线图和饼图使用相同的数据格式：

```md
<script setup>
const metrics = [
  { label: 'C++', value: 24 },
  { label: 'C', value: 8 },
  { label: 'Bash', value: 5, color: '#65c98a' }
]
</script>

<ComponentGroup :slots="3" layout="row" :min-width="320">
  <BarChart title="笔记数量" :data="metrics" suffix=" 篇" />
  <LineChart title="变化趋势" :data="metrics" :area="true" />
  <PieChart title="内容占比" :data="metrics" :donut="true" />
</ComponentGroup>
```

也可以直接使用 `<DataChart type="bar|line|pie">`。通用属性包括 `height`、`suffix` 和 `show-values`；折线图支持 `area`，饼图支持 `donut`。

正文的二至六级标题默认按层级自动编号，并同步到右侧目录。某个页面不需要编号时，可在 frontmatter 中关闭：

```yaml
---
headingNumbers: false
---
```

组件内部不参与正文层级的区域可以添加 `data-heading-numbers="false"`；单个 HTML 标题可以添加 `class="no-number"`。

静态文件保存在仓库根目录的 `public/`。

## 英文翻译

设置 OpenAI API key 后运行：

```bash
npm run translate
```

脚本使用文件哈希增量生成 `src/en/`，默认模型为 `gpt-5.4-mini`。如需指定模型，
可设置 `OPENAI_TRANSLATION_MODEL`。`npm run build` 会自动先运行翻译；未配置 key
时，本地构建会跳过尚未生成的英文文件。

## 部署

推送到 `master` 后，GitHub Actions 会增量生成英文、构建 `.vitepress/dist` 并部署到
GitHub Pages。仓库需要配置 Actions secret `OPENAI_API_KEY`，CI 中缺少该 secret
会直接失败，避免部署不完整的英文站点。自定义域名由 `public/CNAME` 提供。
