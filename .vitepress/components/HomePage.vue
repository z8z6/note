<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useData } from "vitepress";
import ParticleField from "./ParticleField.vue";
import { data as noteData } from "../archive.data";

type ThemeId = "amiya" | "w" | "kaltsit" | "surtr";
const { lang } = useData();
const isEnglish = computed(() => lang.value.startsWith("en"));
const prefix = computed(() => (isEnglish.value ? "/en" : ""));
const menuLinks = computed(() => [
  `${prefix.value}/`,
  `${prefix.value}/archive`,
  "#operator-themes",
  `${prefix.value}/lab/`,
  `${prefix.value}/about`,
]);
const activeSection = ref(0);
const activeTheme = ref<ThemeId>("w");
const themePulse = ref(false);
const panels = ref<HTMLElement[]>([]);
let observer: IntersectionObserver | undefined;
let themeTimer: ReturnType<typeof setTimeout> | undefined;

const themes = [
  {
    id: "amiya" as const,
    cn: "阿米娅",
    en: "AMIYA",
    code: "AM-01",
    avatar: "/operators/amiya.png",
    item: "RINGS / 戒指",
    accent: "#18aeb7",
    secondary: "#343b41",
    soft: "#dff5f4",
  },
  {
    id: "w" as const,
    cn: "W",
    en: "W",
    code: "W-07",
    avatar: "/operators/w.png",
    item: "CHARGE / 爆破单元",
    accent: "#ee4f52",
    secondary: "#20aeb6",
    soft: "#ffe6e2",
  },
  {
    id: "kaltsit" as const,
    cn: "凯尔希",
    en: "KAL'TSIT",
    code: "KS-03",
    avatar: "/operators/kaltsit.png",
    item: "MON3TR / 医疗核心",
    accent: "#91ad54",
    secondary: "#35423a",
    soft: "#edf3dc",
  },
  {
    id: "surtr" as const,
    cn: "史尔特尔",
    en: "SURTR",
    code: "ST-09",
    avatar: "/operators/surtr.png",
    item: "LAEVATEIN / 巨剑",
    accent: "#ef6a32",
    secondary: "#9d2e29",
    soft: "#ffeadb",
  },
];
const theme = computed(
  () => themes.find((item) => item.id === activeTheme.value) || themes[1],
);
const themeStyle = computed(() => ({
  "--home-accent": theme.value.accent,
  "--home-secondary": theme.value.secondary,
  "--home-soft": theme.value.soft,
}));

const text = computed(() =>
  isEnglish.value
    ? {
        menu: ["Terminal", "Archive", "Operators", "Base", "Settings"],
        kicker: "PERSONAL TECHNICAL ARCHIVE / OPERATION SYSTEM",
        titleA: "CODE IS THE",
        titleB: "COORDINATE.",
        lead: "Notes are the map. Follow one line of code to where it truly runs.",
        enter: "ENTER KNOWLEDGE BASE",
        lab: "OPEN LAB",
        scroll: "SCROLL TO SWITCH CHANNEL",
        records: "Latest records",
        recordsLead:
          "Recently calibrated notes from languages, systems, and tools.",
        archive: "Archive sectors",
        archiveLead: "Choose a channel and continue the field survey.",
        protocol: "Markdown driven. Examples first. Keep it runnable.",
        footerTitle: "Stay connected.",
        footerLead: "Projects, games, and external signals still being updated.",
      }
    : {
        menu: ["终端", "档案", "干员", "基建", "设置"],
        kicker: "个人博客 / OPERATION SYSTEM",
        titleA: "z8z6",
        titleB: "小站",
        lead: "从一行代码出发，穿过语言与抽象层，抵达它真正运行的地方。",
        enter: "进入知识库",
        lab: "打开实验室",
        scroll: "向下滚动 / 切换频道",
        records: "最新记录",
        recordsLead: "来自语言、系统与工具链的近期校准记录。",
        archive: "档案分区",
        archiveLead: "选择一个频道，继续这场技术勘测。",
        protocol: "Markdown 驱动。示例优先。保持可运行。",
        footerTitle: "保持连接。",
        footerLead: "项目、游戏与仍在持续更新的外部信号。",
      },
);
const homeNotes = computed(() => noteData.filter(note => note.locale === (isEnglish.value ? "en" : "zh")));
const articles = computed(() => [...homeNotes.value]
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))
  .slice(0, 3)
  .map(note => ({
    tag: note.topic,
    title: note.title,
    description: note.description,
    url: note.url,
    cover: note.cover,
    date: note.date,
    readingMinutes: note.readingMinutes,
  })));
const topicStats = computed(() => {
  const counts = new Map<string, number>();
  homeNotes.value.forEach(note => counts.set(note.topic, (counts.get(note.topic) || 0) + 1));
  const total = homeNotes.value.length || 1;
  return [...counts.entries()]
    .map(([topic, count]) => ({ topic, count, percentage: Math.round(count / total * 1000) / 10 }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
});
const timeline = computed(() => [...homeNotes.value]
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))
  .slice(0, 6));
function formatDate(date: string) {
  if (!date) return isEnglish.value ? "UNDATED" : "待标注";
  return new Intl.DateTimeFormat(isEnglish.value ? "en-US" : "zh-CN", {
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${date}T00:00:00`));
}
function formatRecordDate(date: string) {
  return date ? date.replaceAll("-", ".") : "UNDATED";
}

function setTheme(id: ThemeId) {
  if (id === activeTheme.value) return;
  themePulse.value = false;
  requestAnimationFrame(() => {
    activeTheme.value = id;
    themePulse.value = true;
    localStorage.setItem("cxxcxx-operator-theme", id);
    window.dispatchEvent(
      new CustomEvent("operator-theme-change", { detail: id }),
    );
    if (themeTimer) clearTimeout(themeTimer);
    themeTimer = setTimeout(() => {
      themePulse.value = false;
    }, 760);
  });
}
function setPanel(element: unknown, index: number) {
  if (element instanceof HTMLElement) panels.value[index] = element;
}
function goTo(index: number) {
  panels.value[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function onKeydown(event: KeyboardEvent) {
  if ((event.target as HTMLElement).closest("a,button,input,textarea,select"))
    return;
  if (["PageDown", "ArrowDown"].includes(event.key)) {
    event.preventDefault();
    goTo(Math.min(activeSection.value + 1, 3));
  }
  if (["PageUp", "ArrowUp"].includes(event.key)) {
    event.preventDefault();
    goTo(Math.max(activeSection.value - 1, 0));
  }
}
onMounted(async () => {
  document.documentElement.classList.add("home-scroll-mode");
  const saved = localStorage.getItem("cxxcxx-operator-theme") as ThemeId | null;
  if (saved && themes.some((item) => item.id === saved))
    activeTheme.value = saved;
  await nextTick();
  observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting)
          activeSection.value = Number(
            (entry.target as HTMLElement).dataset.panel,
          );
      }),
    { threshold: 0.55 },
  );
  panels.value.forEach((panel) => observer?.observe(panel));
  window.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => {
  document.documentElement.classList.remove("home-scroll-mode");
  observer?.disconnect();
  window.removeEventListener("keydown", onKeydown);
  if (themeTimer) clearTimeout(themeTimer);
});
</script>

<template>
  <main
    class="ark-home"
    :class="{ 'theme-pulse': themePulse }"
    :data-theme="theme.id"
    :style="themeStyle"
  >
    <ParticleField
      :key="theme.id"
      :accent="theme.accent"
      :secondary="theme.secondary"
    />
    <nav class="switcher" aria-label="首页区段">
      <button
        v-for="n in 4"
        :key="n"
        :class="{ active: activeSection === n - 1 }"
        :aria-label="`Section ${n}`"
        @click="goTo(n - 1)"
      >
        0{{ n }}
      </button>
    </nav>

    <section
      :ref="(element) => setPanel(element, 0)"
      data-panel="0"
      class="screen hero-screen"
      :class="{ active: activeSection === 0 }"
    >
      <div class="frame">
        <header class="system-bar reveal r1">
          <span><i /> CXXCXX.COM</span><span>PRTS://CXX-0825</span
          ><span>CN–31.2304 / E–121.4737</span><b>SIGNAL ONLINE</b>
        </header>
        <div class="hero-grid">
          <aside class="left-menu reveal r2">
            <div class="mark"><b>CXX</b><small>OPERATION SYSTEM</small></div>
            <a v-for="(item, i) in text.menu" :key="item" :href="menuLinks[i]">
              <span>0{{ i + 1 }}</span
              ><b>{{ item }}</b
              ><small>{{
                ["TERMINAL", "ARCHIVE", "OPERATORS", "BASE", "SETTINGS"][i]
              }}</small>
            </a>
            <div class="node-code">N-01 ── ◆ ── N-05<br />ROUTE VERIFIED</div>
          </aside>

          <div class="hero-stage">
            <svg
              class="contours"
              viewBox="0 0 900 620"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <g class="minor">
                <path
                  v-for="y in [-18, 20, 58, 96, 136, 178, 222, 268, 316, 366, 418, 472, 528, 586, 638]"
                  :key="y"
                  :d="`M-50 ${y} C110 ${y - 75} 190 ${y + 62} 330 ${y} S570 ${y - 65} 710 ${y + 3} 980 ${y - 38}`"
                />
              </g>
              <g class="minor minor-cross">
                <path
                  v-for="x in [30, 110, 190, 270, 350, 430, 510, 590, 670, 750, 830]"
                  :key="x"
                  :d="`M${x} -40 C${x - 66} 92 ${x + 58} 166 ${x} 278 S${x - 56} 470 ${x + 24} 680`"
                />
              </g>
              <g class="major">
                <path
                  d="M-30 104C110 37 194 170 324 112S551 67 685 131 876 157 952 101"
                />
                <path
                  d="M-50 286C88 218 223 331 359 276S570 230 702 298 882 343 968 301"
                />
                <path
                  d="M-21 444C119 378 255 471 401 426S600 386 731 450 888 483 965 455"
                />
              </g>
              <g class="terrain terrain-a">
                <path d="M515 61C589 17 720 27 778 78S831 188 775 229 628 251 556 215 450 103 515 61Z" />
                <path d="M541 82C605 47 699 48 751 89S793 176 747 207 639 225 578 198 489 112 541 82Z" />
                <path d="M573 105C623 78 686 76 725 106S754 164 720 185 648 202 604 183 532 128 573 105Z" />
                <path d="M609 125C642 105 678 104 704 123S722 156 700 169 659 181 632 168 582 142 609 125Z" />
                <path d="M630 137C650 124 673 123 689 136S699 153 685 160 661 167 645 158 613 148 630 137Z" />
              </g>
              <g class="terrain terrain-b">
                <path d="M42 332C109 285 207 289 254 341S300 465 238 508 93 537 28 482-24 378 42 332Z" />
                <path d="M64 354C118 318 190 320 229 359S260 446 217 480 111 506 60 465 13 389 64 354Z" />
                <path d="M91 378C131 350 178 350 205 378S226 428 195 452 129 472 96 446 54 404 91 378Z" />
                <path d="M119 394C145 377 172 377 190 395S201 421 182 435 143 446 122 430 91 412 119 394Z" />
              </g>
              <g class="terrain terrain-c">
                <path d="M347 234C391 206 456 211 486 250S508 337 465 361 369 357 337 320 305 261 347 234Z" />
                <path d="M365 251C402 229 448 234 470 263S485 323 453 340 389 337 362 311 334 271 365 251Z" />
                <path d="M388 269C414 254 442 258 457 277S465 311 443 322 404 317 387 301 366 282 388 269Z" />
                <path d="M409 282C425 273 440 276 449 287S451 303 438 310 419 306 408 298 397 289 409 282Z" />
              </g>
            </svg>
            <span class="elevation">△ +042M / TERRAIN SCAN</span>
            <div class="hero-copy reveal r2">
              <p>{{ text.kicker }}</p>
              <h1>
                <span>{{ text.titleA }}</span
                ><span>{{ text.titleB }}</span>
              </h1>
              <strong>{{ text.lead }}</strong>
              <div>
                <a :href="`${prefix}/language/cxx/`">{{ text.enter }} <b>↗</b></a
                ><a :href="`${prefix}/lab/`">{{ text.lab }} <b>→</b></a>
              </div>
            </div>
            <div
              :key="theme.id"
              class="theme-artifact"
              :class="`artifact-${theme.id}`"
              aria-hidden="true"
            >
              <header>
                <span>SELECTED / {{ theme.code }}</span
                ><b>{{ theme.en }}</b>
              </header>
              <div class="dossier-portrait" :class="`portrait-${theme.id}`">
                <img :src="theme.avatar" alt="" /><i /><em /><b>{{ theme.code.slice(0, 2) }}</b>
              </div>
              <div class="signature-item">
                <i /><i /><span>{{ theme.item }}</span>
              </div>
              <footer>TRUST / 200% <i /></footer>
            </div>
          </div>

          <aside id="operator-themes" class="operators reveal r3">
            <header>OPERATOR THEME <span>/ 干员主题</span></header>
            <button
              v-for="item in themes"
              :key="item.id"
              :class="{ active: activeTheme === item.id }"
              :aria-pressed="activeTheme === item.id"
              @click="setTheme(item.id)"
            >
              <span
                class="avatar"
                :class="`avatar-${item.id}`"
                :style="{ '--swatch': item.accent }"
                ><img :src="item.avatar" alt="" loading="lazy" /><b>{{ item.code.slice(0, 2) }}</b></span
              ><span
                ><b>{{ item.cn }}</b
                ><small>{{ item.en }} / {{ item.code }}</small></span
              ><em />
            </button>
            <footer>
              THEME SYNC <b>{{ theme.en }} / ACTIVE</b
              ><small>{{ theme.item }}</small
              ><span><i /><i /><i /></span>
            </footer>
          </aside>
        </div>
        <footer class="telemetry reveal r3">
          <div><span>理智 / SANITY</span><b>135 / 135</b></div>
          <div><span>公开招募 / RECRUIT</span><b>04 / 04</b></div>
          <div><span>作战记录 / BATTLE RECORD</span><b>SYNCED</b></div>
          <div><span>PHARMACEUTICALS</span><b>PENGUIN COURIER / 0825</b></div>
        </footer>
      </div>
      <button class="scroll-cue" @click="goTo(1)">
        <span>{{ text.scroll }}</span
        ><i />
      </button>
    </section>

    <section
      :ref="(element) => setPanel(element, 1)"
      data-panel="1"
      class="screen records-screen"
      :class="{ active: activeSection === 1 }"
    >
      <div class="content-frame">
        <header class="section-head reveal r1">
          <div>
            <span>02 / BATTLE RECORD</span>
            <h2>{{ text.records }}</h2>
            <p>{{ text.recordsLead }}</p>
          </div>
          <div class="heat">
            <span>ARCHIVE HEAT</span><b>86.4%</b><i><i /></i>
          </div>
        </header>
        <div class="record-grid">
          <a
            v-for="(article, i) in articles"
            :key="article.title"
            :href="article.url"
            class="record reveal"
            :class="`r${i + 1}`"
          >
            <div class="record-art">
              <img :src="article.cover" alt="" loading="lazy">
              <span>0{{ i + 1 }}</span
              ><i /><i /><i />
            </div>
            <div class="record-copy">
              <span>{{ article.tag }}</span>
              <h3>{{ article.title }}</h3>
              <p>{{ article.description }}</p>
              <footer>
                {{ formatRecordDate(article.date) }} · {{ article.readingMinutes }} MIN <b>→</b>
              </footer>
            </div>
          </a>
        </div>
        <div class="status-grid reveal r3">
          <div class="node-map">
            <header>NODE MAP / 节点图 <b>5 / ONLINE</b></header>
            <svg viewBox="0 0 520 120">
              <path
                d="M30 79L135 27 248 82 364 24 490 74M135 27L178 105 248 82 330 105 364 24"
              />
              <g>
                <circle cx="30" cy="79" r="6" />
                <circle cx="135" cy="27" r="6" />
                <circle cx="248" cy="82" r="6" />
                <circle cx="364" cy="24" r="6" />
                <circle cx="490" cy="74" r="6" />
              </g>
            </svg>
          </div>
          <div
            v-for="metric in [
              ['CPU', '14%'],
              ['MEMORY', '32%'],
              ['LOAD', '0.78'],
            ]"
            :key="metric[0]"
            class="metric"
          >
            <span>{{ metric[0] }}</span
            ><b>{{ metric[1] }}</b
            ><i />
          </div>
          <div class="online">
            <i /><span>SIGNAL ONLINE<small>CXXCXX.COM</small></span>
          </div>
        </div>
      </div>
    </section>

    <section
      :ref="(element) => setPanel(element, 2)"
      data-panel="2"
      class="screen archive-screen"
      :class="{ active: activeSection === 2 }"
    >
      <div class="content-frame">
        <header class="section-head reveal r1">
          <div>
            <span>03 / ARCHIVE SECTORS</span>
            <h2>{{ text.archive }}</h2>
            <p>{{ text.archiveLead }}</p>
          </div>
          <a :href="`${prefix}/archive`">VIEW ALL / 索引 ↗</a>
        </header>
        <div class="archive-dashboard reveal r2">
          <section class="topic-overview">
            <header>
              <span>TOPIC DISTRIBUTION / 主题分布</span>
              <b>{{ homeNotes.length }} NOTES</b>
            </header>
            <div class="topic-grid">
              <a v-for="stat in topicStats" :key="stat.topic" :href="`${prefix}/archive`" class="topic-stat">
                <span>{{ stat.topic }}</span>
                <b>{{ stat.count }}</b>
                <i><i :style="{ width: `${stat.percentage}%` }" /></i>
                <small>{{ stat.percentage.toFixed(1) }}%</small>
              </a>
            </div>
          </section>
          <section class="note-timeline">
            <header>
              <span>UPDATE TIMELINE / 时间线</span>
              <b>{{ timeline.length }} LATEST</b>
            </header>
            <div>
              <a v-for="(note, index) in timeline" :key="note.url" :href="note.url">
                <time :datetime="note.date">{{ formatDate(note.date) }}</time>
                <i />
                <span><small>{{ note.topic }}</small><b>{{ note.title }}</b></span>
                <em>{{ String(index + 1).padStart(2, "0") }}</em>
              </a>
            </div>
          </section>
        </div>
        <div class="protocol reveal r3">
          <div class="wave">
            <i
              v-for="n in 40"
              :key="n"
              :style="{ height: `${10 + ((n * 19) % 44)}px` }"
            />
          </div>
          <div>
            <span>EDITORIAL PROTOCOL / 记录协议</span
            ><strong>{{ text.protocol }}</strong>
          </div>
          <a :href="`${prefix}/about`">READ MANIFESTO →</a>
        </div>
      </div>
    </section>

    <footer
      :ref="(element) => setPanel(element, 3)"
      data-panel="3"
      class="screen footer-screen"
      :class="{ active: activeSection === 3 }"
    >
      <div class="footer-frame">
        <header class="footer-heading reveal r1">
          <span>04 / EXTERNAL CHANNELS</span>
          <h2>{{ text.footerTitle }}</h2>
          <p>{{ text.footerLead }}</p>
        </header>
        <div class="footer-links">
          <section class="footer-column reveal r2">
            <header><span>GITHUB / Z8Z6</span><b>PUBLIC REPOSITORIES</b></header>
            <a href="https://github.com/z8z6/note" target="_blank" rel="noreferrer"><span>01</span><b>note</b><small>THIS BLOG / MARKDOWN ARCHIVE</small><em>↗</em></a>
            <a href="https://github.com/z8z6/ZineCraft" target="_blank" rel="noreferrer"><span>02</span><b>ZineCraft</b><small>PUBLIC REPOSITORY</small><em>↗</em></a>
            <a href="https://github.com/z8z6/Show-Me-Terra" target="_blank" rel="noreferrer"><span>03</span><b>Show-Me-Terra</b><small>TERRA CHANNEL</small><em>↗</em></a>
            <a href="https://github.com/z8z6/readelf" target="_blank" rel="noreferrer"><span>04</span><b>readelf</b><small>A SIMPLE ELF READER</small><em>↗</em></a>
          </section>
          <section class="footer-column reveal r3">
            <header><span>ARKNIGHTS / HYPERGRYPH</span><b>OFFICIAL CHANNELS</b></header>
            <a href="https://ak.hypergryph.com/" target="_blank" rel="noreferrer"><span>AK</span><b>明日方舟</b><small>OFFICIAL WEBSITE</small><em>↗</em></a>
            <a href="https://endfield.hypergryph.com/" target="_blank" rel="noreferrer"><span>EF</span><b>明日方舟：终末地</b><small>OVER THE FRONTIER</small><em>↗</em></a>
            <a href="https://monster-siren.hypergryph.com/" target="_blank" rel="noreferrer"><span>MS</span><b>塞壬唱片</b><small>A WORLD FAMILIARLY UNKNOWN</small><em>↗</em></a>
            <a href="https://www.skland.com/" target="_blank" rel="noreferrer"><span>SK</span><b>森空岛</b><small>HYPERGRYPH COMMUNITY</small><em>↗</em></a>
          </section>
        </div>
        <div class="footer-bottom reveal r3">
          <span>© CXXCXX · CXXCXX.COM</span>
          <b>BUILD FROM MARKDOWN / SIGNAL MAINTAINED</b>
          <a href="#top" @click.prevent="goTo(0)">RETURN TO TOP ↑</a>
        </div>
      </div>
    </footer>
  </main>
</template>

<style scoped>
.ark-home {
  --ink: #171b1e;
  --muted: #667177;
  --line: rgba(30, 39, 43, 0.16);
  --contour-minor: #718d92;
  position: relative;
  isolation: isolate;
  overflow: clip;
  color: var(--ink);
  background: #edf1ef;
}
.ark-home.theme-pulse:after {
  position: fixed;
  inset: 64px 0 0;
  z-index: 45;
  content: "";
  background: linear-gradient(
    112deg,
    transparent 0 36%,
    color-mix(in srgb, var(--home-accent) 32%, transparent) 45%,
    color-mix(in srgb, var(--home-secondary) 22%, transparent) 53%,
    transparent 62%
  );
  pointer-events: none;
  animation: themeWipe 0.74s cubic-bezier(0.2, 0.72, 0.2, 1) both;
}
.screen {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  min-height: calc(100svh - 64px);
  padding: 14px;
  scroll-margin-top: 64px;
  scroll-snap-align: start;
  scroll-snap-stop: normal;
}
.frame,
.content-frame {
  width: min(1540px, 100%);
  min-height: calc(100svh - 92px);
  margin: auto;
  border: 1px solid var(--line);
  background: rgba(249, 250, 247, 0.76);
  box-shadow: 0 24px 80px rgba(44, 59, 62, 0.08);
  backdrop-filter: blur(10px);
}
.frame {
  display: grid;
  grid-template-rows: auto 1fr auto;
}
.system-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font: 9px var(--vp-font-family-mono);
  letter-spacing: 0.1em;
}
.system-bar i {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 7px;
  background: var(--home-accent);
  box-shadow: 0 0 12px var(--home-accent);
}
.system-bar > b {
  color: var(--home-secondary);
}
.hero-grid {
  display: grid;
  grid-template-columns: 178px minmax(0, 1fr) 245px;
  min-height: 0;
}
.left-menu,
.operators {
  background: rgba(255, 255, 255, 0.5);
}
.left-menu {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--line);
}
.mark {
  display: grid;
  padding: 20px 16px;
  border-bottom: 1px solid var(--line);
}
.mark b {
  color: var(--home-accent);
  font: 800 24px var(--vp-font-family-mono);
}
.mark small,
.left-menu a small {
  color: var(--muted);
  font: 7px var(--vp-font-family-mono);
}
.left-menu > a {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 1px 6px;
  padding: 14px;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
  transition: 0.2s;
}
.left-menu > a:hover {
  padding-left: 19px;
  color: var(--home-accent);
  background: var(--home-soft);
}
.left-menu > a span {
  grid-row: span 2;
  color: var(--home-accent);
  font: 9px var(--vp-font-family-mono);
}
.node-code {
  margin: auto 12px 14px;
  color: var(--muted);
  font: 7px/2 var(--vp-font-family-mono);
}
.hero-stage {
  position: relative;
  overflow: hidden;
  min-height: 540px;
  background: linear-gradient(
    105deg,
    rgba(255, 255, 255, 0.95) 0 45%,
    rgba(238, 247, 247, 0.72) 72%,
    rgba(255, 255, 255, 0.88)
  );
}
.contours {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.7;
}
.contours path {
  fill: none;
}
.minor path {
  stroke: var(--contour-minor);
  stroke-width: 0.65;
  opacity: 0.34;
}
.minor { transform-origin: center; animation: contourDriftA 17s ease-in-out infinite alternate; }
.minor-cross { opacity: .55; animation: contourDriftB 26s ease-in-out infinite alternate-reverse; }
.major path {
  stroke: var(--home-secondary);
  stroke-width: 1.1;
  opacity: 0.55;
}
.major { transform-origin: center; animation: contourDriftB 23s ease-in-out infinite alternate; }
.terrain { transform-box: fill-box; transform-origin: center; }
.terrain path {
  fill: color-mix(in srgb, var(--home-secondary) 3%, transparent);
  stroke: color-mix(in srgb, var(--home-secondary) 72%, var(--contour-minor));
  stroke-width: .85;
  vector-effect: non-scaling-stroke;
}
.terrain path:nth-child(2n) { stroke-dasharray: 3 2; opacity: .72; }
.terrain-a { animation: terrainFloatA 14s ease-in-out infinite alternate; }
.terrain-b { animation: terrainFloatB 19s ease-in-out infinite alternate; }
.terrain-c { animation: terrainFloatA 22s ease-in-out infinite alternate-reverse; }
.elevation {
  position: absolute;
  top: 9%;
  left: 52%;
  color: var(--muted);
  font: 8px var(--vp-font-family-mono);
}
.hero-copy {
  position: relative;
  z-index: 3;
  width: min(720px, 73%);
  padding: clamp(50px, 7vh, 90px) clamp(32px, 6vw, 90px);
}
.hero-copy > p {
  margin: 0 0 20px;
  color: var(--home-accent);
  font: 9px var(--vp-font-family-mono);
  letter-spacing: 0.18em;
}
.hero-copy h1 {
  margin: 0;
  font-size: clamp(3.2rem, 6vw, 7.3rem);
  font-weight: 860;
  line-height: 0.83;
  letter-spacing: -0.075em;
  clip-path: inset(0 100% 0 0);
  transition: clip-path 1s cubic-bezier(0.2, 0.72, 0.2, 1) 0.15s;
}
.active .hero-copy h1 {
  clip-path: inset(0);
}
.hero-copy h1 span {
  display: block;
}
.hero-copy h1 span:last-child {
  color: transparent;
  -webkit-text-stroke: 1.5px var(--ink);
}
.hero-copy > strong {
  display: block;
  max-width: 550px;
  margin-top: 26px;
  color: #465157;
  font-size: clamp(14px, 1.2vw, 18px);
  font-weight: 450;
  line-height: 1.8;
}
.hero-copy > div {
  display: flex;
  gap: 8px;
  margin-top: 28px;
}
.hero-copy a {
  display: flex;
  min-width: 170px;
  justify-content: space-between;
  padding: 13px 15px;
  border: 1px solid var(--line);
  color: var(--ink);
  background: rgba(255, 255, 255, 0.75);
  font: 10px var(--vp-font-family-mono);
  text-decoration: none;
  transition: 0.2s;
}
.hero-copy a:first-child {
  border-color: var(--home-accent);
  color: #fff;
  background: var(--home-accent);
}
.hero-copy a:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 26px
    color-mix(in srgb, var(--home-accent) 20%, transparent);
}
.theme-artifact {
  position: absolute;
  top: 10%;
  right: 3%;
  z-index: 5;
  width: 158px;
  border: 1px solid rgba(255, 255, 255, 0.75);
  color: #fff;
  background: color-mix(in srgb, var(--home-secondary) 82%, #111);
  box-shadow: 0 18px 45px
    color-mix(in srgb, var(--home-accent) 20%, transparent);
  animation: dossierIn 0.55s cubic-bezier(0.2, 0.72, 0.2, 1) both;
}
.theme-artifact header {
  display: grid;
  padding: 8px 9px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.28);
  font: 7px var(--vp-font-family-mono);
}
.theme-artifact header b {
  margin-top: 3px;
  font-size: 11px;
}
.dossier-portrait {
  position: relative;
  height: 136px;
  overflow: hidden;
  background: linear-gradient(
    150deg,
    var(--home-accent),
    var(--home-secondary) 58%,
    #172024
  );
}
.dossier-portrait > img {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, .28));
}
.dossier-portrait:before,
.portrait-amiya:after,
.portrait-w:after,
.portrait-kaltsit:after,
.portrait-surtr:after { display: none; }
.dossier-portrait:before {
  position: absolute;
  top: 31px;
  left: 47px;
  width: 66px;
  height: 82px;
  content: "";
  border-radius: 48% 48% 34% 34%;
  background: #1b2428;
  box-shadow: 0 35px 0 22px #1b2428;
}
.dossier-portrait > i:first-child {
  position: absolute;
  top: 20px;
  left: 39px;
  z-index: 2;
  width: 82px;
  height: 60px;
  background: color-mix(in srgb, var(--home-accent) 25%, #182126);
  clip-path: polygon(
    5% 18%,
    24% 0,
    78% 3%,
    100% 30%,
    88% 78%,
    68% 100%,
    18% 83%,
    0 51%
  );
}
.dossier-portrait > i:nth-child(2) {
  position: absolute;
  inset: auto 9px 8px;
  height: 1px;
  background: rgba(255, 255, 255, 0.5);
}
.dossier-portrait em {
  position: absolute;
  right: 9px;
  bottom: 14px;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  transform: rotate(45deg);
}
.dossier-portrait b {
  position: absolute;
  left: 9px;
  bottom: 13px;
  z-index: 4;
  font: 800 17px var(--vp-font-family-mono);
}
.portrait-amiya:after {
  position: absolute;
  top: -9px;
  left: 49px;
  width: 10px;
  height: 55px;
  content: "";
  border-radius: 80% 20% 30% 30%;
  background: #20292d;
  box-shadow: 38px 3px 0 #20292d;
  transform: rotate(-7deg);
}
.portrait-w:after {
  position: absolute;
  top: 17px;
  left: 39px;
  width: 36px;
  height: 31px;
  content: "";
  border: 5px solid #1c2428;
  border-right: 0;
  border-bottom: 0;
  border-radius: 80% 0 0;
  box-shadow: 44px -1px 0 -6px #1c2428;
  transform: rotate(-24deg);
}
.portrait-kaltsit:after {
  position: absolute;
  top: 5px;
  left: 42px;
  width: 32px;
  height: 48px;
  content: "";
  background: #1d2824;
  clip-path: polygon(50% 100%, 0 0, 100% 32%);
  box-shadow: 50px 0 0 #1d2824;
}
.portrait-surtr:after {
  position: absolute;
  top: 10px;
  left: 34px;
  width: 42px;
  height: 35px;
  content: "";
  border-top: 7px solid #241b1b;
  border-radius: 50%;
  box-shadow: 52px 2px 0 -3px #241b1b;
  transform: rotate(-28deg);
}
.signature-item {
  position: relative;
  height: 54px;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(10, 16, 18, 0.3);
}
.signature-item span {
  position: absolute;
  right: 8px;
  bottom: 7px;
  font: 6px var(--vp-font-family-mono);
}
.signature-item i {
  position: absolute;
  top: 9px;
  left: 13px;
  width: 31px;
  height: 31px;
  border: 2px solid var(--home-accent);
}
.artifact-amiya .signature-item i {
  border-radius: 50%;
  box-shadow:
    inset 0 0 0 5px transparent,
    0 0 0 1px rgba(255, 255, 255, 0.55);
}
.artifact-w .signature-item i {
  transform: rotate(45deg);
  background: repeating-linear-gradient(
    90deg,
    transparent 0 5px,
    var(--home-accent) 5px 7px
  );
}
.artifact-kaltsit .signature-item i {
  background: var(--home-accent);
  clip-path: polygon(50% 0, 100% 68%, 50% 100%, 0 68%);
  border: 0;
}
.artifact-surtr .signature-item i {
  top: 4px;
  left: 24px;
  width: 7px;
  height: 41px;
  background: var(--home-accent);
  transform: rotate(38deg);
  box-shadow: 0 -5px 0 -1px #fff;
}
.theme-artifact > footer {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  font: 6px var(--vp-font-family-mono);
}
.theme-artifact > footer i {
  width: 45px;
  height: 3px;
  background: var(--home-accent);
}
.operators {
  border-left: 1px solid var(--line);
}
.operators > header {
  padding: 13px 12px;
  border-bottom: 1px solid var(--line);
  font: 9px var(--vp-font-family-mono);
}
.operators > header span {
  color: var(--muted);
}
.operators > button {
  display: grid;
  grid-template-columns: 54px 1fr 12px;
  gap: 9px;
  align-items: center;
  width: 100%;
  padding: 10px;
  border: 0;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.35s,
    box-shadow 0.35s,
    color 0.35s;
}
.operators > button:hover,
.operators > button.active {
  background: var(--home-soft);
}
.operators > button.active {
  box-shadow: inset 3px 0 var(--home-accent);
}
.avatar {
  position: relative;
  display: grid;
  place-items: end center;
  overflow: hidden;
  width: 52px;
  height: 52px;
  color: #fff;
  background: linear-gradient(145deg, var(--swatch), #263034 65%);
  font: 700 10px var(--vp-font-family-mono);
  clip-path: polygon(0 0, 82% 0, 100% 18%, 100% 100%, 18% 100%, 0 82%);
}
.avatar > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .35s ease, filter .35s ease;
}
.operators > button:hover .avatar > img,
.operators > button.active .avatar > img { transform: scale(1.08); filter: saturate(1.12); }
.avatar:after { display: none; }
.avatar > i {
  position: absolute;
  top: 17px;
  left: 15px;
  width: 25px;
  height: 30px;
  border-radius: 48% 48% 32% 32%;
  background: #172024;
  box-shadow: 0 20px 0 9px #172024;
}
.avatar > b {
  z-index: 2;
  margin-bottom: 3px;
}
.avatar:after {
  position: absolute;
  content: "";
  background: #172024;
}
.avatar-amiya:after {
  top: -4px;
  left: 14px;
  width: 5px;
  height: 28px;
  border-radius: 90% 20%;
  box-shadow: 18px 2px 0 #172024;
  transform: rotate(-8deg);
}
.avatar-w:after {
  top: 7px;
  left: 9px;
  width: 18px;
  height: 15px;
  border: 3px solid #172024;
  border-right: 0;
  border-bottom: 0;
  border-radius: 90% 0;
  box-shadow: 24px -1px 0 -4px #172024;
  transform: rotate(-23deg);
}
.avatar-kaltsit:after {
  top: 2px;
  left: 10px;
  width: 16px;
  height: 25px;
  clip-path: polygon(50% 100%, 0 0, 100% 30%);
  box-shadow: 26px 0 0 #172024;
}
.avatar-surtr:after {
  top: 5px;
  left: 7px;
  width: 22px;
  height: 17px;
  border-top: 4px solid #172024;
  border-radius: 50%;
  box-shadow: 27px 1px 0 -2px #172024;
  transform: rotate(-25deg);
}
.operators button span:nth-child(2) b,
.operators button small {
  display: block;
}
.operators button small {
  margin-top: 4px;
  color: var(--muted);
  font: 7px var(--vp-font-family-mono);
}
.operators em {
  width: 8px;
  height: 8px;
  border: 1px solid var(--muted);
  border-radius: 50%;
}
.operators button.active em {
  border: 3px solid #fff;
  background: var(--home-accent);
  box-shadow: 0 0 0 1px var(--home-accent);
}
.operators footer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 7px;
  padding: 13px 12px;
  font: 7px var(--vp-font-family-mono);
}
.operators footer b {
  color: var(--home-accent);
}
.operators footer small {
  grid-column: 1/-1;
  color: var(--muted);
  font: 6px var(--vp-font-family-mono);
}
.operators footer span {
  grid-column: 1/-1;
  display: flex;
}
.operators footer i {
  width: 33.3%;
  height: 7px;
  background: var(--home-accent);
}
.operators footer i:nth-child(2) {
  background: var(--home-secondary);
}
.operators footer i:nth-child(3) {
  background: #343b41;
}
.telemetry {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.65);
}
.telemetry div {
  display: grid;
  grid-template-columns: 1fr auto;
  padding: 12px 16px;
  border-right: 1px solid var(--line);
}
.telemetry span {
  color: var(--muted);
  font: 8px var(--vp-font-family-mono);
}
.telemetry b {
  font: 700 10px var(--vp-font-family-mono);
}
.scroll-cue {
  position: absolute;
  right: 34px;
  bottom: 24px;
  z-index: 8;
  display: flex;
  gap: 12px;
  align-items: center;
  border: 0;
  color: var(--muted);
  background: transparent;
  font: 8px var(--vp-font-family-mono);
  cursor: pointer;
}
.scroll-cue i {
  position: relative;
  width: 22px;
  height: 34px;
  border: 1px solid var(--line);
  border-radius: 12px;
}
.scroll-cue i:after {
  position: absolute;
  top: 6px;
  left: 9px;
  width: 2px;
  height: 7px;
  content: "";
  background: var(--home-accent);
  animation: scrollDot 1.8s ease-in-out infinite;
}
.switcher {
  position: fixed;
  top: 50%;
  right: 7px;
  z-index: 30;
  display: grid;
  gap: 7px;
  transform: translateY(-50%);
}
.switcher button {
  width: 34px;
  height: 28px;
  border: 1px solid transparent;
  color: #6c7477;
  background: rgba(255, 255, 255, 0.66);
  font: 8px var(--vp-font-family-mono);
  cursor: pointer;
}
.switcher button.active {
  border-color: var(--home-accent);
  color: var(--home-accent);
  box-shadow: inset 3px 0 var(--home-accent);
}
.content-frame {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  padding: clamp(26px, 4vw, 62px);
}
.section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: clamp(24px, 4vh, 44px);
}
.section-head span {
  color: var(--home-accent);
  font: 9px var(--vp-font-family-mono);
  letter-spacing: 0.16em;
}
.section-head h2 {
  margin: 8px 0 6px;
  font-size: clamp(2.7rem, 5vw, 5.7rem);
  line-height: 0.9;
  letter-spacing: -0.065em;
}
.section-head p {
  margin: 0;
  color: var(--muted);
}
.section-head > a {
  padding: 12px 16px;
  border: 1px solid var(--home-accent);
  color: var(--home-accent);
  font: 9px var(--vp-font-family-mono);
  text-decoration: none;
}
.heat {
  width: min(280px, 24vw);
}
.heat > span,
.heat > b {
  display: block;
  text-align: right;
}
.heat > b {
  margin: 5px 0 9px;
  font: 700 30px var(--vp-font-family-mono);
}
.heat > i {
  display: block;
  height: 6px;
  background: rgba(30, 40, 43, 0.09);
}
.heat > i > i {
  display: block;
  width: 86.4%;
  height: 100%;
  background: linear-gradient(90deg, var(--home-secondary), var(--home-accent));
}
.record-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 13px;
}
.record {
  display: grid;
  grid-template-columns: 34% 1fr;
  min-height: 270px;
  border: 1px solid var(--line);
  color: var(--ink);
  background: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  transition: 0.28s;
}
.record:hover {
  border-color: var(--home-accent);
  transform: translateY(-7px);
  box-shadow: 0 18px 40px rgba(35, 50, 54, 0.1);
}
.record-art {
  position: relative;
  overflow: hidden;
  border-right: 1px solid var(--line);
  background: linear-gradient(145deg, #dff2f2, #f7f7f2 52%, #d8e0e1);
}
.record-art img {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  padding: 32px 14px;
  object-fit: contain;
  filter: drop-shadow(0 12px 18px rgba(19, 34, 39, .2));
  transition: transform .35s ease, filter .35s ease;
}
.record:hover .record-art img { transform: scale(1.07); filter: drop-shadow(0 15px 22px rgba(19, 34, 39, .3)); }
.record-art:before {
  position: absolute;
  inset: -20%;
  content: "";
  border: 14px solid var(--home-secondary);
  transform: rotate(38deg);
  opacity: 0.16;
}
.record-art span {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  color: var(--muted);
  font: 8px var(--vp-font-family-mono);
}
.record-art i {
  position: absolute;
  right: 28%;
  bottom: -5%;
  z-index: 0;
  width: 1px;
  height: 70%;
  background: var(--home-accent);
  transform: rotate(42deg);
}
.record-art i:nth-of-type(2) {
  right: 42%;
}
.record-art i:nth-of-type(3) {
  right: 56%;
}
.record-copy {
  display: flex;
  flex-direction: column;
  padding: 20px;
}
.record-copy > span {
  align-self: flex-start;
  padding: 3px 6px;
  border: 1px solid var(--home-accent);
  color: var(--home-accent);
  font: 8px var(--vp-font-family-mono);
}
.record-copy h3 {
  margin: 24px 0 10px;
  font-size: clamp(17px, 1.5vw, 23px);
  line-height: 1.35;
}
.record-copy p {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}
.record-copy footer {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  color: var(--muted);
  font: 8px var(--vp-font-family-mono);
}
.record-copy footer b {
  color: var(--home-accent);
  font-size: 18px;
}
.status-grid {
  display: grid;
  grid-template-columns: 2fr repeat(3, 0.65fr) 1fr;
  margin-top: 13px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.65);
}
.node-map {
  padding: 10px 14px;
  border-right: 1px solid var(--line);
}
.node-map header {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font: 8px var(--vp-font-family-mono);
}
.node-map svg {
  width: 100%;
  height: 78px;
}
.node-map path {
  fill: none;
  stroke: var(--home-secondary);
}
.node-map circle {
  fill: #fff;
  stroke: var(--home-accent);
  stroke-width: 2;
}
.metric {
  display: grid;
  padding: 14px;
  border-right: 1px solid var(--line);
}
.metric span {
  color: var(--muted);
  font: 8px var(--vp-font-family-mono);
}
.metric b {
  font: 17px var(--vp-font-family-mono);
}
.metric i {
  align-self: end;
  height: 3px;
  background: linear-gradient(90deg, var(--home-accent) 32%, var(--line) 32%);
}
.online {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px;
}
.online > i {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--home-secondary);
  box-shadow: 0 0 0 7px
    color-mix(in srgb, var(--home-secondary) 15%, transparent);
}
.online span,
.online small {
  display: block;
  font: 8px var(--vp-font-family-mono);
}
.online small {
  margin-top: 6px;
  color: var(--muted);
}
.sector-list {
  border-top: 1px solid var(--line);
}
.sector {
  display: grid;
  grid-template-columns: 90px 1fr auto;
  gap: 28px;
  align-items: center;
  min-height: 126px;
  padding: 10px 22px;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
  transition: 0.25s;
}
.sector:hover {
  padding-left: 32px;
  background: var(--home-soft);
}
.sector > span {
  color: var(--home-accent);
  font: 700 40px var(--vp-font-family-mono);
}
.sector small {
  color: var(--muted);
  font: 8px var(--vp-font-family-mono);
}
.sector h3 {
  margin: 4px 0;
  font-size: clamp(22px, 2.5vw, 34px);
}
.sector p {
  margin: 0;
  color: var(--muted);
}
.sector > b {
  color: var(--home-accent);
  font-size: 25px;
}
.archive-dashboard {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(300px, .82fr);
  min-height: 360px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, .58);
}
.topic-overview,
.note-timeline { min-width: 0; }
.topic-overview { padding: 16px; border-right: 1px solid var(--line); }
.topic-overview > header,
.note-timeline > header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font: 8px var(--vp-font-family-mono);
  letter-spacing: .09em;
}
.topic-overview > header span,
.note-timeline > header span { color: var(--home-accent); }
.topic-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding-top: 12px;
}
.topic-stat {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 5px 10px;
  padding: 8px 9px;
  border: 1px solid var(--line);
  color: var(--ink);
  background: rgba(255, 255, 255, .42);
  text-decoration: none;
  transition: border-color .2s, transform .2s, background .2s;
}
.topic-stat:hover { border-color: var(--home-accent); background: var(--home-soft); transform: translateY(-2px); }
.topic-stat > span { overflow: hidden; font-size: 11px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.topic-stat > b { color: var(--home-accent); font: 700 13px var(--vp-font-family-mono); }
.topic-stat > i { align-self: center; overflow: hidden; height: 4px; background: var(--line); }
.topic-stat > i > i { display: block; min-width: 3px; height: 100%; background: linear-gradient(90deg, var(--home-secondary), var(--home-accent)); }
.topic-stat > small { color: var(--muted); font: 7px var(--vp-font-family-mono); text-align: right; }
.note-timeline { padding: 16px; }
.note-timeline > div { position: relative; padding-top: 5px; }
.note-timeline a {
  display: grid;
  grid-template-columns: 42px 10px minmax(0, 1fr) 18px;
  gap: 8px;
  align-items: center;
  min-height: 49px;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
}
.note-timeline a:last-child { border-bottom: 0; }
.note-timeline time { color: var(--muted); font: 8px var(--vp-font-family-mono); }
.note-timeline a > i { position: relative; width: 7px; height: 7px; border: 2px solid var(--home-accent); border-radius: 50%; }
.note-timeline a > i::after { position: absolute; top: 9px; left: 2px; width: 1px; height: 40px; content: ''; background: var(--line); }
.note-timeline a:last-child > i::after { display: none; }
.note-timeline a > span { display: grid; min-width: 0; }
.note-timeline a small { color: var(--home-accent); font: 7px var(--vp-font-family-mono); }
.note-timeline a span b { overflow: hidden; margin-top: 2px; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.note-timeline em { color: var(--muted); font: 7px var(--vp-font-family-mono); }
.note-timeline a:hover span b { color: var(--home-accent); }
.protocol {
  display: grid;
  grid-template-columns: 1fr 1.7fr auto;
  gap: 32px;
  align-items: center;
  margin-top: 26px;
  padding: 24px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.68);
}
.wave {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 54px;
}
.wave i {
  flex: 1;
  max-width: 4px;
  background: var(--home-secondary);
  opacity: 0.55;
  animation: wave 2.8s ease-in-out infinite alternate;
}
.wave i:nth-child(3n) {
  animation-delay: -1s;
}
.protocol span {
  color: var(--home-accent);
  font: 8px var(--vp-font-family-mono);
}
.protocol strong {
  display: block;
  margin-top: 7px;
  font-size: 17px;
}
.protocol a {
  color: var(--ink);
  font: 9px var(--vp-font-family-mono);
  text-decoration: none;
}
.footer-frame {
  display: grid;
  grid-template-rows: auto 1fr auto;
  box-sizing: border-box;
  width: min(1540px, 100%);
  min-height: calc(100svh - 92px);
  margin: auto;
  padding: clamp(28px, 5vw, 72px);
  border: 1px solid var(--line);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--home-secondary) 8%, transparent), transparent 42%),
    rgba(249, 250, 247, .78);
  backdrop-filter: blur(10px);
}
.footer-heading span,
.footer-column header { color: var(--home-accent); font: 9px var(--vp-font-family-mono); letter-spacing: .14em; }
.footer-heading h2 { margin: 10px 0 8px; font-size: clamp(3rem, 7vw, 7.5rem); line-height: .88; letter-spacing: -.07em; }
.footer-heading p { margin: 0; color: var(--muted); }
.footer-links { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-self: center; margin: 36px 0; }
.footer-column { border: 1px solid var(--line); background: rgba(255, 255, 255, .58); }
.footer-column header { display: flex; justify-content: space-between; padding: 12px 14px; border-bottom: 1px solid var(--line); }
.footer-column header b { color: var(--muted); font-size: 7px; }
.footer-column a {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  gap: 2px 12px;
  align-items: center;
  padding: 14px;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
  transition: padding .22s, color .22s, background .22s;
}
.footer-column a:last-child { border-bottom: 0; }
.footer-column a:hover { padding-left: 20px; color: var(--home-accent); background: var(--home-soft); }
.footer-column a > span { grid-row: span 2; color: var(--home-accent); font: 9px var(--vp-font-family-mono); }
.footer-column a > b { font-size: 15px; }
.footer-column a > small { color: var(--muted); font: 7px var(--vp-font-family-mono); letter-spacing: .08em; }
.footer-column a > em { grid-row: 1 / span 2; grid-column: 3; font-style: normal; }
.footer-bottom { display: flex; gap: 28px; align-items: center; padding-top: 18px; border-top: 1px solid var(--line); color: var(--muted); font: 8px var(--vp-font-family-mono); letter-spacing: .08em; }
.footer-bottom b { margin-left: auto; color: var(--home-secondary); }
.footer-bottom a { color: var(--home-accent); text-decoration: none; }
:global(.dark .ark-home) {
  --ink: #e8edef;
  --muted: #99a5aa;
  --line: rgba(211, 226, 230, 0.13);
  --contour-minor: #67858b;
  background: #101618;
}
:global(.dark .ark-home .frame),
:global(.dark .ark-home .content-frame),
:global(.dark .ark-home .footer-frame) {
  background: rgba(15, 21, 23, 0.78);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.28);
}
:global(.dark .ark-home .left-menu),
:global(.dark .ark-home .operators),
:global(.dark .ark-home .telemetry),
:global(.dark .ark-home .record),
:global(.dark .ark-home .status-grid),
:global(.dark .ark-home .protocol),
:global(.dark .ark-home .archive-dashboard) { background: rgba(20, 27, 29, 0.7); }
:global(.dark .ark-home .topic-stat) { background: rgba(12, 18, 20, .5); }
:global(.dark .ark-home .footer-column) { background: rgba(20, 27, 29, .72); }
:global(.dark .ark-home .hero-stage) {
  background:
    radial-gradient(circle at 68% 34%, color-mix(in srgb, var(--home-secondary) 12%, transparent), transparent 37%),
    linear-gradient(105deg, rgba(14, 20, 22, 0.98) 0 44%, rgba(20, 31, 33, 0.9) 72%, rgba(14, 20, 22, 0.96));
}
:global(.dark .ark-home .operators button),
:global(.dark .ark-home .sector),
:global(.dark .ark-home .record),
:global(.dark .ark-home .protocol a) { color: var(--ink); }
:global(.dark .ark-home .operators button:hover),
:global(.dark .ark-home .operators button.active),
:global(.dark .ark-home .sector:hover) { background: color-mix(in srgb, var(--home-soft) 55%, rgba(23, 31, 34, .82)); }
:global(.dark .ark-home .record-art) { background: linear-gradient(145deg, #18272a, #22292b 52%, #152023); }
:global(.dark .ark-home .node-map circle) { fill: #182023; }
:global(.dark .ark-home .switcher button) { color: #a8b2b5; background: rgba(20, 27, 29, 0.84); }
:global(.dark .ark-home .heat > i) { background: rgba(255, 255, 255, 0.08); }
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.7s,
    transform 0.8s cubic-bezier(0.2, 0.75, 0.2, 1);
}
.r1 {
  transition-delay: 0.06s;
}
.r2 {
  transition-delay: 0.16s;
}
.r3 {
  transition-delay: 0.29s;
}
.screen.active .reveal {
  opacity: 1;
  transform: none;
}
@keyframes contourDriftA {
  from { transform: translate3d(-10px, -3px, 0) scale(1.015); }
  to { transform: translate3d(13px, 7px, 0) scale(.99); }
}
@keyframes contourDriftB {
  from { transform: translate3d(9px, 6px, 0) scale(.99); }
  to { transform: translate3d(-14px, -5px, 0) scale(1.018); }
}
@keyframes terrainFloatA {
  from { transform: translate3d(-8px, 5px, 0) rotate(-.35deg) scale(.98); }
  to { transform: translate3d(13px, -9px, 0) rotate(.55deg) scale(1.035); }
}
@keyframes terrainFloatB {
  from { transform: translate3d(8px, -7px, 0) rotate(.4deg) scale(1.03); }
  to { transform: translate3d(-12px, 8px, 0) rotate(-.5deg) scale(.985); }
}
@keyframes scrollDot {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.3;
  }
  50% {
    transform: translateY(13px);
    opacity: 1;
  }
}
@keyframes wave {
  to {
    transform: scaleY(0.45);
    opacity: 0.25;
  }
}
@keyframes themeWipe {
  0% {
    opacity: 0;
    transform: translateX(-55%);
  }
  35% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(55%);
  }
}
@keyframes dossierIn {
  from {
    opacity: 0;
    transform: translateX(24px) skewX(-4deg);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (max-width: 1180px) {
  .hero-grid {
    grid-template-columns: 145px minmax(0, 1fr) 205px;
  }
  .hero-copy {
    width: 82%;
    padding-inline: 40px;
  }
  .record-grid {
    grid-template-columns: 1fr;
  }
  .record {
    min-height: 180px;
    grid-template-columns: 170px 1fr;
  }
  .records-screen,
  .archive-screen {
    height: auto;
  }
  .status-grid {
    grid-template-columns: 1.6fr repeat(3, 0.6fr);
  }
  .status-grid > .online {
    display: none;
  }
}
@media (max-width: 900px) {
  :global(html.home-scroll-mode) {
    scroll-snap-type: none;
  }
  .screen {
    min-height: auto;
    padding: 8px;
    scroll-snap-align: none;
  }
  .frame,
  .content-frame {
    min-height: auto;
  }
  .hero-grid {
    grid-template-columns: 1fr;
  }
  .left-menu,
  .theme-artifact {
    display: none;
  }
  .hero-stage {
    min-height: 610px;
  }
  .operators {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid var(--line);
    border-left: 0;
  }
  .operators > header,
  .operators > footer {
    grid-column: 1/-1;
  }
  .operators > button {
    grid-template-columns: 40px 1fr;
  }
  .avatar {
    width: 40px;
    height: 40px;
  }
  .operators em {
    display: none;
  }
  .telemetry {
    grid-template-columns: 1fr 1fr;
  }
  .content-frame {
    padding: 34px 20px;
  }
  .switcher,
  .scroll-cue {
    display: none;
  }
  .status-grid {
    grid-template-columns: 1fr 1fr;
  }
  .node-map {
    grid-column: 1/-1;
  }
  .protocol {
    grid-template-columns: 1fr;
  }
  .archive-dashboard { grid-template-columns: 1fr; }
  .topic-overview { border-right: 0; border-bottom: 1px solid var(--line); }
}
@media (max-width: 600px) {
  .system-bar span:nth-child(2),
  .system-bar span:nth-child(3) {
    display: none;
  }
  .hero-stage {
    min-height: 560px;
  }
  .hero-copy {
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    padding: 52px 22px;
  }
  .hero-copy h1 {
    font-size: clamp(2.55rem, 13.2vw, 3.7rem);
    letter-spacing: -0.09em;
  }
  .hero-copy > strong {
    max-width: 100%;
    font-size: 13px;
    overflow-wrap: anywhere;
  }
  .hero-copy > div {
    flex-direction: column;
  }
  .operators {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .operators > button,
  .operators button span:nth-child(2) {
    min-width: 0;
  }
  .telemetry {
    grid-template-columns: 1fr;
  }
  .section-head {
    display: block;
  }
  .section-head h2 {
    font-size: 3rem;
  }
  .section-head > a {
    display: inline-block;
    margin-top: 18px;
  }
  .heat {
    width: 100%;
    margin-top: 20px;
  }
  .heat > span,
  .heat > b {
    text-align: left;
  }
  .record {
    grid-template-columns: 1fr;
  }
  .record-art {
    height: 110px;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
  .status-grid {
    grid-template-columns: 1fr;
  }
  .sector {
    grid-template-columns: 42px 1fr;
    gap: 12px;
    padding-inline: 12px;
  }
  .sector > span {
    font-size: 26px;
  }
  .sector > b {
    display: none;
  }
  .topic-grid { grid-template-columns: 1fr; }
  .archive-dashboard { min-height: 0; }
  .footer-frame { min-height: auto; padding: 34px 18px; }
  .footer-links { grid-template-columns: 1fr; }
  .footer-column header b { display: none; }
  .footer-bottom { align-items: flex-start; flex-direction: column; gap: 8px; }
  .footer-bottom b { margin-left: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .scroll-cue i:after,
  .wave i,
  .theme-artifact,
  .minor,
  .major,
  .terrain,
  .ark-home.theme-pulse:after {
    animation: none !important;
  }
  .reveal,
  .hero-copy h1 {
    opacity: 1;
    transform: none;
    clip-path: none;
    transition: none;
  }
}
</style>
