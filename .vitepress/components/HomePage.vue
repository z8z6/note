<script setup lang="ts">
const sectors = [
  { code: 'SECTOR / 01', title: '语言与系统', description: 'C、C++、汇编与编译工具链。追踪语言表象之下的内存、对象与机器。', link: '/lang/cxx/', tone: 'red' },
  { code: 'SECTOR / 02', title: '交互实验室', description: '把代码从静态片段变成可以运行、修改和观察的实验。', link: '/lab/', tone: 'cyan' },
  { code: 'SECTOR / 03', title: '工具与现场记录', description: 'Git、Bash、GCC，以及那些值得在下一次故障前留下的命令。', link: '/git/cmd', tone: 'amber' },
]

const signals = [
  ['C / C++', '语言核心'],
  ['ASM / GCC', '系统底层'],
  ['MARKDOWN', '内容协议'],
  ['INTERACTIVE', '实验状态'],
]
</script>

<template>
  <main class="field-home">
    <section class="field-hero">
      <div class="field-hero__meta">
        <span>CXXCXX.COM</span>
        <span>CN–31.2304 / E–121.4737</span>
        <span class="status"><i /> SIGNAL ONLINE</span>
      </div>

      <div class="field-hero__body">
        <div class="field-hero__copy">
          <p class="eyebrow">PERSONAL TECHNICAL ARCHIVE / 个人技术档案</p>
          <h1><span>代码是坐标，</span><span class="accent">笔记是地图。</span></h1>
          <p class="lead">记录编程语言、系统原理与数字世界里的实验现场。<br>从一行代码出发，抵达它真正运行的地方。</p>
          <div class="actions">
            <a class="action action--primary" href="/lang/cxx/">进入知识库 <b>↗</b></a>
            <a class="action" href="/lab/">打开实验室 <b>→</b></a>
          </div>
        </div>

        <div class="field-hero__radar" aria-hidden="true">
          <div class="radar-ring radar-ring--outer" />
          <div class="radar-ring radar-ring--inner" />
          <div class="radar-axis radar-axis--x" />
          <div class="radar-axis radar-axis--y" />
          <div class="radar-sweep" />
          <i class="radar-node radar-node--a" />
          <i class="radar-node radar-node--b" />
          <i class="radar-node radar-node--c" />
          <span class="radar-label">CXX<br>FIELD<br>NOTES</span>
        </div>
      </div>

      <div class="signal-strip">
        <div v-for="([name, label], index) in signals" :key="name" class="signal-item">
          <span>0{{ index + 1 }}</span><strong>{{ name }}</strong><small>{{ label }}</small>
        </div>
      </div>
    </section>

    <section class="field-sectors">
      <header class="section-heading">
        <p>ARCHIVE SECTORS</p>
        <h2>选择一个入口</h2>
        <span>资料持续整理中 / LAST SYNC: ACTIVE</span>
      </header>

      <div class="sector-grid">
        <a v-for="sector in sectors" :key="sector.code" :href="sector.link" class="sector-card" :class="`sector-card--${sector.tone}`">
          <span class="sector-card__code">{{ sector.code }}</span>
          <h3>{{ sector.title }}</h3>
          <p>{{ sector.description }}</p>
          <span class="sector-card__link">ACCESS RECORD <b>↗</b></span>
        </a>
      </div>
    </section>

    <section class="field-manifesto">
      <div class="waveform" aria-hidden="true">
        <i v-for="n in 36" :key="n" :style="{ height: `${12 + ((n * 17) % 54)}px` }" />
      </div>
      <div><p>EDITORIAL PROTOCOL / 记录协议</p><strong>Markdown 驱动。示例优先。保持可运行。</strong></div>
      <a href="/about">READ MANIFESTO →</a>
    </section>
  </main>
</template>

<style scoped>
.field-home { width: min(1240px, calc(100% - 48px)); margin: 0 auto; padding: 42px 0 96px; }
.field-hero { overflow: hidden; border: 1px solid var(--vp-c-divider); background: color-mix(in srgb, var(--vp-c-bg-elv) 91%, transparent); box-shadow: var(--panel-shadow); }
.field-hero__meta { display: flex; justify-content: space-between; padding: 11px 16px; border-bottom: 1px solid var(--vp-c-divider); color: var(--vp-c-text-3); font: 10px var(--vp-font-family-mono); letter-spacing: .1em; }
.status { color: var(--c-cyan); }
.status i { display: inline-block; width: 6px; height: 6px; margin-right: 7px; border-radius: 50%; background: var(--c-cyan); box-shadow: 0 0 10px var(--c-cyan); }
.field-hero__body { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(320px, .6fr); min-height: 550px; }
.field-hero__copy { display: flex; flex-direction: column; justify-content: center; padding: clamp(42px, 7vw, 92px); }
.eyebrow, .section-heading p, .field-manifesto p { color: var(--c-signal); font: 11px var(--vp-font-family-mono); letter-spacing: .15em; }
h1 { margin: 20px 0 28px; font-size: clamp(3.1rem, 7vw, 6.7rem); font-weight: 760; line-height: .96; letter-spacing: -.075em; }
h1 span { display: block; }
h1 .accent { color: transparent; -webkit-text-stroke: 1px var(--vp-c-text-1); }
.lead { max-width: 620px; color: var(--vp-c-text-2); font-size: clamp(15px, 1.6vw, 18px); line-height: 1.9; }
.actions { display: flex; gap: 10px; margin-top: 36px; }
.action { display: inline-flex; align-items: center; justify-content: space-between; min-width: 160px; padding: 13px 16px; border: 1px solid var(--vp-c-border); color: var(--vp-c-text-1); font: 12px var(--vp-font-family-mono); transition: .2s ease; }
.action:hover { border-color: var(--c-signal); color: var(--c-signal); }
.action--primary { border-color: var(--c-signal); color: #fff; background: var(--c-signal); }
.action--primary:hover { color: #fff; filter: brightness(1.08); }
.field-hero__radar { position: relative; overflow: hidden; min-height: 390px; border-left: 1px solid var(--vp-c-divider); background: linear-gradient(90deg, transparent 49.8%, var(--c-grid) 50%, transparent 50.2%), linear-gradient(transparent 49.8%, var(--c-grid) 50%, transparent 50.2%); }
.radar-ring { position: absolute; inset: 50% auto auto 50%; border: 1px solid var(--vp-c-border); border-radius: 50%; transform: translate(-50%, -50%); }
.radar-ring--outer { width: 310px; height: 310px; }
.radar-ring--inner { width: 170px; height: 170px; }
.radar-axis { position: absolute; top: 50%; left: 50%; background: var(--vp-c-divider); transform: translate(-50%, -50%); }
.radar-axis--x { width: 360px; height: 1px; }
.radar-axis--y { width: 1px; height: 360px; }
.radar-sweep { position: absolute; top: 50%; left: 50%; width: 155px; height: 155px; transform-origin: 0 0; background: conic-gradient(from 270deg, color-mix(in srgb, var(--c-cyan) 28%, transparent), transparent 25%); animation: sweep 7s linear infinite; }
.radar-node { position: absolute; width: 7px; height: 7px; border: 1px solid var(--c-signal); background: var(--vp-c-bg-elv); box-shadow: 0 0 14px var(--c-signal); }
.radar-node--a { top: 28%; left: 62%; }.radar-node--b { top: 65%; left: 30%; }.radar-node--c { top: 72%; left: 71%; }
.radar-label { position: absolute; top: 50%; left: 50%; color: var(--vp-c-text-1); font: 700 21px/1.05 var(--vp-font-family-mono); letter-spacing: -.08em; transform: translate(-50%, -50%); }
.signal-strip { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--vp-c-divider); }
.signal-item { display: grid; grid-template-columns: auto 1fr; gap: 1px 10px; padding: 15px 18px; border-right: 1px solid var(--vp-c-divider); font-family: var(--vp-font-family-mono); }
.signal-item:last-child { border: 0; }.signal-item span { grid-row: span 2; color: var(--c-signal); font-size: 10px; }.signal-item strong { font-size: 12px; }.signal-item small { color: var(--vp-c-text-3); font-size: 9px; }
.field-sectors { padding: 104px 0; }
.section-heading { display: grid; grid-template-columns: 1fr auto; align-items: end; margin-bottom: 30px; }.section-heading p { grid-column: 1 / -1; }.section-heading h2 { margin: 8px 0 0; font-size: clamp(2rem, 4vw, 3.5rem); letter-spacing: -.05em; }.section-heading span { color: var(--vp-c-text-3); font: 10px var(--vp-font-family-mono); }
.sector-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.sector-card { position: relative; min-height: 310px; padding: 26px; border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-1); background: color-mix(in srgb, var(--vp-c-bg-elv) 82%, transparent); transition: transform .22s ease, border-color .22s ease; }
.sector-card::before { position: absolute; inset: -1px auto auto -1px; width: 34px; height: 3px; content: ''; background: var(--card-accent); }
.sector-card:hover { border-color: var(--card-accent); transform: translateY(-5px); }.sector-card--red { --card-accent: var(--c-signal); }.sector-card--cyan { --card-accent: var(--c-cyan); }.sector-card--amber { --card-accent: var(--c-amber); }
.sector-card__code { color: var(--card-accent); font: 10px var(--vp-font-family-mono); letter-spacing: .13em; }.sector-card h3 { margin: 75px 0 14px; font-size: 26px; }.sector-card p { color: var(--vp-c-text-2); line-height: 1.75; }.sector-card__link { position: absolute; right: 25px; bottom: 23px; left: 25px; display: flex; justify-content: space-between; color: var(--vp-c-text-3); font: 10px var(--vp-font-family-mono); }
.field-manifesto { display: grid; grid-template-columns: 1fr 1.6fr auto; gap: 42px; align-items: center; padding: 35px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-alt); }.waveform { display: flex; align-items: center; gap: 3px; height: 68px; }.waveform i { flex: 1; max-width: 4px; background: var(--c-cyan); opacity: .62; }.field-manifesto strong { display: block; margin-top: 8px; font-size: 18px; }.field-manifesto a { color: var(--vp-c-text-2); font: 10px var(--vp-font-family-mono); }
@keyframes sweep { to { transform: rotate(360deg); } }
@media (max-width: 900px) {
  .field-hero__body { grid-template-columns: 1fr; }.field-hero__radar { border-top: 1px solid var(--vp-c-divider); border-left: 0; }.signal-strip { grid-template-columns: repeat(2, 1fr); }.sector-grid { grid-template-columns: 1fr; }.sector-card { min-height: 240px; }.sector-card h3 { margin-top: 42px; }.field-manifesto { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .field-home { width: min(100% - 24px, 1240px); padding-top: 18px; }.field-hero__meta span:nth-child(2) { display: none; }.field-hero__copy { padding: 48px 24px; }h1 { font-size: clamp(2.8rem, 15vw, 4.5rem); }.actions { flex-direction: column; }.signal-strip { grid-template-columns: 1fr 1fr; }.signal-item { padding: 12px; }.section-heading { display: block; }.section-heading span { display: block; margin-top: 12px; }.field-sectors { padding: 72px 0; }
}
@media (prefers-reduced-motion: reduce) { .radar-sweep { animation: none; } }
</style>
