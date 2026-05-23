<template>
  <div v-if="isVisible" class="keyboard-hints-root">
    <Transition name="hint-bar">
      <div v-if="bottomHints.length && !paused" class="bottom-bar">
        <div
          v-for="hint in bottomHints"
          :key="hint.key"
          class="hint-item"
        >
          <kbd class="hint-key">{{ hint.key }}</kbd>
          <span class="hint-label">{{ hint.label }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useKeyboardHints } from '@/composables/useKeyboardHints';
import { eventBus } from '@/utils/eventBus';

withDefaults(defineProps<{
  paused?: boolean;
}>(), {
  paused: false,
});

const { bottomHints } = useKeyboardHints();

const isVisible = ref(false);

const onEngineReady = () => {
  isVisible.value = true;
};

onMounted(() => {
  eventBus.on('cocos:engine-ready', onEngineReady);
});

onUnmounted(() => {
  eventBus.off('cocos:engine-ready', onEngineReady);
});
</script>

<style scoped>
.keyboard-hints-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 200;
}

.bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 28px;
  padding: 10px 20px;
  background: linear-gradient(to top, rgba(0, 10, 20, 0.75), rgba(0, 10, 20, 0.3));
  backdrop-filter: blur(4px);
  border-top: 1px solid rgba(77, 240, 255, 0.12);
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.hint-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 1px 6px;
  border: 1px solid rgba(77, 240, 255, 0.5);
  border-radius: 3px;
  background: rgba(77, 240, 255, 0.08);
  color: var(--theme-color, #4df0ff);
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 1px;
  text-shadow: 0 0 6px var(--theme-color-glow, rgba(77, 240, 255, 0.6));
  box-shadow: 0 0 6px rgba(77, 240, 255, 0.15), inset 0 0 4px rgba(77, 240, 255, 0.05);
}

.hint-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 1px;
}

.hint-bar-enter-active {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
.hint-bar-leave-active {
  transition: all 0.3s ease-in;
}
.hint-bar-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.hint-bar-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
