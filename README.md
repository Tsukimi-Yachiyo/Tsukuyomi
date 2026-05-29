# Yachiyo Tsukuyomi (超时空辉夜姬)

A futuristic holographic UI application built with Vue 3 and Cocos Creator 3.8, featuring immersive visual effects, Live2D character integration, and real-time multiplayer communication.

## Features

- **Holographic UI Components**: Advanced holographic-style interface elements with neon lighting effects
- **Ocean Theme UI**: Ocean-themed components including waves, bubbles, fish, and ripple effects
- **Live2D Integration**: Live2D Cubism SDK for interactive character rendering
- **Cocos Creator Game**: Embedded 3D game world with multiplayer support via iframe bridge
- **Real-time Multiplayer**: WebSocket + Protobuf-based real-time player synchronization (movement, chat, block interaction, room sync)
- **Authentication System**: Login/register with email captcha, token refresh, session management
- **Content System**: Post creation, editing, comments, likes, collections, and admin review
- **User System**: User profiles, follow/followee, avatar upload, coin system, daily check-in
- **Chat System**: Real-time friend messaging
- **File Viewer**: Built-in PDF, PPT, Markdown, and dynamic content viewers
- **System Boot Sequence**: Animated startup sequence with splash screen and loading states
- **Maintenance Mode**: Graceful handling of backend service unavailability

## Tech Stack

### Frontend (vue/)
- **Vue 3** - Composition API with `<script setup lang="ts">`
- **TypeScript** - Type-safe development
- **Vite 8** - Lightning-fast build tool
- **Pinia** - State management with persisted state plugin
- **Vue Router 4** - Hash-based routing
- **Tailwind CSS 4** - Utility-first CSS framework
- **Axios** - HTTP client with interceptors (auto token refresh)
- **Mitt** - Event emitter for cross-component communication
- **protobufjs** - Protobuf serialization for WebSocket communication
- **highlight.js** - Code syntax highlighting
- **markdown-it** - Markdown rendering
- **pdfjs-dist** - PDF viewer
- **JSZip** - Archive handling

### Game Engine (CocosGame/)
- **Cocos Creator 3.8.8** - 2D/3D game engine with ECS architecture
- **VueBridge** - PostMessage-based communication between Vue and Cocos

### Live2D (vue/src/live2d/)
- **Live2D Cubism SDK** - Cubism Core + Framework for character rendering

### Communication
- **WebSocket** - Real-time bidirectional binary communication
- **Protobuf** - Efficient binary serialization (SpacePacket protocol)

## Project Structure

```
tsukuyomi/
├── vue/                          # Vue 3 frontend application
│   ├── src/
│   │   ├── api/                  # API and WebSocket communication
│   │   │   ├── index.ts          # Axios instance & REST API endpoints
│   │   │   ├── socket.ts         # WebSocket service with Protobuf
│   │   │   ├── chat.ts           # Chat API
│   │   │   └── types.ts          # TypeScript type definitions
│   │   ├── assets/               # Static assets
│   │   │   ├── font/             # Custom fonts
│   │   │   ├── icons/            # SVG icons
│   │   │   ├── resource/         # Live2D model resources
│   │   │   ├── ui_button/        # UI button images
│   │   │   └── video/            # Boot animation videos
│   │   ├── bridge/               # Cocos Creator bridge
│   │   │   └── cocosBridge.ts    # PostMessage communication layer
│   │   ├── components/           # Vue components
│   │   │   ├── game/             # Game UI components (chat, settings, pause menu, etc.)
│   │   │   ├── global/           # Global providers (modal, toast)
│   │   │   ├── holo/             # Holographic UI components
│   │   │   ├── live2d/           # Live2D model component
│   │   │   ├── login/            # Login panel & captcha
│   │   │   ├── ocean/            # Ocean theme components
│   │   │   ├── post-editor/      # Post editor components
│   │   │   ├── viewer/           # File viewers (PDF, PPT, Markdown)
│   │   │   ├── AppBoot.vue       # Application boot sequence
│   │   │   ├── CocosContainer.vue# Cocos game iframe container
│   │   │   ├── SplashScreen.vue  # Splash screen
│   │   │   └── UserAvatar.vue    # User avatar component
│   │   ├── composables/          # Vue composables
│   │   │   ├── useAuth.ts        # Authentication logic
│   │   │   ├── useAuthCheck.ts   # Auth state validation
│   │   │   ├── useClock.ts       # Clock utility
│   │   │   ├── useCountdown.ts   # Countdown timer
│   │   │   ├── useDraft.ts       # Draft management
│   │   │   ├── useExport.ts      # Data export
│   │   │   ├── useFileImport.ts  # File import
│   │   │   ├── useFormatTime.ts  # Time formatting
│   │   │   ├── useKeyboardHints.ts # Keyboard shortcut hints
│   │   │   ├── useMediaCache.ts  # Media caching
│   │   │   └── useModal.ts       # Modal management
│   │   ├── core/                 # Core application logic
│   │   │   └── bootstrap.ts      # Application bootstrap
│   │   ├── live2d/               # Live2D Cubism integration
│   │   ├── page/                 # Page components
│   │   │   ├── AboutPage.vue
│   │   │   ├── AdminPage.vue
│   │   │   ├── GamePage.vue      # Main game page
│   │   │   ├── MaintenancePage.vue
│   │   │   ├── PostEditorPage.vue
│   │   │   ├── PostViewPage.vue
│   │   │   ├── TestPage.vue
│   │   │   └── UserPage.vue
│   │   ├── router/               # Vue Router configuration
│   │   ├── store/                # Pinia stores
│   │   │   ├── modalStore.ts     # Modal state
│   │   │   └── userStore.ts      # User authentication state
│   │   ├── utils/                # Utility functions
│   │   │   └── eventBus.ts       # Global event bus (mitt)
│   │   ├── App.vue               # Root component
│   │   └── main.ts               # Entry point
│   └── package.json
├── CocosGame/                    # Cocos Creator 3.8 game project
│   └── assets/scripts/
│       ├── bridge/               # Vue <-> Cocos communication
│       │   └── VueBridge.ts
│       ├── core/                 # Game core logic
│       │   └── GameManager.ts    # Player management & sync
│       └── entities/             # Game entities
│           ├── CameraController.ts
│           ├── PlayerController.ts
│           └── TileMapGenerator.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js ^20.19.0 or >=22.12.0
- npm >= 9.0.0
- Cocos Creator 3.8.8 (for game development)

### Installation

```bash
cd vue
npm install
```

### Development

```bash
cd vue
npm run dev
```

### Production Build

```bash
cd vue
npm run build

# Preview production build
npm run preview
```

## Configuration

### Environment Variables

- `.env.development` - Development environment settings
- `.env.production` - Production environment settings

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_WS_URL` | WebSocket server URL |

## API Modules

| Module | Description |
|--------|-------------|
| `auth` | Login, register, captcha, token refresh, logout |
| `user` | User profiles, follow system, avatar, search |
| `posting` | Posts CRUD, search, interactions (like/collect), file upload |
| `comment` | Comment list, add, delete |
| `column` | Column/essay management |
| `coin` | Virtual coin system |
| `sign` | Daily check-in |
| `admin` | Admin panel, post review, column management |
| `chat` | Friend messaging |
| `file` | Public file download |

## Holographic UI Components

| Component | Description |
|-----------|-------------|
| `HoloPanel` | Holographic panel with glowing borders |
| `HoloInput` | Futuristic input field with neon effects |
| `HoloText` | Glowing text with scanline effects |
| `HoloBorder` | Animated border with gradient effects |
| `HoloAvatar` | User avatar with holographic frame |
| `HoloBarcode` | Dynamic barcode display |
| `HoloCheckerboard` | Checkerboard pattern overlay |
| `HoloDanmaku` | Floating message/danmaku system |
| `HoloUserProfile` | User profile display |

## Ocean Theme Components

| Component | Description |
|-----------|-------------|
| `OceanWaves` | Animated wave effects |
| `OceanBubbles` | Floating bubble particles |
| `OceanFish` | Swimming fish animation |
| `OceanRipple` | Water ripple effects |
| `OceanButton` | Ocean-styled button |
| `OceanLoading` | Loading animation |
| `OceanPostCard` | Post card with ocean theme |
| `OceanState` | Ocean state management |

## Development Guidelines

### Code Standards

- **Vue**: Composition API with `<script setup lang="ts">` (Options API prohibited)
- **Cocos**: ECS architecture with `@ccclass` / `@property` decorators (Cocos 3.8 API only)
- **Styling**: Tailwind CSS utility classes (inline styles prohibited)
- **State**: Pinia for global state, mitt event bus for cross-component communication
- **Network**: Protobuf for WebSocket binary serialization (JSON.stringify prohibited in game sync)

### Git Workflow

1. Create feature branch from `main`
2. Implement changes with proper testing
3. Create pull request for review
4. Merge after approval

## License

MIT License - See LICENSE file for details
