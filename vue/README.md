# 《超时空辉夜姬》- 月读空间元宇宙

> 基于 Vue 3 + Cocos Creator 3.8 打造的沉浸式虚拟世界

## 📖 项目简介

《超时空辉夜姬》是一款融合了深海美学与赛博朋克风格的虚拟元宇宙平台。项目采用创新的"外层 Vue + 内层 Cocos"双层架构，外层提供丰富的社交、内容展示功能，内层呈现高性能的像素艺术 3D 场景。

## ✨ 核心特性

- **双层架构**：Vue 3 外层 UI + Cocos 3.8 内层游戏引擎
- **全息 UI 组件库**：精心设计的赛博朋克风格 UI 组件
- **实时通信**：基于 WebSocket + Protobuf 的低延迟消息同步
- **像素艺术渲染**：自定义 Surface Shader 实现像素描边、阴影、浮现动画
- **八向角色系统**：基于 atan2 计算的精确 2D 角色朝向控制
- **自适应区块加载**：根据网络 RTT 动态调整加载半径
- **文档预览引擎**：支持 PDF / Word / Excel / PPT / Markdown

## 🛠 技术栈

### 外层（Vue 3 应用）

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API + `<script setup>`) |
| 语言 | TypeScript |
| 状态管理 | Pinia + pinia-plugin-persistedstate |
| 路由 | Vue Router (Hash History) |
| 样式 | Tailwind CSS v4 + SCSS + postcss-pxtorem |
| 网络通信 | Axios + WebSocket + Protobuf |
| 事件总线 | mitt |
| 构建工具 | Vite 8 |
| Markdown | markdown-it + highlight.js |
| PDF 预览 | pdfjs-dist |

### 内层（Cocos Creator 3.8）

| 类别 | 技术 |
|------|------|
| 引擎 | Cocos Creator 3.8.x |
| 语言 | TypeScript |
| 架构 | ECS + @ccclass / @property 装饰器 |
| 渲染 | Surface Shader |
| 网络 | WebSocket + Protobuf |

### 通信协议

| 协议 | 用途 |
|------|------|
| WebSocket | 实时双向通信 |
| Protobuf | 数据序列化（禁止使用 JSON） |

## 📁 项目结构

```
tsukuyomi/
├── src/                          # Vue 3 外层应用
│   ├── api/                      # API 接口定义
│   │   ├── index.ts              # HTTP 请求配置
│   │   ├── socket.ts             # WebSocket 连接管理
│   │   └── types.ts              # 类型定义
│   ├── assets/                   # 静态资源
│   │   ├── font/                 # 字体文件
│   │   ├── icons/                # SVG 图标
│   │   ├── ui_button/            # UI 按钮图片
│   │   └── video/                # 视频资源
│   ├── bridge/                   # Vue-Cocos 通信桥接
│   │   └── cocosBridge.ts        # 双向通信接口
│   ├── components/               # Vue 组件
│   │   ├── holo/                 # 全息 UI 组件库
│   │   │   ├── HoloPanel.vue     # 主面板容器
│   │   │   ├── HoloBorder.vue    # 统一边框组件
│   │   │   ├── HoloText.vue      # 逐字动画文本
│   │   │   ├── HoloInput.vue     # 全息输入框
│   │   │   ├── HoloAvatar.vue    # 头像组件
│   │   │   ├── HoloCheckerboard.vue # 棋盘装饰
│   │   │   ├── HoloBarcode.vue   # 条形码装饰
│   │   │   └── HoloDanmaku.vue   # 弹幕组件
│   │   ├── login/                # 登录相关组件
│   │   │   ├── LoginPanel.vue    # 登录主面板
│   │   │   ├── LoginModal.vue    # 登录模态框
│   │   │   └── CaptchaDialog.vue # 图形验证码
│   │   ├── game/                 # 游戏内 UI 组件
│   │   ├── ocean/                # 海洋主题动画组件
│   │   └── viewer/               # 文档预览组件
│   ├── composables/              # Vue 组合式函数
│   │   ├── useAuth.ts            # 认证逻辑
│   │   ├── useAuthCheck.ts       # 认证检查
│   │   ├── useClock.ts           # 时钟
│   │   ├── useCountdown.ts       # 倒计时
│   │   ├── useFormatTime.ts      # 时间格式化
│   │   └── useKeyboardHints.ts   # 键盘提示
│   ├── core/                     # 核心逻辑
│   │   └── bootstrap.ts          # 系统引导
│   ├── page/                     # 页面组件
│   │   ├── GamePage.vue          # 游戏主页面
│   │   ├── PostPage.vue          # 帖子页面
│   │   ├── AdminPage.vue         # 管理页面
│   │   ├── MaintenancePage.vue   # 维护页面
│   │   ├── TestPage.vue          # 测试页面
│   │   └── AboutPage.vue         # 关于页面
│   ├── router/                   # 路由配置
│   ├── store/                    # Pinia 状态管理
│   │   └── userStore.ts          # 用户状态
│   ├── utils/                    # 工具函数
│   │   └── eventBus.ts           # 全局事件总线
│   ├── App.vue                   # 根组件
│   ├── main.ts                   # 入口文件
│   └── vite-env.d.ts             # Vite 类型声明
├── CocosGame/                    # Cocos Creator 3.8 内层
├── public/proto/                 # Protobuf 协议定义
├── .trae/rules/                  # AI 协作规则
│   ├── 操作规范.md               # AI 操作规范
│   └── 添加新功能操作规范.md     # 新功能开发规范
├── TASKS.md                      # 开发任务清单
├── CLAUDE.md                     # AI 全局约束
├── vite.config.ts                # Vite 配置
├── tsconfig.json                 # TypeScript 配置
├── package.json                  # 项目依赖
└── finish/                       # 长期记忆文档
```

## 🚀 快速开始

### 环境要求

- Node.js: `^20.19.0 || >=22.12.0`
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

开发服务器将在 `http://localhost:5173/` 启动。

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

### 环境变量

| 变量名 | 说明 | 开发环境默认值 |
|--------|------|---------------|
| `VITE_ENV_NAME` | 环境名称 | 开发环境 |
| `VITE_API_URL` | API 基础 URL | 空（使用代理） |
| `VITE_WS_URL` | WebSocket 地址 | `ws://localhost:5173` |
| `VITE_PROXY_TARGET` | HTTP 代理目标 | `http://211.101.234.16:8881` |
| `VITE_WS_PROXY_TARGET` | WebSocket 代理目标 | `ws://211.101.234.16:8881` |

## 📋 开发规范

### Vue 3 开发

- 必须使用 Composition API 和 `<script setup lang="ts">`
- 禁止使用 Options API（`data`, `methods`, `watch` 等旧写法）
- 状态管理使用 Pinia，事件总线使用 `mitt`

### Cocos 3.8 开发

- 必须使用 Cocos Creator 3.8 的 API
- 禁止使用 Cocos 2.x 废弃 API
- 强制使用 `@ccclass` 和 `@property` 装饰器
- 节点位置更新使用 `node.setPosition(new Vec3(x, y, z))`

### 样式规范

- 必须使用 Tailwind CSS 或 SCSS 变量
- 禁止使用内联样式（`style="..."`）
- 禁止使用 emoji 表情

### 网络通信

- 必须使用 Protobuf 进行序列化/反序列化
- 禁止在游戏帧同步逻辑中使用 `JSON.stringify` / `JSON.parse`

## 🗺 开发进度

详见 [TASKS.md](./TASKS.md) 和 [finish/](./finish/) 目录。

| 阶段 | 状态 | 完成时间 |
|------|------|----------|
| 阶段一：项目架构初始化 | ✅ 完成 | 2026-05-11 |
| 阶段二：外层 Vue 3 应用开发 | 🟡 进行中 | - |
| 阶段三：内层 Cocos 3.8 开发 | ❌ 待开始 | - |
| 阶段四：实时通信系统 | 🟡 部分完成 | - |
| 阶段五：集成与测试 | ❌ 待开始 | - |

## 🤝 AI 协作

本项目使用长期记忆系统，所有开发进度均记录在 `finish/` 目录。

开始新任务前，AI 代理必须：
1. 阅读 `finish/` 文件夹所有文档
2. 查看 `TASKS.md` 了解当前任务进度
3. 遵循 `.trae/rules/` 中的开发规范

## 📄 License

Private
