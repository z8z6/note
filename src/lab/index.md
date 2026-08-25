---
title: 交互实验室
description: 可运行、可修改、可观察的代码实验
---

<script setup>
const pipelineDemo = `const readings = [12, 7, 18, 4, 21, 9]

const signal = readings
  .filter(value => value >= 9)
  .map(value => ({ raw: value, normalized: value / 21 }))

console.log('有效采样:', signal.length)
console.log(signal)

return signal.reduce((sum, item) => sum + item.normalized, 0)`

const asyncDemo = `const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

console.log('01 / 建立连接')
await wait(240)
console.log('02 / 获取信号')
await wait(240)
console.log('03 / 解析完成')

return { status: 'online', latency: '480ms' }`

const ownershipCompare = [
  {
    title: 'RAW POINTER',
    language: 'cpp',
    code: `Widget* widget = new Widget();
widget->run();
delete widget;`
  },
  {
    title: 'UNIQUE OWNERSHIP',
    language: 'cpp',
    code: `auto widget = std::make_unique<Widget>();
widget->run();
// 自动释放资源`
  },
  {
    title: 'SHARED OWNERSHIP',
    language: 'cpp',
    code: `auto widget = std::make_shared<Widget>();
auto observer = widget;
widget->run();`
  }
]
</script>

# 交互实验室

这里的代码不是截图。你可以修改源码、运行它，并直接观察输出。JavaScript 在独立的 Web Worker 中执行；无限循环或长时间任务会在三秒后终止，不会阻塞文章页面。

## 数据管线

下面的示例依次过滤、变换并聚合一组读数。试着修改阈值，或在管线中增加一个 `sort` 步骤。

<CodePlayground title="LAB–001 / ARRAY PIPELINE" :code="pipelineDemo" />

## 异步信号

Worker 支持 `async/await`，因此也能观察异步任务的执行顺序。这个环境没有页面 DOM，适合纯逻辑和算法实验。

<CodePlayground title="LAB–002 / ASYNC SIGNAL" :code="asyncDemo" :timeout="4000" />

## 多版本代码对比

`CodeCompare` 接收任意数量的代码项，并将它们横向排列。列数超过可用宽度时，可以沿水平方向滚动查看。标题栏默认合并为连续界面，使用 `:merge-headers="false"` 可以恢复独立卡片。

<CodeCompare title="OWNERSHIP STRATEGIES" :items="ownershipCompare" :min-width="300" />

## 能力边界

::: warning 当前限制
实验代码运行在浏览器中，而不是服务器容器中。它目前适合 JavaScript 语言特性、算法和异步控制流；C/C++ 示例仍以源码、编译参数与预期输出的形式记录。后续可单独接入 WASM 编译器，而不增加普通文章的初始加载体积。
:::

每个实验必须满足：输入明确、可以重置、输出可验证，并在文章中解释它试图证明什么。
