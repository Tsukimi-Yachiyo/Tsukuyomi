import { inject, type InjectionKey } from 'vue';
import { addModal, removeModal, clearAllModals } from '@/store/modalStore';
import type { ModalConfig } from '@/store/modalStore';

export interface ModalApi {
  addModal: (config: ModalConfig) => string;
  removeModal: (id: string) => void;
  clearAllModals: () => void;
}

export const ModalKey: InjectionKey<ModalApi> = Symbol('ModalApi');

const defaultModalApi: ModalApi = {
  addModal,
  removeModal,
  clearAllModals,
};

export function useModal(): ModalApi {
  const modalApi = inject<ModalApi>(ModalKey, defaultModalApi);
  return modalApi;
}
