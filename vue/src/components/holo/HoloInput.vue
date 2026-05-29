<template>
  <div class="holo-input-wrapper mb-2.5 mt-2.5 opacity-0 -translate-x-2.5 text-left" :style="{ animationDelay: `${animDelay}s` }">
    <label v-if="label" class="holo-input-label block text-[10px] mb-1 tracking-[1px]">{{ label }}</label>
    <div class="holo-input-container relative flex">
      <input
        :type="type"
        :value="modelValue"
        @input="handleInput"
        :placeholder="placeholder"
        class="holo-input w-full box-border outline-none border-b-0 transition-all duration-300 p-2 px-2.5 font-['Courier_New',Courier,monospace] text-sm"
      />
      <div class="holo-input-line absolute bottom-0 left-0 h-[2px] w-full origin-left transition-transform duration-300"></div>
      <div class="holo-input-decor absolute bottom-0 right-0 w-[6px] h-[6px]"></div>
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
  animation: slideInInput 0.4s ease-out forwards;
}

@keyframes slideInInput {
  to { opacity: 1; transform: translateX(0); }
}

.holo-input-label {
  color: var(--theme-color);
  text-shadow: 0 0 4px var(--theme-color-glow);
}

.holo-input {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--theme-color);
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
  background: var(--theme-color);
  box-shadow: 0 0 8px var(--theme-color-glow);
  transform: scaleX(0.2);
}

.holo-input:focus ~ .holo-input-line {
  transform: scaleX(1);
}

.holo-input-decor {
  background: var(--theme-color);
  box-shadow: 0 0 5px var(--theme-color-glow);
}
</style>
