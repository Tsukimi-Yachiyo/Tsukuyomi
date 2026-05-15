# Yachiyo Tsukuyomi

A futuristic holographic UI application built with Vue 3 and Cocos Creator, featuring immersive visual effects and real-time communication capabilities.

## ✨ Features

- **Holographic UI Components**: Advanced holographic-style interface elements with neon lighting effects
- **Cocos Creator Integration**: Seamless integration with Cocos Creator 3.8 for interactive 3D content
- **Real-time Communication**: WebSocket-based communication with Protobuf serialization
- **Authentication System**: Secure login panel with captcha support
- **System Boot Sequence**: Animated startup sequence with loading states
- **Maintenance Mode**: Graceful handling of backend service unavailability

## 🛠️ Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Pinia** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Mitt** - Event emitter

### Game Engine
- **Cocos Creator 3.8** - 2D/3D game engine with ECS architecture

### Communication
- **WebSocket** - Real-time bidirectional communication
- **Protobuf** - Efficient data serialization

## 📦 Project Structure

```
src/
├── api/                # API and WebSocket communication
│   ├── index.ts        # API endpoints
│   ├── socket.ts       # WebSocket handler
│   └── types.ts        # Type definitions
├── assets/             # Static assets
│   ├── icons/          # SVG icons
│   ├── video/          # Video files
│   └── *.css           # Global stylesheets
├── bridge/             # Cocos Creator bridge
│   └── cocosBridge.ts  # Communication layer with Cocos
├── components/         # Vue components
│   ├── holo/           # Holographic UI components
│   ├── login/          # Login panel components
│   ├── CocosContainer.vue
│   ├── SplashScreen.vue
│   └── SystemBoot.vue
├── composables/        # Vue composables
│   ├── useAuth.ts      # Authentication logic
│   ├── useClock.ts     # Clock utility
│   └── useCountdown.ts # Countdown timer
├── core/               # Core application logic
│   └── bootstrap.ts    # Application bootstrap
├── page/               # Page components
│   └── MaintenancePage.vue
├── store/              # Pinia stores
│   └── userStore.ts    # User state management
└── utils/              # Utility functions
    └── eventBus.ts     # Global event bus
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

### Production Build

```bash
# Compile and minify for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Holographic UI Components

The application features a comprehensive set of holographic-style UI components:

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

## 🔧 Configuration

### Environment Variables

- `.env.development` - Development environment settings
- `.env.production` - Production environment settings

### Key Configuration Options

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_WS_URL` | WebSocket server URL |
| `VITE_APP_NAME` | Application display name |

## 📖 Development Guidelines

### Code Standards

- **Vue**: Use Composition API with `<script setup lang="ts">`
- **Cocos**: Use ECS architecture with decorators (`@ccclass`, `@property`)
- **Styling**: Use Tailwind CSS or SCSS variables
- **Communication**: Use Protobuf, avoid JSON

### Git Workflow

1. Create feature branch from `main`
2. Implement changes with proper testing
3. Create pull request for review
4. Merge after approval

## 📜 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please follow the project's coding guidelines and submit pull requests for review.

## 📞 Contact

For questions or support, please open an issue in the repository.
