<template>
  <div
      class="relative transform-origin-center bg-[rgba(0,15,25,0.5)] backdrop-blur-md p-10 holo-panel-wrapper"
      :class="{ 'is-open': isOpen, 'is-closed': !isOpen && hasToggled }"
      :style="panelStyle"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface Props {
  isOpen?: boolean;
  themeColor?: string;
  glowOpacity?: number;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  themeColor: '#4df0ff',
  glowOpacity: 0.6,
});

const hasToggled = ref(false);

// 监听状态，防止初始化时直接播放 is-closed 动画
watch(() => props.isOpen, () => {
  hasToggled.value = true;
});

const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '77, 240, 255';
};

const panelStyle = computed(() => {
  const rgbStr = hexToRgb(props.themeColor);
  return {
    '--theme-color': props.themeColor,
    '--theme-color-glow': `rgba(${rgbStr}, ${props.glowOpacity})`,
    '--theme-color-rgb': rgbStr,
  };
});
</script>

<style scoped>
.holo-panel-wrapper {
  opacity: 0;
  transform: scaleY(0.005) scaleX(0);
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.9), 0 0 40px var(--theme-color-glow);
}

.holo-panel-wrapper.is-open {
  animation: powerOn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

.holo-panel-wrapper.is-closed {
  animation: powerOff 0.4s cubic-bezier(0.755, 0.05, 0.855, 0.06) forwards;
}

@keyframes powerOn {
  0% { transform: scaleY(0.005) scaleX(0); opacity: 0; filter: brightness(3); }
  50% { transform: scaleY(0.005) scaleX(1); opacity: 1; filter: brightness(2); }
  100% { transform: scaleY(1) scaleX(1); opacity: 1; filter: brightness(1); }
}

@keyframes powerOff {
  0% { transform: scaleY(1) scaleX(1); opacity: 1; }
  50% { transform: scaleY(0.005) scaleX(1); opacity: 1; filter: brightness(2); }
  100% { transform: scaleY(0.005) scaleX(0); opacity: 0; filter: brightness(3); }
}
</style>