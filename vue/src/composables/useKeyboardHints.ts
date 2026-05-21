import { ref } from 'vue';

export interface KeyHint {
  key: string;
  label: string;
}

const DEFAULT_BOTTOM_HINTS: KeyHint[] = [
  { key: 'W A S D', label: '移动 / MOVE' },
  { key: 'Q E', label: '切换镜头角度 / CHANGE CAMERATION' },
];

const bottomHints = ref<KeyHint[]>([...DEFAULT_BOTTOM_HINTS]);

export function useKeyboardHints() {
  const addHint = (key: string, label: string) => {
    const existing = bottomHints.value.findIndex((h) => h.key === key);
    if (existing !== -1) {
      bottomHints.value[existing] = { key, label };
    } else {
      bottomHints.value.push({ key, label });
    }
  };

  const removeHint = (key: string) => {
    bottomHints.value = bottomHints.value.filter((h) => h.key !== key);
  };

  const clearHints = () => {
    bottomHints.value = [];
  };

  return {
    bottomHints,
    addHint,
    removeHint,
    clearHints,
  };
}
