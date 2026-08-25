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
