import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import CodePlayground from '../components/CodePlayground.vue'
import CodeCompare from '../components/CodeCompare.vue'
import ParallelTables from '../components/ParallelTables.vue'
import HeadingNumbers from '../components/HeadingNumbers.vue'
import DataChart from '../components/DataChart.vue'
import BarChart from '../components/BarChart.vue'
import LineChart from '../components/LineChart.vue'
import PieChart from '../components/PieChart.vue'
import ComponentGroup from '../components/ComponentGroup.vue'
import ComponentSlot from '../components/ComponentSlot.vue'
import DocFieldFrame from '../components/DocFieldFrame.vue'
import DocFieldFooter from '../components/DocFieldFooter.vue'
import SidebarToggle from '../components/SidebarToggle.vue'
import OperatorPageAura from '../components/OperatorPageAura.vue'
import InstructionSlots from '../components/InstructionSlots.vue'
import MaskedLaneOperation from '../components/MaskedLaneOperation.vue'
import PackSaturationOperation from '../components/PackSaturationOperation.vue'
import RegisterOperation from '../components/RegisterOperation.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'layout-top': () => h('div', { class: 'site-scanlines', 'aria-hidden': 'true' }),
    'layout-bottom': () => h('div', { class: 'global-interface-layer' }, [
      h(OperatorPageAura),
      h(SidebarToggle),
      h(HeadingNumbers),
    ]),
    'doc-before': () => h(DocFieldFrame),
    'doc-after': () => h(DocFieldFooter),
  }),
  enhanceApp({ app }) {
    app.component('CodePlayground', CodePlayground)
    app.component('CodeCompare', CodeCompare)
    app.component('ParallelTables', ParallelTables)
    app.component('DataChart', DataChart)
    app.component('BarChart', BarChart)
    app.component('LineChart', LineChart)
    app.component('PieChart', PieChart)
    app.component('ComponentGroup', ComponentGroup)
    app.component('ComponentSlot', ComponentSlot)
    app.component('InstructionSlots', InstructionSlots)
    app.component('MaskedLaneOperation', MaskedLaneOperation)
    app.component('PackSaturationOperation', PackSaturationOperation)
    app.component('RegisterOperation', RegisterOperation)
    if (typeof window !== 'undefined') {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.documentElement.style.setProperty('--site-scrollbar-width', `${scrollbarWidth}px`)
    }
  },
}
