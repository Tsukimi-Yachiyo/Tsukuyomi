<template>
  <button
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium cursor-pointer transition-all duration-200 ease-in-out font-mono disabled:opacity-50 disabled:cursor-not-allowed',
      size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-base' : 'px-5 py-2.5 text-sm',
      variant === 'primary' ? 'bg-cyan-400/10 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/20 hover:shadow-[0_0_10px_rgba(77,240,255,0.3)]' : '',
      variant === 'secondary' ? 'bg-cyan-400/15 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/25' : '',
      variant === 'ghost' ? 'bg-transparent border border-white/20 text-white/60 hover:bg-white/5 hover:border-cyan-400 hover:text-cyan-400' : '',
      variant === 'success' ? 'bg-green-500/10 border border-green-500 text-green-500 hover:bg-green-500/20' : '',
      variant === 'warning' ? 'bg-orange-500/10 border border-orange-500 text-orange-500 hover:bg-orange-500/20' : '',
      variant === 'danger' ? 'bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500/20' : '',
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
});

defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();
</script>
