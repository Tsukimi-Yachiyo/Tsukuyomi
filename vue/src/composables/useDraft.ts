import { ref, watch, onUnmounted } from 'vue';

const STORAGE_KEY = 'post_editor_draft';
const SAVE_INTERVAL = 30000;

export interface DraftData {
  title: string;
  content: string;
  savedAt: number;
}

export function useDraft() {
  const title = ref('');
  const content = ref('');
  const draftStatus = ref<'saved' | 'saving' | 'unsaved'>('unsaved');
  const restorePrompt = ref(false);
  const isRestored = ref(false);

  let saveTimer: ReturnType<typeof setInterval> | null = null;

  function getDraft(): DraftData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveDraft(): void {
    if (!title.value && !content.value) return;
    draftStatus.value = 'saving';
    const data: DraftData = {
      title: title.value,
      content: content.value,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    draftStatus.value = 'saved';
  }

  function checkDraft(): boolean {
    return getDraft() !== null;
  }

  function loadDraft(): boolean {
    const draft = getDraft();
    if (draft) {
      title.value = draft.title;
      content.value = draft.content;
      draftStatus.value = 'saved';
      isRestored.value = true;
      restorePrompt.value = true;
      return true;
    }
    return false;
  }

  function clearDraft(): void {
    localStorage.removeItem(STORAGE_KEY);
    draftStatus.value = 'unsaved';
    isRestored.value = false;
    restorePrompt.value = false;
  }

  function confirmRestore(): void {
    restorePrompt.value = false;
  }

  function discardDraft(): void {
    clearDraft();
    title.value = '';
    content.value = '';
    restorePrompt.value = false;
  }

  function startAutoSave(): void {
    saveTimer = setInterval(saveDraft, SAVE_INTERVAL);
  }

  function stopAutoSave(): void {
    if (saveTimer) {
      clearInterval(saveTimer);
      saveTimer = null;
    }
  }

  watch([title, content], () => {
    if (isRestored.value) {
      draftStatus.value = 'unsaved';
    }
  });

  startAutoSave();

  onUnmounted(() => {
    stopAutoSave();
  });

  return {
    title,
    content,
    draftStatus,
    restorePrompt,
    saveDraft,
    checkDraft,
    loadDraft,
    clearDraft,
    confirmRestore,
    discardDraft,
  };
}
