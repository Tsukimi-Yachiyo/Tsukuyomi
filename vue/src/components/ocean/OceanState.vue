<template>
  <div class="flex flex-col items-center justify-center gap-3 py-10" :class="containerClass">
    <!-- 加载动画 -->
    <div v-if="type === 'loading'" class="w-10 h-10 border-3 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />

    <!-- 空状态图标 -->
    <svg v-else-if="type === 'empty'" class="w-12 h-12 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>

    <!-- 错误图标 -->
    <svg v-else-if="type === 'error'" class="w-12 h-12 text-red-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>

    <!-- 文字 -->
    <span class="text-sm" :class="textClass">
      {{ text || defaultText }}
    </span>

    <!-- 插槽 -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  type: 'loading' | 'empty' | 'error';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}>(), {
  size: 'md',
});

const defaultText = computed(() => {
  switch (props.type) {
    case 'loading': return '加载中...';
    case 'empty': return '暂无数据';
    case 'error': return '加载失败';
  }
});

const containerClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'min-h-[100px]';
    case 'md': return 'min-h-[150px]';
    case 'lg': return 'min-h-[200px]';
  }
});

const textClass = computed(() => {
  switch (props.type) {
    case 'loading': return 'text-white/50';
    case 'empty': return 'text-white/30';
    case 'error': return 'text-red-400/60';
  }
});
</script>
