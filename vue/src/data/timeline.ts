export interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  image?: string
}

export const timelineEvents: TimelineEvent[] = [
  // ── 2026 年 2 月：起源 ──
  {
    id: 'ollama-model',
    date: '2026-02-06',
    title: '项目启动',
    description: '八千代以一个微调 LLM 的 Ollama 模型诞生。最初的她，只是一段运行在本地的语言模型（ollama run 1473443474/tsukimi-yachiyo）。',
  },
  {
    id: 'client-tkinter',
    date: '2026-02-08',
    title: '第一版客户端',
    description: '使用 Python Tkinter 构建了第一版桌面客户端 YachiyoClient 1.0，为八千代提供了最初的交互界面。',
  },
  {
    id: 'tts-model',
    date: '2026-02-09',
    title: '语音模型训练',
    description: '基于 GPT-SoVITS 训练了八千代的 TTS 语音大模型，让她拥有了属于自己的声音。',
  },
  {
    id: 'client-1.1',
    date: '2026-02-12',
    title: '客户端 UI 优化',
    description: '发布 YachiyoClient 1.1，对界面进行了视觉与交互层面的优化。',
  },
  {
    id: 'backend-spring',
    date: '2026-02-18',
    title: '后端架构建立',
    description: '搭建后端服务，采用 Spring Boot + Spring AI 架构，为八千代提供服务端支撑。',
  },
  {
    id: 'client-wpf',
    date: '2026-02-21',
    title: '客户端重写',
    description: '使用 C# WPF 重写客户端 YachiyoClient 2.0，获得更流畅的原生桌面体验。',
  },
  {
    id: 'client-2.1',
    date: '2026-02-23',
    title: '环境下载优化',
    description: '发布 YachiyoClient 2.1，优化客户端环境资源的下载流程与体验。',
  },
  {
    id: 'client-2.2',
    date: '2026-02-26',
    title: '语言功能增强',
    description: '发布 YachiyoClient 2.2，进一步完善客户端的语言交互能力。',
  },
  {
    id: 'client-2.3',
    date: '2026-02-27',
    title: '客户端 Bug 修复',
    description: '发布 YachiyoClient 2.3，修复了若干影响体验的客户端问题。',
  },

  // ── 2026 年 3 月：Web 转型 ──
  {
    id: 'client-live2d',
    date: '2026-03-02',
    title: 'Live2D 功能上线',
    description: '发布 YachiyoClient 2.4，集成 Live2D 模块，让八千代拥有了动态的虚拟形象。',
  },
  {
    id: 'web-v1',
    date: '2026-03-13',
    title: '网页版上线',
    description: '第一版网页端发布，实现了基础的聊天对话与用户设置功能，标志着项目从桌面端向 Web 端的转型。',
  },
  {
    id: 'web-bugfix',
    date: '2026-03-18',
    title: '网页版 Bug 修复',
    description: '修复网页版存在的各类问题，提升稳定性与用户体验。',
  },
  {
    id: 'web-release',
    date: '2026-03-20',
    title: '首个发行版与宣传视频',
    description: '发布第一版网页发行版，并制作了项目首个也是目前唯一的网页宣传视频。',
  },
  {
    id: 'community-posts',
    date: '2026-03-22',
    title: '月读社区上线',
    description: '网页版新增月读社区功能，支持用户发布帖子，构建起最初的社区生态。',
  },
  {
    id: 'qq-group',
    date: '2026-03-23',
    title: 'QQ 群建立',
    description: '建立月读社区 QQ 群聊，为玩家与开发者搭建了直接交流的渠道。',
  },
  {
    id: 'enterprise-dev',
    date: '2026-03-26',
    title: '企业级开发启动',
    description: '正式转向企业级规范化开发流程，引入标准化的代码管理与协作机制。',
  },
  {
    id: 'donation-frontend',
    date: '2026-03-26',
    title: '前端服务器建立',
    description: '老猫无私捐赠 50 元用于建立前端服务器，项目首次获得来自社区的基础设施支持。',
  },
  {
    id: 'donation-backend',
    date: '2026-03-31',
    title: '后端服务器建立',
    description: '老猫再次捐赠 400 元用于建立后端服务器，为项目的稳定运行奠定了硬件基础。',
  },

  // ── 2026 年 4 月：生态扩展 ──
  {
    id: 'frontend-optimize',
    date: '2026-04-04',
    title: '前端优化完成',
    description: '完成前端页面的整体优化，包括响应式布局、移动端适配与视觉细节打磨。',
  },
  {
    id: 'langgraph-migration',
    date: '2026-04-05',
    title: 'LangGraph 迁移启动',
    description: '启动从 Spring AI 向 LangGraph 的架构迁移，以获得更灵活的 AI 任务编排能力。',
  },
  {
    id: 'icon-established',
    date: '2026-04-07',
    title: '月读图标确立',
    description: '确定月读项目的标志性图标设计，形成统一的品牌视觉符号。',
  },
  {
    id: 'muffin-framework',
    date: '2026-04-10',
    title: '松饼框架完成',
    description: '完成「松饼」（Muffin）的开发——一个仿照 Spring 风格的 Python Web 框架，拓展了后端技术栈。',
  },
  {
    id: 'yachiyo-cup-1',
    date: '2026-04-17',
    title: '第一届八千杯',
    description: '确立并启动第一届「八千杯」社区活动，标志着社区文化开始成形。',
  },
  {
    id: 'frontend-complete',
    date: '2026-04-20',
    title: '前端基本完善',
    description: '前端核心功能基本完善，涵盖帖子浏览、用户主页、消息中心等模块。',
  },
  {
    id: 'follow-system',
    date: '2026-04-22',
    title: '关注系统上线',
    description: '实现用户间的关注与被关注功能，社交关系链初步建立。',
  },
  {
    id: 'minecraft-server',
    date: '2026-04-30',
    title: 'MC 服务器建立',
    description: '月读专属我的世界服务器搭建完成，为社区玩家提供了一个新的互动空间。',
  },

  // ── 2026 年 5 月：架构升级 ──
  {
    id: 'vue-cocos-rewrite',
    date: '2026-05-01',
    title: '前端重写计划启动',
    description: '正式启动前端重写计划，确立 Vue 3 + Cocos Creator 3.8 的双层架构，向元宇宙空间迈进。',
  },
  {
    id: 'holo-ui',
    date: '2026-05-12',
    title: '全息 UI 体系建立',
    description: '设计并实现全息风格的 UI 组件库（HoloPanel、HoloBorder 等），构建沉浸式的交互界面。',
  },
  {
    id: 'system-boot',
    date: '2026-05-12',
    title: '系统初始化流程',
    description: '完成系统启动初始化流程设计，包括后端健康检测、资源预加载、登录状态管理与 WebSocket 连接。',
  },
  {
    id: 'game-ui',
    date: '2026-05-21',
    title: '游戏界面开发',
    description: '建立游戏界面的按键提示系统与海洋风格 UI 组件，为 Cocos 引擎内的交互奠定基础。',
  },
  {
    id: 'post-page',
    date: '2026-05-21',
    title: '帖子页面上线',
    description: '完成帖子详情页的开发，支持富文本内容渲染与多媒体预览。',
  },
  {
    id: 'massive-features',
    date: '2026-05-29',
    title: '大量功能完善',
    description: '集中完善了用户资料、设置面板、聊天对话、专栏浏览等多个核心模块。',
  },
  {
    id: 'history-page',
    date: '2026-05-30',
    title: '项目历史页上线',
    description: '开发并上线项目历史时间线页面，记录八千代从一行代码到元宇宙的完整成长轨迹。',
  },
]
