import { shallowRef, markRaw } from 'vue';

export type ModalType = 'message' | 'function';

export interface ModalConfig {
  id?: string;
  type: ModalType;
  component: any;
  props?: Record<string, unknown>;
  autoClose?: number;
  closable?: boolean;
  onClosed?: () => void;
}

export interface ModalInstance {
  id: string;
  type: ModalType;
  component: any;
  props?: Record<string, unknown>;
  autoClose?: number;
  closable: boolean;
  onClosed?: () => void;
  autoCloseTimer?: ReturnType<typeof setTimeout>;
}

const modalStackRef = shallowRef<ModalInstance[]>([]);

let modalCounter = 0;

export function getModalStack() {
  return modalStackRef;
}

export function addModal(config: ModalConfig): string {
  const id = config.id || `modal-${++modalCounter}-${Date.now()}`;
  const instance: ModalInstance = {
    id,
    type: config.type,
    component: markRaw(config.component),
    props: config.props || {},
    autoClose: config.autoClose,
    closable: config.closable !== false,
    onClosed: config.onClosed,
  };

  if (config.type === 'message' && config.autoClose && config.autoClose > 0) {
    instance.autoCloseTimer = setTimeout(() => {
      removeModal(id);
    }, config.autoClose);
  }

  modalStackRef.value = [...modalStackRef.value, instance];
  return id;
}

export function removeModal(id: string): void {
  const stack = [...modalStackRef.value];
  const index = stack.findIndex(m => m.id === id);
  if (index !== -1) {
    const modal = stack[index];
    if (modal.autoCloseTimer) {
      clearTimeout(modal.autoCloseTimer);
    }
    if (modal.onClosed) {
      modal.onClosed();
    }
    stack.splice(index, 1);
    modalStackRef.value = stack;
  }
}

export function clearAllModals(): void {
  const stack = [...modalStackRef.value];
  stack.forEach(modal => {
    if (modal.autoCloseTimer) {
      clearTimeout(modal.autoCloseTimer);
    }
    if (modal.onClosed) {
      modal.onClosed();
    }
  });
  modalStackRef.value = [];
}

export function closeTopModal(): void {
  const stack = modalStackRef.value;
  if (stack.length > 0) {
    const topModal = stack[stack.length - 1];
    removeModal(topModal.id);
  }
}

export function getTopFunctionModal(): ModalInstance | undefined {
  const stack = modalStackRef.value;
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].type === 'function') {
      return stack[i];
    }
  }
  return undefined;
}
