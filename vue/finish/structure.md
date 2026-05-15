此为项目结构框架，包含项目的所有文件和目录。
```
tsukuyomi/
├ src/
│  ├ api/           # API 接口定义
│  │  ├ index.ts      # API 配置与方法定义
│  │  ├ socket.ts      # WebSocket 相关
│  │  └ types.ts       # 类型定义
│  ├ assets/         # 资源文件
│  ├ components/     # Vue 组件
│  │  ├ holo/        # 全息 UI 组件库
│  │  │  ├ HoloPanel.vue       # 主面板容器
│  │  │  ├ HoloBorder.vue      # 统一边框组件
│  │  │  ├ HoloText.vue        # 逐字显示文本
│  │  │  ├ HoloInput.vue       # 全息输入框
│  │  │  ├ HoloAvatar.vue      # 头像组件
│  │  │  ├ HoloCheckerboard.vue # 棋盘装饰
│  │  │  └ HoloBarcode.vue     # 条形码装饰
│  │  └ login/       # 登录相关组件
│  │     ├ LoginPanel.vue      # 登录主面板
│  │     ├ CaptchaDialog.vue   # 图形验证码弹窗
│  │     └ SideDecoration.vue  # 侧边装饰
│  ├ composables/  # Vue 组合式函数
│  ├ page/          # 页面组件
│  │  └ MaintenancePage.vue  # 维护页面
│  ├ store/         # Pinia 状态管理
│  ├ utils/         # 工具函数
│  ├ App.vue        # 根组件
│  └ main.ts        # 入口文件
├ CocosGame/    # Cocos 3.8 内层
├ public/proto/ # Protobuf 定义
└── .trae
```