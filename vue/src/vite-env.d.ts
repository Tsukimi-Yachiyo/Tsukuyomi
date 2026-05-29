/// <reference types="vite/client" />
/// <reference path="../public/live2d-core/live2dcubismcore.d.ts" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
}

