<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { CubismFramework, Option, LogLevel } from '@live2d-framework/live2dcubismframework'
import { LAppSubdelegate } from '@live2d/lappsubdelegate'
import { LAppPal } from '@live2d/lapppal'

interface Props {
  modelUrl: string;
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelUrl: '',
  width: 240,
  height: 320,
})

const wrapperRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null
let subdelegate: LAppSubdelegate | null = null
let isInitialized = false
let cubismInitialized = false

const printLog = (message: string) => {
  console.log('[Live2D]', message)
}

const initCubismFramework = () => {
  if (cubismInitialized) return
  const option = new Option()
  option.logFunction = printLog
  option.loggingLevel = LogLevel.LogLevel_Off
  CubismFramework.startUp(option)
  CubismFramework.initialize()
  cubismInitialized = true
  printLog('Cubism Framework initialized')
}

const getCanvasPosition = (e: PointerEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

const onPointerBegan = (e: PointerEvent) => {
  if (!isInitialized || !subdelegate) return
  const pos = getCanvasPosition(e)
  subdelegate.onPointBegan(e.clientX, e.clientY)
}

const onPointerMoved = (e: PointerEvent) => {
  if (!isInitialized || !subdelegate) return
  subdelegate.onPointMoved(e.clientX, e.clientY)
}

const onPointerEnded = (e: PointerEvent) => {
  if (!isInitialized || !subdelegate) return
  subdelegate.onPointEnded(e.clientX, e.clientY)
}

const onPointerCancel = (e: PointerEvent) => {
  if (!isInitialized || !subdelegate) return
  subdelegate.onTouchCancel(e.clientX, e.clientY)
}

const startRenderLoop = () => {
  const render = () => {
    if (!isInitialized || !subdelegate) return
    LAppPal.updateTime()
    subdelegate.update()
    animationId = requestAnimationFrame(render)
  }
  render()
}

const stopRenderLoop = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

const setupCanvasSize = () => {
  if (!canvasRef.value || !wrapperRef.value) return
  const canvas = canvasRef.value
  const wrapper = wrapperRef.value
  canvas.width = wrapper.clientWidth * window.devicePixelRatio
  canvas.height = wrapper.clientHeight * window.devicePixelRatio
}

onMounted(async () => {
  await nextTick()
  if (!canvasRef.value || !wrapperRef.value) {
    console.error('[Live2D] Canvas or wrapper not found')
    return
  }
  setupCanvasSize()
  initCubismFramework()
  LAppPal.updateTime()
  subdelegate = new LAppSubdelegate()
  if (subdelegate.initialize(canvasRef.value)) {
    isInitialized = true
    printLog('Live2D initialized successfully')
    startRenderLoop()
  }
})

onUnmounted(() => {
  stopRenderLoop()
  isInitialized = false
  if (subdelegate) {
    subdelegate.release()
    subdelegate = null
  }
  if (cubismInitialized && CubismFramework.isInitialized()) {
    CubismFramework.dispose()
    cubismInitialized = false
  }
})

defineExpose({
  onPointerBegan,
  onPointerMoved,
  onPointerEnded,
  onPointerCancel,
})
</script>

<template>
  <div ref="wrapperRef" class="relative" :style="{ width: width + 'px', height: height + 'px' }">
    <canvas
      ref="canvasRef"
      class="block w-full h-full touch-action-none bg-transparent"
      @pointerdown="onPointerBegan"
      @pointermove="onPointerMoved"
      @pointerup="onPointerEnded"
      @pointercancel="onPointerCancel"
    ></canvas>
  </div>
</template>
