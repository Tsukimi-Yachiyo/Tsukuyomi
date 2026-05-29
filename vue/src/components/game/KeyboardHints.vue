<template>
  <div v-if="isVisible" class="fixed inset-0 pointer-events-none z-[200]">
    <Transition name="hint-bar">
      <div v-if="bottomHints.length && !paused" class="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-[28px] px-5 py-[10px] bg-gradient-to-t from-[rgba(0,10,20,0.75)] to-[rgba(0,10,20,0.3)] backdrop-blur-[4px] border-t border-[rgba(77,240,255,0.12)]">
        <div
          v-for="hint in bottomHints"
          :key="hint.key"
          class="flex items-center gap-2 whitespace-nowrap"
        >
          <kbd class="inline-flex items-center justify-center min-w-[22px] h-[22px] px-[6px] py-[1px] border border-[rgba(77,240,255,0.5)] rounded-[3px] bg-[rgba(77,240,255,0.08)] text-[var(--theme-color,#4df0ff)] font-bold text-[11px] leading-none tracking-[1px] font-mono shadow-[0_0_6px_rgba(77,240,255,0.15),inset_0_0_4px_rgba(77,240,255,0.05)]" style="text-shadow: 0 0 6px var(--theme-color-glow, rgba(77, 240, 255, 0.6));">{{ hint.key }}</kbd>
          <span class="text-white/70 text-[12px] font-mono tracking-[1px]">{{ hint.label }}</span>
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
