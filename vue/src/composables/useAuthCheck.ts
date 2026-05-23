import { ref } from 'vue';
import { useUserStore } from '@/store/userStore';

export function useAuthCheck() {
  const userStore = useUserStore();
  const showLoginModal = ref(false);

  const checkAuth = (): boolean => {
    if (!userStore.isLoggedIn) {
      showLoginModal.value = true;
      return false;
    }
    return true;
  };

  const onLoginSuccess = () => {
    showLoginModal.value = false;
    window.location.reload();
  };

  return {
    showLoginModal,
    checkAuth,
    onLoginSuccess,
  };
}
