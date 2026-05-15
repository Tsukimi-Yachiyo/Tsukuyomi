<template>
  <div class="holo-input-wrapper" :style="{ animationDelay: `${animDelay}s` }">
    <label v-if="label" class="holo-input-label">{{ label }}</label>
    <div class="holo-input-container">
      <input
        :type="type"
        :value="modelValue"
        @input="handleInput"
        :placeholder="placeholder"
        class="holo-input"
      />
      <div class="holo-input-line"></div>
      <div class="holo-input-decor"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string;
  label?: string;
  placeholder?: string;
  type?: string;
  animDelay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  type: 'text',
  animDelay: 0,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<style scoped>
.holo-input-wrapper {
  margin-top: 10px;
  margin-bottom: 10px;
  opacity: 0;
  transform: translateX(-10px);
  animation: slideInInput 0.4s ease-out forwards;
  text-align: left;
}

@keyframes slideInInput {
  to { opacity: 1; transform: translateX(0); }
}

.holo-input-label {
  display: block;
  font-size: 10px;
  color: var(--theme-color);
  text-shadow: 0 0 4px var(--theme-color-glow);
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.holo-input-container {
  position: relative;
  display: flex;
}

.holo-input {
  width: 100%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: none;
  color: var(--theme-color);
  padding: 8px 10px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
  text-shadow: 0 0 5px var(--theme-color-glow);
}

.holo-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
  text-shadow: none;
}

.holo-input:focus {
  background: rgba(var(--theme-color-rgb), 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 0 15px var(--theme-color-glow);
}

.holo-input-line {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background: var(--theme-color);
  box-shadow: 0 0 8px var(--theme-color-glow);
  transform: scaleX(0.2);
  transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.holo-input:focus ~ .holo-input-line {
  transform: scaleX(1);
}

.holo-input-decor {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 6px;
  height: 6px;
  background: var(--theme-color);
  box-shadow: 0 0 5px var(--theme-color-glow);
}
</style>
