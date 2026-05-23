import { ref } from 'vue';
import { useUserStore } from '@/store/userStore';
import type { LoginParams, MailLoginParams, RegisterParams, ChangePasswordParams } from '@/api/types';

export type AuthMode = 'login' | 'register' | 'change' | 'mail';

export function useAuth() {
  const userStore = useUserStore();
  
  const loading = ref(false);
  const errorMsg = ref('');
  const successMsg = ref('');
  const currentMode = ref<AuthMode>('login');

  const setMode = (mode: AuthMode) => {
    currentMode.value = mode;
    clearMessages();
  };

  const clearMessages = () => {
    errorMsg.value = '';
    successMsg.value = '';
  };

  const login = async (params: LoginParams) => {
    loading.value = true;
    clearMessages();
    
    try {
      await userStore.login(params.username, params.password);
    } catch (err: any) {
      errorMsg.value = err.message || '登录失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loginByMail = async (params: MailLoginParams) => {
    loading.value = true;
    clearMessages();
    
    try {
      await userStore.loginByMail(params);
    } catch (err: any) {
      errorMsg.value = err.message || '邮箱登录失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (params: RegisterParams) => {
    loading.value = true;
    clearMessages();
    
    try {
      await userStore.register(params);
      successMsg.value = '注册成功，请登录';
      setMode('login');
    } catch (err: any) {
      errorMsg.value = err.message || '注册失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const changePassword = async (params: ChangePasswordParams) => {
    loading.value = true;
    clearMessages();
    
    try {
      await userStore.changePassword(params);
      successMsg.value = '密码修改成功';
      setMode('login');
    } catch (err: any) {
      errorMsg.value = err.message || '修改密码失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const sendCode = async (email: string) => {
    try {
      await userStore.sendCode(email);
      successMsg.value = '验证码已发送';
    } catch (err: any) {
      errorMsg.value = err.message || '发送验证码失败';
      throw err;
    }
  };

  return {
    currentMode,
    loading,
    errorMsg,
    successMsg,
    setMode,
    clearMessages,
    login,
    loginByMail,
    register,
    changePassword,
    sendCode
  };
}
