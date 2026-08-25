import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import CodePlayground from '../components/CodePlayground.vue'
import CodeCompare from '../components/CodeCompare.vue'
import DocFieldFrame from '../components/DocFieldFrame.vue'
import DocFieldFooter from '../components/DocFieldFooter.vue'
import SidebarToggle from '../components/SidebarToggle.vue'
import OperatorPageAura from '../components/OperatorPageAura.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'layout-top': () => h('div', { class: 'site-scanlines', 'aria-hidden': 'true' }),
    'layout-bottom': () => h('div', { class: 'global-interface-layer' }, [
      h(OperatorPageAura),
      h(SidebarToggle),
    ]),
    'doc-before': () => h(DocFieldFrame),
    'doc-after': () => h(DocFieldFooter),
  }),
  enhanceApp({ app }) {
    app.component('CodePlayground', CodePlayground)
    app.component('CodeCompare', CodeCompare)
    if (typeof window !== 'undefined') {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.documentElement.style.setProperty('--site-scrollbar-width', `${scrollbarWidth}px`)
    }
  },
}
