# CHANGELOG

项目所有重大变更记录。

格式基于 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)，
版本号基于 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)。

## [Unreleased]

### 开发中

---

## [0.0.0] - 2026-05-12

初始版本，完成项目基础架构与外层应用开发。

### 新增

#### 项目架构
- Monorepo 结构确认与优化
- TypeScript 类型系统搭建
- AI 协作规则与长期记忆系统

#### 认证系统
- 登录页面 UI（密码登录 + 邮箱验证码登录）
- 注册功能（含图形验证码）
- 修改密码功能
- JWT 令牌管理（Cookie + Pinia 内存缓存）
- WebSocket 认证信息注入机制

#### 全息 UI 组件库
- `HoloPanel` - 主面板容器（含动画效果）
- `HoloBorder` - 统一边框组件
- `HoloText` - 逐字动画文本组件
- `HoloInput` - 全息风格输入框
- `HoloAvatar` - 头像组件
- `HoloCheckerboard` - 棋盘装饰
- `HoloBarcode` - 条形码装饰
- `HoloDanmaku` - 弹幕组件

#### 登录组件
- `LoginPanel` - 登录主面板（选项卡切换）
- `LoginModal` - 登录模态框
- `CaptchaDialog` - 图形验证码弹窗

#### 系统初始化
- `AppBoot` - 系统引导组件
- `SystemBoot` - 完整状态机管理（健康检测 -> 资源加载 -> 登录验证 -> 渲染）
- 后端服务健康检测功能
- 维护页面（自动检测 + 手动重试）

#### 海洋主题动画组件
- `OceanWaves` - 波浪动画
- `OceanRipple` - 涟漪效果
- `OceanBubbles` - 气泡动画
- `OceanFish` - 鱼群游动
- `OceanLoading` - 海洋风格加载动画
- `OceanButton` - 海洋风格按钮
- `OceanState` - 海洋状态指示器

#### 游戏 UI 组件
- `GameUI` - 游戏主界面
- `KeyHint` - 按键提示
- `KeyboardHints` - 键盘操作提示
- `PauseMoon` - 暂停界面
- `UserInfoPause` - 用户信息暂停面板

#### 文档预览
- `PdfViewer` - PDF 预览组件
- `PptViewer` - PPT 预览组件
- `MarkdownRenderer` - Markdown 渲染器（支持代码高亮）

#### 路由页面
- `GamePage` - 游戏主页面
- `PostPage` - 帖子页面
- `AdminPage` - 管理页面
- `MaintenancePage` - 维护页面
- `TestPage` - 测试页面
- `AboutPage` - 关于页面

#### 工具函数
- `useAuth` - 认证组合式函数
- `useAuthCheck` - 认证检查
- `useClock` - 实时时钟
- `useCountdown` - 倒计时
- `useFormatTime` - 时间格式化
- `useKeyboardHints` - 键盘提示
- `eventBus` - 基于 mitt 的全局事件总线

#### 通信桥接
- `cocosBridge` - Vue 与 Cocos 双向通信接口

#### Cocos 容器
- `CocosContainer` - Cocos 挂载组件
- 登录状态传递机制
- WebSocket 初始化通知

#### 其他
- 启动视频加载（`start_video_load.mp4`）
- 启动视频循环（`start_video_loop.mp4`）
- 自定义字体（3 款中文字体 woff2 格式）

### 技术栈

| 技术 | 版本 |
|------|------|
| Vue | 3.5.32 |
| TypeScript | 6.0.3 |
| Vite | 8.0.8 |
| Tailwind CSS | 4.3.0 |
| Pinia | 3.0.4 |
| Vue Router | 4.6.4 |
| protobufjs | 8.0.3 |
| axios | 1.16.0 |
| mitt | 3.0.1 |
| pdfjs-dist | 5.7.284 |

### 架构设计

- 外层：Vue 3 Composition API + TypeScript + Tailwind CSS
- 内层：Cocos Creator 3.8 + ECS 架构
- 通信：WebSocket + Protobuf 序列化
- 构建：Vite 8 + 生产代理
- 环境：开发/生产双环境变量配置

### 开发规范

- 强制 Vue 3 Composition API
- 禁止 Options API
- 禁止内联样式
- 强制使用 Protobuf
- 禁止 Cocos 2.x API

---

## [计划] 待完成功能

### 社交系统
- 虚拟滚动帖子列表
- Intersection Observer 触底加载
- 多级图片缓存策略

### Cocos 内层
- 摄像机系统（360 度旋转 + 缩放）
- Billboard 组件与自定义 Shader
- 八向角色移动系统
- 视觉氛围系统（全局光照 + 雾效 + 后处理）
- 地图区块加载系统（AOI + 对象池）
- 堡垒式浮现动画 Shader

### 实时通信
- Protobuf 协议完整集成
- WebSocket 连接管理与重连
- 客户端预测 + 航位推测
- 线性插值平滑

### 集成与测试
- Vue-Cocos 全链路集成测试
- 100 人同屏性能测试
- 功能回归测试
