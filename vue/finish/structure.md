此为项目结构框架，包含项目的所有文件和目录。

## 根目录文件

| 文件 | 说明 |
|------|------|
| `README.md` | 项目介绍、快速开始、技术栈说明 |
| `CHANGELOG.md` | 版本更新日志 |
| `ARCHITECTURE.md` | 系统架构设计文档 |
| `API.md` | HTTP API 与 WebSocket 协议文档 |
| `TASKS.md` | 开发任务清单与进度追踪 |
| `CLAUDE.md` | AI 全局约束规则 |
| `package.json` | 项目依赖配置 |
| `vite.config.ts` | Vite 构建配置 |
| `tsconfig.json` | TypeScript 配置 |

## 目录结构

```
tsukuyomi/
├── src/                          # Vue 3 外层应用
│   ├── api/                      # API 接口定义
│   │   ├── index.ts              #   HTTP API 配置与方法
│   │   ├── socket.ts             #   WebSocket + Protobuf 服务
│   │   └── types.ts              #   TypeScript 类型定义
│   │
│   ├── assets/                   # 静态资源
│   │   ├── font/                 #   字体文件 (woff2)
│   │   ├── icons/                #   SVG 图标
│   │   ├── ui_button/            #   UI 按钮图片
│   │   ├── video/                #   视频资源
│   │   ├── global.css            #   全局样式
│   │   └── main.css              #   Tailwind 入口
│   │
│   ├── bridge/                   # Vue-Cocos 通信桥接
│   │   └── cocosBridge.ts        #   双向通信接口
│   │
│   ├── components/               # Vue 组件
│   │   ├── holo/                 #   全息 UI 组件库
│   │   │   ├── HoloPanel.vue     #     主面板容器
│   │   │   ├── HoloBorder.vue    #     统一边框组件
│   │   │   ├── HoloText.vue      #     逐字动画文本
│   │   │   ├── HoloInput.vue     #     全息输入框
│   │   │   ├── HoloAvatar.vue    #     头像组件
│   │   │   ├── HoloCheckerboard.vue #  棋盘装饰
│   │   │   ├── HoloBarcode.vue   #     条形码装饰
│   │   │   └── HoloDanmaku.vue   #     弹幕组件
│   │   │
│   │   ├── login/                #   登录相关组件
│   │   │   ├── LoginPanel.vue    #     登录主面板
│   │   │   ├── LoginModal.vue    #     登录模态框
│   │   │   └── CaptchaDialog.vue #     图形验证码
│   │   │
│   │   ├── game/                 #   游戏内 UI
│   │   │   ├── GameUI.vue        #     游戏主界面
│   │   │   ├── KeyHint.vue       #     按键提示
│   │   │   ├── KeyboardHints.vue #     键盘操作提示
│   │   │   ├── PauseMoon.vue     #     暂停界面
│   │   │   └── UserInfoPause.vue #     用户信息面板
│   │   │
│   │   ├── ocean/                #   海洋主题动画
│   │   │   ├── OceanWaves.vue    #     波浪动画
│   │   │   ├── OceanRipple.vue   #     涟漪效果
│   │   │   ├── OceanBubbles.vue  #     气泡动画
│   │   │   ├── OceanFish.vue     #     鱼群游动
│   │   │   ├── OceanLoading.vue  #     加载动画
│   │   │   ├── OceanButton.vue   #     海洋按钮
│   │   │   ├── OceanState.vue    #     状态指示器
│   │   │   └── waveTypes.ts      #     波浪类型定义
│   │   │
│   │   ├── viewer/               #   文档预览
│   │   │   ├── PdfViewer.vue     #     PDF 预览
│   │   │   ├── PptViewer.vue     #     PPT 预览
│   │   │   └── MarkdownRenderer.vue # Markdown 渲染
│   │   │
│   │   ├── AppBoot.vue           #   系统引导入口
│   │   ├── CocosContainer.vue    #   Cocos 挂载容器
│   │   ├── SplashScreen.vue      #   启动动画
│   │   └── UserAvatar.vue        #   用户头像
│   │
│   ├── composables/              # Vue 组合式函数
│   │   ├── useAuth.ts            #   认证逻辑
│   │   ├── useAuthCheck.ts       #   认证检查
│   │   ├── useClock.ts           #   实时时钟
│   │   ├── useCountdown.ts       #   倒计时
│   │   ├── useFormatTime.ts      #   时间格式化
│   │   └── useKeyboardHints.ts   #   键盘提示
│   │
│   ├── core/                     # 核心逻辑
│   │   └── bootstrap.ts          #   系统引导
│   │
│   ├── page/                     # 页面组件
│   │   ├── GamePage.vue          #   游戏主页面
│   │   ├── PostPage.vue          #   帖子页面
│   │   ├── AdminPage.vue         #   管理页面
│   │   ├── MaintenancePage.vue   #   维护页面
│   │   ├── TestPage.vue          #   测试页面
│   │   └── AboutPage.vue         #   关于页面
│   │
│   ├── router/                   # 路由配置
│   │   └── index.ts              #   Vue Router 配置
│   │
│   ├── store/                    # Pinia 状态管理
│   │   └── userStore.ts          #   用户状态
│   │
│   ├── utils/                    # 工具函数
│   │   └── eventBus.ts           #   全局事件总线 (mitt)
│   │
│   ├── App.vue                   # 根组件
│   ├── main.ts                   # 入口文件
│   └── vite-env.d.ts             # Vite 类型声明
│
├── CocosGame/                    # Cocos Creator 3.8 内层
├── public/proto/                 # Protobuf 协议定义
│   └── MoonSpace.proto           #   游戏通信协议
│
├── .trae/rules/                  # AI 协作规则
│   ├── 操作规范.md
│   └── 添加新功能操作规范.md
│
├── finish/                       # 长期记忆文档
│   ├── structure.md              #   本文件
│   ├── 00-长期记忆功能添加.md
│   ├── 00-添加新功能操作规范.md
│   ├── 01-1.1-Monorepo结构确认.md
│   ├── 01-1.2-cursorrules完善.md
│   ├── 01-1.3-TypeScript类型系统.md
│   ├── 02-2.1-认证系统模块与全息UI.md
│   ├── 03-2.1-refactor-auth-components.md
│   ├── 04-2.1-ui-refactor.md
│   ├── 05-2.1-layout-adjust.md
│   ├── 06-2.1-后端服务检测功能.md
│   ├── 07-2.1-全息UI组件化与登录界面重构.md
│   ├── 08-2.1-system-boot-initialization.md
│   ├── 09-2.2-modal-system-refactor.md
│   └── 手动补充项目文档.md
│
├── .cursorrules                  # Cursor 规则
├── .env.development              # 开发环境变量
├── .env.production               # 生产环境变量
├── .gitignore                    # Git 忽略配置
├── index.html                    # HTML 入口
├── package.json                  # 依赖配置
├── package-lock.json             # 依赖锁定
├── tsconfig.json                 # TypeScript 配置
└── vite.config.ts                # Vite 配置
```
