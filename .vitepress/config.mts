import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'

const cxxSidebar = [
  {
    text: 'C++ 基础',
    collapsed: false,
    items: [
      { text: 'C++ 笔记', link: '/lang/cxx/' },
      { text: '类与对象', link: '/lang/cxx/oop/class' },
      { text: '复制消除', link: '/lang/cxx/17/copy_elision' },
    ],
  },
  {
    text: '现代 C++',
    collapsed: false,
    items: [
      { text: 'decltype', link: '/lang/cxx/0x/decltype' },
      { text: '右值引用', link: '/lang/cxx/0x/rvalue_ref' },
      { text: 'shared_ptr', link: '/lang/cxx/0x/shared_ptr' },
      { text: 'unique_ptr', link: '/lang/cxx/0x/unique_ptr' },
      { text: 'weak_ptr', link: '/lang/cxx/0x/weak_ptr' },
      { text: '范围 for', link: '/lang/cxx/0x/range_for' },
      { text: 'initializer_list', link: '/lang/cxx/0x/intializer_list' },
      { text: '最令人困惑的解析', link: '/lang/cxx/0x/vexing_parse' },
    ],
  },
  {
    text: '标准库',
    collapsed: true,
    items: [
      { text: 'STL 导览', link: '/lang/cxx/stl/' },
      { text: 'vector', link: '/lang/cxx/stl/container/vector' },
      { text: 'array', link: '/lang/cxx/stl/container/array' },
      { text: 'list', link: '/lang/cxx/stl/container/list' },
      { text: 'forward_list', link: '/lang/cxx/stl/container/forward_list' },
      { text: '迭代器', link: '/lang/cxx/stl/iterator/iterator' },
      { text: 'const_iterator', link: '/lang/cxx/stl/iterator/const_iterator' },
      { text: '迭代器适配器', link: '/lang/cxx/stl/adapter/iterator' },
      { text: '函数对象', link: '/lang/cxx/stl/adapter/functor' },
    ],
  },
  {
    text: '流与 I/O',
    collapsed: true,
    items: [
      { text: 'iostream 导览', link: '/lang/cxx/stream/' },
      { text: 'basic_ios', link: '/lang/cxx/stream/basic_ios' },
      { text: 'basic_istream', link: '/lang/cxx/stream/basic_istream' },
      { text: 'basic_ostream', link: '/lang/cxx/stream/basic_ostream' },
      { text: 'ifstream', link: '/lang/cxx/stream/basic_ifstream' },
      { text: 'ofstream', link: '/lang/cxx/stream/basic_ofstream' },
      { text: 'ios_base', link: '/lang/cxx/stream/ios_base' },
      { text: 'manipulator', link: '/lang/cxx/stream/manipulator' },
      { text: '本地化与 Unicode', link: '/lang/cxx/stream/i18n' },
    ],
  },
]

const enCxxSidebar = [
  {
    text: 'C++ Fundamentals',
    collapsed: false,
    items: [
      { text: 'C++ Notes', link: '/en/lang/cxx/' },
      { text: 'Classes and Objects', link: '/en/lang/cxx/oop/class' },
      { text: 'Copy Elision', link: '/en/lang/cxx/17/copy_elision' },
    ],
  },
  {
    text: 'Modern C++',
    collapsed: false,
    items: [
      { text: 'decltype', link: '/en/lang/cxx/0x/decltype' },
      { text: 'Rvalue References', link: '/en/lang/cxx/0x/rvalue_ref' },
      { text: 'shared_ptr', link: '/en/lang/cxx/0x/shared_ptr' },
      { text: 'unique_ptr', link: '/en/lang/cxx/0x/unique_ptr' },
      { text: 'weak_ptr', link: '/en/lang/cxx/0x/weak_ptr' },
      { text: 'Range-based for', link: '/en/lang/cxx/0x/range_for' },
      { text: 'initializer_list', link: '/en/lang/cxx/0x/intializer_list' },
      { text: 'Vexing Parse', link: '/en/lang/cxx/0x/vexing_parse' },
    ],
  },
  {
    text: 'Standard Library',
    collapsed: true,
    items: [
      { text: 'STL Overview', link: '/en/lang/cxx/stl/' },
      { text: 'vector', link: '/en/lang/cxx/stl/container/vector' },
      { text: 'array', link: '/en/lang/cxx/stl/container/array' },
      { text: 'list', link: '/en/lang/cxx/stl/container/list' },
      { text: 'forward_list', link: '/en/lang/cxx/stl/container/forward_list' },
      { text: 'Iterators', link: '/en/lang/cxx/stl/iterator/iterator' },
      { text: 'const_iterator', link: '/en/lang/cxx/stl/iterator/const_iterator' },
      { text: 'Iterator Adapters', link: '/en/lang/cxx/stl/adapter/iterator' },
      { text: 'Function Objects', link: '/en/lang/cxx/stl/adapter/functor' },
    ],
  },
  {
    text: 'Streams and I/O',
    collapsed: true,
    items: [
      { text: 'iostream Overview', link: '/en/lang/cxx/stream/' },
      { text: 'basic_ios', link: '/en/lang/cxx/stream/basic_ios' },
      { text: 'basic_istream', link: '/en/lang/cxx/stream/basic_istream' },
      { text: 'basic_ostream', link: '/en/lang/cxx/stream/basic_ostream' },
      { text: 'ifstream', link: '/en/lang/cxx/stream/basic_ifstream' },
      { text: 'ofstream', link: '/en/lang/cxx/stream/basic_ofstream' },
      { text: 'ios_base', link: '/en/lang/cxx/stream/ios_base' },
      { text: 'manipulator', link: '/en/lang/cxx/stream/manipulator' },
      { text: 'Locale and Unicode', link: '/en/lang/cxx/stream/i18n' },
    ],
  },
]

export default defineConfig({
  lang: 'zh-CN',
  title: 'z8z6',
  titleTemplate: ':title · z8z6',
  description: '个人博客',
  srcDir: './src',
  vite: {
    publicDir: fileURLToPath(new URL('../public', import.meta.url)),
  },
  locales: {
    root: { label: '简体中文', lang: 'zh-CN' },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      description: 'Personal technical field notes on programming, systems, and the digital world',
    },
  },
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/logo-wisadel-prts.png', type: 'image/png' }],
    ['meta', { name: 'theme-color', content: '#101214' }],
    ['meta', { name: 'author', content: 'CXXCXX' }],
    ['meta', { name: 'baidu-site-verification', content: 'codeva-Br32LI008w' }],
  ],
  sitemap: {
    hostname: 'https://cxxcxx.com',
  },
  markdown: {
    lineNumbers: true,
    image: { lazyLoading: true },
    theme: {
      light: 'github-light',
      dark: 'github-dark-dimmed',
    },
  },
  themeConfig: {
    logo: '/logo-wisadel-prts.png',
    siteTitle: 'z8z6',
    nav: [
      { text: '首页', link: '/' },
      { text: '知识库', link: '/lang/cxx/' },
      { text: '实验室', link: '/lab/' },
      { text: '归档', link: '/archive' },
      { text: '关于', link: '/about' },
    ],
    locales: {
      root: { label: '简体中文' },
      en: {
        label: 'English',
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Knowledge Base', link: '/en/lang/cxx/' },
          { text: 'Lab', link: '/en/lab/' },
          { text: 'Archive', link: '/en/archive' },
          { text: 'About', link: '/en/about' },
        ],
        sidebar: {
          '/en/lang/cxx/': enCxxSidebar,
          '/en/lang/': [
            { text: 'Languages and Systems', items: [
              { text: 'C++', link: '/en/lang/cxx/' },
              { text: 'C Functions', link: '/en/lang/c/function' },
              { text: 'Bash', link: '/en/lang/bash/bash' },
              { text: 'Assembly', link: '/en/lang/asm/' },
              { text: 'i386', link: '/en/lang/asm/i386/' },
            ] },
          ],
          '/en/lab/': [
            { text: 'Lab', items: [
              { text: 'Interactive Code', link: '/en/lab/' },
            ] },
          ],
        },
        outline: { level: [2, 3], label: 'On this page' },
        lastUpdated: { text: 'Last updated' },
        docFooter: { prev: 'Previous', next: 'Next' },
        darkModeSwitchLabel: 'Appearance',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Return to top',
      },
    },
    sidebar: {
      '/lang/cxx/': cxxSidebar,
      '/lang/': [
        { text: '语言与系统', items: [
          { text: 'C++', link: '/lang/cxx/' },
          { text: 'C 函数', link: '/lang/c/function' },
          { text: 'Bash', link: '/lang/bash/bash' },
          { text: '汇编', link: '/lang/asm/' },
          { text: 'i386', link: '/lang/asm/i386/' },
        ] },
      ],
      '/lab/': [
        { text: '实验室', items: [
          { text: '交互代码', link: '/lab/' },
        ] },
      ],
    },
    outline: {
      level: [2, 3],
      label: '本页坐标',
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: {
            noResultsText: '没有找到相关记录',
            resetButtonTitle: '清除查询',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },
    lastUpdated: {
      text: '最后校准',
      formatOptions: { dateStyle: 'medium', timeStyle: 'short' },
    },
    docFooter: { prev: '上一条记录', next: '下一条记录' },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '返回顶部',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/z8z6' },
    ],
    footer: {
      message: 'SIGNAL MAINTAINED · BUILT FROM MARKDOWN',
      copyright: '© z8z6 · cxxcxx.com',
    },
  },
})
