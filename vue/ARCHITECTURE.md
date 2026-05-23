# 系统架构文档

## 1. 总体架构

### 1.1 双层架构设计

《超时空辉夜姬》采用创新的"外层 Vue + 内层 Cocos"双层架构：

```
┌─────────────────────────────────────────────────┐
│                  浏览器窗口                        │
│  ┌───────────────────────────────────────────┐   │
│  │            Vue 3 外层应用                   │   │
│  │  ┌─────────┐  ┌─────────┐  ┌───────────┐  │   │
│  │  │  路由    │  │ 组件库   │  │ 状态管理   │  │   │
│  │  │ Router  │  │Components│  │ Pinia     │  │   │
│  │  └─────────┘  └─────────┘  └───────────┘  │   │
│  │  ┌─────────────────────────────────────┐   │   │
│  │  │         CocosContainer.vue           │   │   │
│  │  │  ┌───────────────────────────────┐  │   │   │
│  │  │  │    Cocos Creator 3.8 Canvas   │  │   │   │
│  │  │  │    (WebGL 渲染)               │  │   │   │
│  │  │  │    像素艺术 3D 场景            │  │   │   │
│  │  │  └───────────────────────────────┘  │   │   │
│  │  └─────────────────────────────────────┘   │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  ┌───────────────────────────────────────────┐   │
│  │          WebSocket + Protobuf              │   │
│  │         (实时双向通信)                      │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │   后端服务器       │
              │   (端口 8881)      │
              └──────────────────┘
```

### 1.2 技术分层

| 层级 | 技术 | 职责 |
|------|------|------|
| 表现层 | Vue 3 + Tailwind CSS | UI 渲染、用户交互 |
| 引擎层 | Cocos Creator 3.8 | 3D 场景渲染、物理模拟 |
| 通信层 | WebSocket + Protobuf | 实时数据同步 |
| 服务层 | Axios + HTTP API | 业务逻辑、数据持久化 |
| 状态层 | Pinia | 全局状态管理 |
| 路由层 | Vue Router | 页面导航 |

---

## 2. 模块架构

### 2.1 Vue 外层模块

```
Vue 外层应用
├── api/                # 数据访问层
│   ├── index.ts        #   HTTP API 封装
│   ├── socket.ts       #   WebSocket 服务
│   └── types.ts        #   TypeScript 类型定义
│
├── bridge/             # 通信桥接层
│   └── cocosBridge.ts  #   Vue <-> Cocos 双向通信
│
├── components/         # UI 组件层
│   ├── holo/           #   全息 UI 组件库
│   ├── login/          #   登录相关组件
│   ├── game/           #   游戏内 UI
│   ├── ocean/          #   海洋主题动画
│   └── viewer/         #   文档预览
│
├── composables/        # 组合式函数层
│   ├── useAuth.ts      #   认证逻辑
│   ├── useClock.ts     #   时钟
│   └── ...             #   其他可复用逻辑
│
├── core/               # 核心逻辑层
│   └── bootstrap.ts    #   系统引导
│
├── store/              # 状态管理层
│   └── userStore.ts    #   用户状态
│
├── utils/              # 工具函数层
│   └── eventBus.ts     #   全局事件总线
│
├── router/             # 路由层
│   └── index.ts        #   路由配置
│
└── page/               # 页面层
    ├── GamePage.vue    #   游戏主页面
    ├── PostPage.vue    #   帖子页面
    ├── AdminPage.vue   #   管理页面
    └── ...             #   其他页面
```

### 2.2 模块依赖关系

```
App.vue
  └── AppBoot.vue           # 系统引导入口
        └── SplashScreen.vue # 启动动画
              └── CocosContainer.vue  # Cocos 容器
                    └── Cocos Canvas   # WebGL 渲染
              └── router-view          # 路由视图
                    ├── GamePage       # 游戏页面
                    ├── PostPage       # 帖子页面
                    └── ...

pinia (状态管理)
  └── userStore            # 用户状态（token、用户信息等）

eventBus (事件总线)
  ├── socket:connected     # WebSocket 连接成功
  ├── socket:disconnected  # WebSocket 断开
  ├── network:send-*       # 网络发送事件
  └── cocos:*              # Cocos 相关事件
```

---

## 3. 数据流架构

### 3.1 认证流程

```
用户输入 ──> LoginPanel ──> userStore.login() ──> api.auth.login()
                                                        │
                                                        ▼
                                                后端验证 JWT
                                                        │
                                                        ▼
                                              返回 Token ──> userStore.token
                                                        │
                                                        ▼
                                            自动加载用户信息
                                                        │
                                                        ▼
                                        初始化 WebSocket 连接
                                                        │
                                                        ▼
                                            CocosContainer 通知 Cocos
```

### 3.2 系统初始化流程

```
AppBoot.vue
    │
    ├── 1. 播放启动视频 (SplashScreen)
    │
    ├── 2. 后端健康检测 (api.system.healthCheck)
    │       │
    │       ├── 成功 ──> 继续初始化
    │       └── 失败 ──> 显示维护页面 (MaintenancePage)
    │
    ├── 3. 资源预加载
    │       ├── 字体加载
    │       ├── 图片预加载
    │       └── Protobuf 协议加载
    │
    ├── 4. 登录状态检查 (userStore.validateAndRestoreSession)
    │       │
    │       ├── 已登录 ──> 渲染游戏页面
    │       └── 未登录 ──> 渲染登录页面
    │
    └── 5. 初始化 Cocos + WebSocket
```

### 3.3 WebSocket 通信流程

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Vue 组件   │ ────>   │  eventBus    │ ────>   │ SocketService │
│             │  emit   │              │  on     │               │
└─────────────┘         └──────────────┘         └──────┬───────┘
                                                        │
                                           Protobuf 编码
                                                        │
                                                        ▼
                                               ┌──────────────┐
                                               │  WebSocket   │
                                               │  发送二进制   │
                                               └──────┬───────┘
                                                      │
                                                      ▼
                                               ┌──────────────┐
                                               │  后端服务器   │
                                               └──────┬───────┘
                                                      │
                                                      ▼
                                               ┌──────────────┐
                                               │  WebSocket   │
                                               │  接收二进制   │
                                               └──────┬───────┘
                                                      │
                                           Protobuf 解码
                                                      │
                                                      ▼
                                               ┌──────────────┐
                                               │  eventBus    │
                                               │   emit       │
                                               └──────┬───────┘
                                                      │
                                                      ▼
                                               ┌──────────────┐
                                               │  Cocos/组件   │
                                               │   on 事件     │
                                               └──────────────┘
```

---

## 4. 通信协议

### 4.1 HTTP API

所有 HTTP 请求通过 Axios 封装，统一响应格式：

```typescript
interface Result<T> {
    code: string | number;   // 业务状态码 (200/0 成功, 401/403 认证失败)
    message: string;         // 提示信息
    data: T;                 // 响应数据
    detail?: string;         // 详细信息
}
```

**拦截器处理：**
- 请求拦截：自动添加 `Authorization: Bearer {token}` 头部
- 响应拦截：统一解析 `Result` 包装，401/403 自动刷新 Token
- 刷新 Token 队列：防止并发请求导致多次刷新

### 4.2 WebSocket + Protobuf

**OpCode 枚举：**

| OpCode | 值 | 用途 |
|--------|----|------|
| PLAYER_MOVE | 1 | 玩家移动 |
| CHAT | 2 | 聊天消息 |
| BLOCK_INTERACTION | 3 | 地块交互 |
| PLAYER_JOIN_LEAVE | 4 | 玩家进出 |
| PLAYER_POSITION | 5 | 玩家位置 |
| ROOM_SYNC_FRAME | 100 | 房间帧同步 |

**消息格式：**

```
SpacePacket (外层)
├── opcode: number        // 消息类型
└── payload: bytes        // 内层 Protobuf 编码数据
       │
       ├── PlayerTransform    // 玩家移动数据
       ├── PlayerChat         // 聊天数据
       ├── BlockInteraction   // 地块交互数据
       ├── PlayerJoinLeave    // 玩家进出数据
       ├── PlayerPosition     // 玩家位置数据
       └── RoomSyncFrame      // 帧同步数据
```

---

## 5. 状态管理

### 5.1 Pinia Store 结构

```typescript
userStore {
    // State
    token: string | null              // JWT 访问令牌
    refreshToken: string | null       // 刷新令牌
    userInfo: UserDetailDTO | null    // 用户详细信息
    isLoggedIn: boolean               // 登录状态 (computed)
    
    // Actions
    login()                           // 密码登录
    loginByMail()                     // 邮箱验证码登录
    register()                        // 注册
    changePassword()                  // 修改密码
    logout()                          // 登出
    refreshToken()                    // 刷新令牌
    validateAndRestoreSession()       // 验证并恢复会话
}
```

**持久化策略：**
- 使用 `pinia-plugin-persistedstate` 自动持久化
- Token 存储在 localStorage/sessionStorage
- 页面刷新后自动恢复会话

### 5.2 事件总线

```typescript
eventBus (mitt) {
    // 网络事件
    'socket:connected'              // WebSocket 连接成功
    'socket:disconnected'           // WebSocket 断开
    'socket:error'                  // WebSocket 错误
    
    // 网络发送事件
    'network:send-player-move'      // 发送玩家移动
    'network:send-chat'             // 发送聊天
    'network:send-block-interaction'// 发送地块交互
    
    // Cocos 同步事件
    'cocos:player-sync'             // 玩家同步
    'cocos:new-chat'                // 新聊天
    'cocos:block-interaction'       // 地块交互
    'cocos:player-join-leave'       // 玩家进出
    'cocos:player-position'         // 玩家位置
    'cocos:room-sync-frame'         // 帧同步
}
```

---

## 6. 组件架构

### 6.1 全息 UI 组件库

| 组件 | 功能 | 特性 |
|------|------|------|
| HoloPanel | 主面板容器 | 动画效果、CRT 扫描线、状态切换 |
| HoloBorder | 边框组件 | 四角对称、延伸动画 |
| HoloText | 动画文本 | 逐字显示、擦除效果 |
| HoloInput | 输入框 | 全息风格、焦点动画 |
| HoloAvatar | 头像 | 自定义图片、边框装饰 |
| HoloCheckerboard | 棋盘装饰 | 网格背景、透明度动画 |
| HoloBarcode | 条形码装饰 | 随机生成、扫描线效果 |
| HoloDanmaku | 弹幕 | 滚动显示、生命周期管理 |

### 6.2 海洋主题动画组件

| 组件 | 功能 |
|------|------|
| OceanWaves | 多层波浪动画 |
| OceanRipple | 水波纹扩散效果 |
| OceanBubbles | 气泡上升动画 |
| OceanFish | 鱼群游动效果 |
| OceanLoading | 海洋风格加载指示器 |
| OceanButton | 海洋风格按钮 |
| OceanState | 海洋状态指示器 |

### 6.3 游戏 UI 组件

| 组件 | 功能 |
|------|------|
| GameUI | 游戏主界面容器 |
| KeyHint | 单个按键提示 |
| KeyboardHints | 键盘操作提示集合 |
| PauseMoon | 暂停界面 |
| UserInfoPause | 用户信息暂停面板 |

---

## 7. 路由架构

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | -> `/game` | 默认跳转 |
| `/game` | GamePage | 游戏主页面 |
| `/post/:id` | PostPage | 帖子详情 |
| `/admin` | AdminPage | 管理后台 |
| `/maintenance` | MaintenancePage | 维护页面 |
| `/test` | TestPage | 测试页面 |
| `/about` | AboutPage | 关于页面 |

**模式：** Hash History（兼容性强，无需服务端配置）

---

## 8. 构建与部署

### 8.1 构建配置

```
Vite 8
├── 插件
│   ├── @vitejs/plugin-vue        # Vue 3 支持
│   ├── vite-plugin-vue-devtools  # Vue DevTools
│   └── @tailwindcss/vite         # Tailwind CSS
│
├── CSS 处理
│   └── postcss-pxtorem           # px 转 rem (rootValue: 16)
│
├── 代理配置
│   ├── /api -> 后端 HTTP 服务
│   ├── /file -> 后端文件服务
│   ├── /actuator -> 健康检查
│   └── /ws -> WebSocket 服务
│
└── 别名
    └── @ -> src/
```

### 8.2 环境配置

| 环境 | 配置文件 | 后端地址 |
|------|----------|----------|
| 开发 | `.env.development` | `211.101.234.16:8881` |
| 生产 | `.env.production` | 环境变量配置 |

---

## 9. 性能优化策略

### 9.1 代码分割
- 路由懒加载：`component: () => import(...)`
- 组件按需引入

### 9.2 资源优化
- 字体使用 woff2 格式（压缩率更高）
- 图片按需加载

### 9.3 网络优化
- Axios 请求超时设置（10 秒）
- WebSocket 自动重连（最多 5 次）
- Token 刷新队列防并发

### 9.4 渲染优化
- postcss-pxtorem 响应式适配
- Tailwind CSS 按需生成
- Vue 3 响应式系统优化

---

## 10. 安全设计

### 10.1 认证安全
- JWT 令牌认证
- Token 自动刷新机制
- 401/403 自动处理

### 10.2 通信安全
- HTTPS/WSS 协议
- Token 头部认证
- Protobuf 二进制传输（非明文 JSON）

### 10.3 数据安全
- 敏感数据不暴露到前端
- 表单前端验证 + 后端验证
