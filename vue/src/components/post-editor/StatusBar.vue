<template>
  <div class="flex items-center justify-between px-4 py-2 bg-[var(--editor-statusbar-bg)] border-t border-[var(--editor-border)] text-xs transition-colors duration-300">
    <div class="flex items-center gap-4">
      <span class="text-[var(--editor-text)] opacity-60">
        共 {{ wordCount }} 字
      </span>
      <span
          class="flex items-center gap-1.5 transition-colors"
          :class="{
          'text-green-500': draftStatus === 'saved',
          'text-yellow-500': draftStatus === 'saving',
          'text-red-400': draftStatus === 'unsaved',
        }"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="{
          'bg-green-500': draftStatus === 'saved',
          'bg-yellow-500 animate-pulse': draftStatus === 'saving',
          'bg-red-400': draftStatus === 'unsaved',
        }"></span>
        {{ draftStatusText }}
      </span>
    </div>
    <div class="text-[var(--editor-accent)] flex items-center font-medium opacity-90 transition-all duration-300">
      {{ importHint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  wordCount: number;
  draftStatus: 'saved' | 'saving' | 'unsaved';
  importHint?: string;
}>();

const draftStatusText = computed(() => {
  switch (props.draftStatus) {
    case 'saved': return '已保存';
    case 'saving': return '保存中...';
    case 'unsaved': return '有未保存更改';
    default: return '';
  }
});
</script>