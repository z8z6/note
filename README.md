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

文章保存在 `src/`。新文章建议至少提供标题和摘要：

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

## 部署

推送到 `master` 后，GitHub Actions 会构建 `.vitepress/dist` 并部署到 GitHub Pages。自定义域名由 `src/public/CNAME` 提供。
