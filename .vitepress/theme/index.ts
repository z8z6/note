import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import CodePlayground from '../components/CodePlayground.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'layout-top': () => h('div', { class: 'site-scanlines', 'aria-hidden': 'true' }),
    'doc-before': () => h('div', { class: 'document-coordinate', 'aria-hidden': 'true' }, 'ARCHIVE / ACTIVE RECORD'),
  }),
  enhanceApp({ app }) {
    app.component('CodePlayground', CodePlayground)
  },
}
