<template>
  <button
    class="ocean-btn"
    :class="[`ocean-btn--${variant}`, `ocean-btn--${size}`]"
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

<style scoped>
.ocean-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Courier New', monospace;
}

.ocean-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.ocean-btn--sm {
  padding: 6px 12px;
  font-size: 12px;
}

.ocean-btn--md {
  padding: 10px 20px;
}

.ocean-btn--lg {
  padding: 12px 24px;
  font-size: 16px;
}

/* Primary */
.ocean-btn--primary {
  background: rgba(77, 240, 255, 0.1);
  border: 1px solid #4df0ff;
  color: #4df0ff;
}

.ocean-btn--primary:hover:not(:disabled) {
  background: rgba(77, 240, 255, 0.2);
  box-shadow: 0 0 10px rgba(77, 240, 255, 0.3);
}

/* Secondary */
.ocean-btn--secondary {
  background: rgba(77, 240, 255, 0.15);
  border: 1px solid rgba(77, 240, 255, 0.4);
  color: #4df0ff;
}

.ocean-btn--secondary:hover:not(:disabled) {
  background: rgba(77, 240, 255, 0.25);
}

/* Ghost */
.ocean-btn--ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
}

.ocean-btn--ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  border-color: #4df0ff;
  color: #4df0ff;
}

/* Success */
.ocean-btn--success {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid #4caf50;
  color: #4caf50;
}

.ocean-btn--success:hover:not(:disabled) {
  background: rgba(76, 175, 80, 0.2);
}

/* Warning */
.ocean-btn--warning {
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid #ff9800;
  color: #ff9800;
}

.ocean-btn--warning:hover:not(:disabled) {
  background: rgba(255, 152, 0, 0.2);
}

/* Danger */
.ocean-btn--danger {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  color: #f44336;
}

.ocean-btn--danger:hover:not(:disabled) {
  background: rgba(244, 67, 54, 0.2);
}
</style>
