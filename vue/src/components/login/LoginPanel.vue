<template>
  <div class="flex items-center justify-center min-h-screen bg-transparent overflow-hidden">

    <div class="scale-[0.58] origin-center">

      <HoloPanel :is-open="true" theme-color="#4df0ff" :glow-opacity="0.1" class="p-[15px]">

        <div v-if="true" :key="animKey" class="relative z-20 flex flex-col w-220 min-h-120">

          <HoloBorder
              :anim="[0.3, 1.0]"
              :layers="[
              { inset: 18, borderWidth: 1, cornerOffset: 18, cornerStrokeWidth: 2, opacity: 0.3 },
              { inset: 12, borderWidth: 2, cornerOffset: 12, cornerStrokeWidth: 3, opacity: 0.8 }
            ]"
              :corners="['tl', 'tr', 'bl', 'br']"
              :corner-size="45"
              :show-notches="false"
          />

          <div class="grid grid-cols-[1.2fr_1fr] gap-10 p-10 flex-1">

            <div class="flex flex-col justify-between">
              <div class="flex flex-col gap-0.5">
                <HoloText size="16px" secondary text="月见八千代" :anim="[0.6, 0.05]" />
                <HoloText size="54px" weight="bold" secondary class="[letter-spacing:5px] -mt-[5px]" text="月见ヤチヨ" :anim="[0.8, 0.1]" />
                <HoloText size="38px" weight="bold" class="[transform:skewX(-12deg)] my-[5px] inline-block" text="系统认证中心" :anim="[1.1, 0.03]" />
                <HoloText size="18px" secondary text="TSUKUYOMI SECURE LOGIN" :anim="[1.4, 0.05]" />
              </div>

              <div class="flex items-end gap-5">
                <HoloCheckerboard :rows="8" :cols="12" :size="10" :anim-delay="0.8" loop />

                <div class="flex flex-col gap-[15px] mb-[-5px]">
                  <div class="flex gap-[30px] pl-2.5">
                    <div>
                      <HoloText size="10px" text="SYSTEM STATUS" :anim="[1.5, 0.02]" />
                      <HoloText size="16px" secondary text="等待授权" :anim="[1.6, 0.1]" />
                    </div>
                    <div>
                      <HoloText size="10px" text="NETWORK" :anim="[1.7, 0.02]" />
                      <HoloText size="16px" secondary text="SECURE" :anim="[1.8, 0.1]" />
                    </div>
                  </div>

                  <div class="flex gap-5 pl-2.5">
                    <button v-if="currentTab !== 'register'" class="bg-transparent border-none cursor-pointer opacity-60 transition-all duration-300 p-0 flex flex-col items-start text-left hover:opacity-100 hover:-translate-y-0.75" @click="currentTab = 'register'">
                      <HoloText size="14px" secondary text="发行新通行证" />
                      <HoloText size="10px" text="REGISTER ACCOUNT" />
                    </button>
                    <button v-if="currentTab !== 'forgot'" class="bg-transparent border-none cursor-pointer opacity-60 transition-all duration-300 p-0 flex flex-col items-start text-left hover:opacity-100 hover:-translate-y-0.75" @click="currentTab = 'forgot'">
                      <HoloText size="14px" secondary text="密钥重置协议" />
                      <HoloText size="10px" text="PASSWORD RECOVERY" />
                    </button>
                    <button v-if="currentTab !== 'password' && currentTab !== 'email'" class="bg-transparent border-none cursor-pointer opacity-60 transition-all duration-300 p-0 flex flex-col items-start text-left hover:opacity-100 hover:-translate-y-0.75" @click="currentTab = 'password'">
                      <HoloText size="14px" secondary text="返回认证面板" />
                      <HoloText size="10px" text="RETURN TO LOGIN" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-end">
              <div class="text-right opacity-90 mb-6">
                <HoloText size="12px" class="font-mono" text="RUNAMI YACHIYO" :anim="[0.5, 0.02]" />
                <HoloText size="12px" class="font-mono" text="TSUKUYOMI COAST MINI LIVE" :anim="[0.7, 0.02]" />
                <HoloText size="12px" class="font-mono" text="2030 7/18 THU. 21:00 START" :anim="[0.9, 0.02]" />
              </div>

              <div class="w-full max-w-[320px] flex flex-col items-end">
                <div class="flex gap-2.5 mb-4 justify-end w-full">
                  <button v-for="tab in tabs" :key="tab.value" class="bg-transparent border border-[#4df0ff] text-[#4df0ff] px-3 py-1.5 cursor-pointer transition-all duration-300 opacity-50 hover:opacity-80 [clip-path:polygon(0_0,100%_0,100%_calc(100%_-_5px),calc(100%_-_5px)_100%,0_100%)]" :class="{ 'bg-[#4df0ff]/15 opacity-100 border-b-2 border-[#4df0ff] [box-shadow:inset_0_-5px_10px_rgba(77,240,255,0.2)]': currentTab === tab.value }" @click="currentTab = tab.value">
                    <HoloText :text="tab.label" size="13px" />
                  </button>
                </div>

                <div class="w-full">
                  <template v-if="currentTab === 'password'">
                    <HoloInput v-model="loginForm.email" label="USER_ID / 邮箱" placeholder="Enter Email..." :anim-delay="1.2" />
                    <HoloInput v-model="loginForm.password" label="PASSWORD / 密码" type="password" placeholder="***" :anim-delay="1.4" />
                    <button class="w-full bg-[#4df0ff]/05 border border-[#4df0ff] text-[#4df0ff] px-6 py-2.5 mt-6 cursor-pointer transition-all duration-300 relative overflow-hidden hover:bg-[#4df0ff]/20 [box-shadow:0_0_15px_var(--theme-color-glow)] submit-button" @click="handlePasswordLogin">
                      <HoloText text="ACCESS / 登录" size="16px" weight="bold" />
                    </button>
                  </template>

                  <template v-else-if="currentTab === 'email'">
                    <HoloInput v-model="emailLoginForm.email" label="USER_ID / 邮箱" placeholder="Enter Email..." :anim-delay="1.2" />
                    <div class="flex gap-2.5 items-end [&>.holo-input-wrapper]:flex-1 [&>.holo-input-wrapper]:mb-0">
                      <HoloInput v-model="emailLoginForm.code" label="AUTH_CODE / 验证码" placeholder="Code..." :anim-delay="1.4" />
                      <button class="bg-[#4df0ff]/10 border border-[#4df0ff] text-[#4df0ff] px-4 py-2 cursor-pointer h-[38px] transition-all duration-300 font-['Courier_New',Courier,monospace] text-sm hover:bg-[#4df0ff] hover:text-black [box-shadow:0_0_10px_var(--theme-color-glow)] disabled:opacity-40 disabled:cursor-not-allowed send-code-button" @click="handleSendCode('emailLogin')" :disabled="countdown > 0">
                        <span v-if="countdown > 0">{{ countdown }}s</span><span v-else>发送</span>
                      </button>
                    </div>
                    <button class="w-full bg-[#4df0ff]/05 border border-[#4df0ff] text-[#4df0ff] px-6 py-2.5 mt-6 cursor-pointer transition-all duration-300 relative overflow-hidden hover:bg-[#4df0ff]/20 [box-shadow:0_0_15px_var(--theme-color-glow)] submit-button" @click="handleEmailLogin">
                      <HoloText text="ACCESS / 登录" size="16px" weight="bold" />
                    </button>
                  </template>

                  <template v-else-if="currentTab === 'register'">

                    <div v-if="registerStep === 1" class="flex flex-col relative animate-[fadeIn_0.3s_ease-out]">
                      <HoloInput v-model="registerForm.username" label="USERNAME / 用户名" placeholder="Enter Username..." :anim-delay="1.1" />
                      <HoloInput v-model="registerForm.email" label="NEW_ID / 邮箱" placeholder="Enter Email..." :anim-delay="1.3" />

                      <button class="w-full bg-[#4df0ff]/05 border border-[#4df0ff] text-[#4df0ff] px-6 py-2.5 mt-6 cursor-pointer transition-all duration-300 relative overflow-hidden hover:bg-[#4df0ff]/20 [box-shadow:0_0_15px_var(--theme-color-glow)] submit-button" @click="nextRegisterStep">
                        <HoloText text="NEXT / 下一步" size="16px" weight="bold" />
                      </button>
                    </div>

                    <div v-else class="flex flex-col relative animate-[fadeIn_0.3s_ease-out]">

                      <button class="bg-transparent border-none text-[#4df0ff]/60 hover:text-[#4df0ff] text-xs mb-3 flex items-center gap-1 cursor-pointer w-max transition-colors p-0" @click="prevRegisterStep">
                        <span>&lt;</span> BACK / 返回修改邮箱
                      </button>

                      <div class="flex gap-2.5 items-end [&>.holo-input-wrapper]:flex-1 [&>.holo-input-wrapper]:mb-0">
                        <HoloInput v-model="registerForm.code" label="AUTH_CODE / 验证码" placeholder="Code..." :anim-delay="0.1" />
                        <button class="bg-[#4df0ff]/10 border border-[#4df0ff] text-[#4df0ff] px-4 py-2 cursor-pointer h-[38px] transition-all duration-300 font-['Courier_New',Courier,monospace] text-sm hover:bg-[#4df0ff] hover:text-black [box-shadow:0_0_10px_var(--theme-color-glow)] disabled:opacity-40 disabled:cursor-not-allowed send-code-button" @click="handleSendCode('register')" :disabled="countdown > 0">
                          <span v-if="countdown > 0">{{ countdown }}s</span><span v-else>发送</span>
                        </button>
                      </div>

                      <HoloInput v-model="registerForm.password" label="PASSWORD / 密码" type="password" placeholder="***" :anim-delay="0.2" />
                      <HoloInput v-model="registerForm.confirmPassword" label="CONFIRM / 确认密码" type="password" placeholder="***" :anim-delay="0.3" />

                      <label class="flex items-center gap-2 mt-4 cursor-pointer select-none group">
                        <span
                          class="w-4 h-4 border border-[#4df0ff]/50 flex items-center justify-center transition-all duration-200"
                          :class="registerForm.agreeTerms ? 'bg-[#4df0ff]/20 border-[#4df0ff]' : 'bg-transparent'"
                          @click="registerForm.agreeTerms = !registerForm.agreeTerms"
                        >
                          <svg v-if="registerForm.agreeTerms" class="w-3 h-3 text-[#4df0ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span class="text-[11px] text-white/50 group-hover:text-white/70 transition-colors">
                          我已阅读并同意
                          <a href="/#/agreement" target="_blank" class="text-[#4df0ff]/80 hover:text-[#4df0ff] underline underline-offset-2" @click.stop>用户协议</a>
                        </span>
                      </label>

                      <button
                          class="w-full bg-[#4df0ff]/05 border border-[#4df0ff] text-[#4df0ff] px-6 py-2.5 mt-4 cursor-pointer transition-all duration-300 relative overflow-hidden hover:bg-[#4df0ff]/20 [box-shadow:0_0_15px_var(--theme-color-glow)] submit-button"
                          :class="{ 'opacity-40 cursor-not-allowed pointer-events-none': !registerForm.agreeTerms }"
                          @click="handleRegister"
                      >
                        <HoloText text="REGISTER / 注册" size="16px" weight="bold" />
                      </button>
                    </div>
                  </template>

                  <template v-else-if="currentTab === 'forgot'">
                    <HoloInput v-model="forgotForm.email" label="USER_ID / 邮箱" placeholder="Enter Email..." :anim-delay="1.2" />
                    <div class="flex gap-2.5 items-end [&>.holo-input-wrapper]:flex-1 [&>.holo-input-wrapper]:mb-0">
                      <HoloInput v-model="forgotForm.code" label="AUTH_CODE / 验证码" placeholder="Code..." :anim-delay="1.4" />
                      <button class="bg-[#4df0ff]/10 border border-[#4df0ff] text-[#4df0ff] px-4 py-2 cursor-pointer h-[38px] transition-all duration-300 font-['Courier_New',Courier,monospace] text-sm hover:bg-[#4df0ff] hover:text-black [box-shadow:0_0_10px_var(--theme-color-glow)] disabled:opacity-40 disabled:cursor-not-allowed send-code-button" @click="handleSendCode('forgot')" :disabled="countdown > 0">
                        <span v-if="countdown > 0">{{ countdown }}s</span><span v-else>发送</span>
                      </button>
                    </div>
                    <HoloInput v-model="forgotForm.newPassword" label="NEW_PWD / 新密码" type="password" placeholder="***" :anim-delay="1.6" />
                    <HoloInput v-model="forgotForm.confirmPassword" label="CONFIRM / 确认新密码" type="password" placeholder="***" :anim-delay="1.8" />
                    <button class="w-full bg-[#4df0ff]/05 border border-[#4df0ff] text-[#4df0ff] px-6 py-2.5 mt-6 cursor-pointer transition-all duration-300 relative overflow-hidden hover:bg-[#4df0ff]/20 [box-shadow:0_0_15px_var(--theme-color-glow)] submit-button" @click="handleForgotPassword">
                      <HoloText text="UPDATE / 修改密码" size="16px" weight="bold" />
                    </button>
                  </template>
                </div>
              </div>

              <div class="flex justify-end items-end w-full mt-auto pt-7.5">
                <div class="flex flex-row items-start gap-[15px]">
                  <div class="border border-[#4df0ff]/30 p-1.5 w-20 h-20 [box-shadow:inset_0_0_15px_rgba(77,240,255,0.1)] relative bg-black/40 opacity-0 [animation:popDecor_0.5s_ease-out_forwards]" style="animation-delay: 1.5s;">
                    <div class="w-full h-full flex items-center justify-center">
                      <HoloAvatar loop :src="avatarSrc" />
                    </div>
                  </div>
                  <HoloBarcode :anim-delay="2.0" loop class="barcode-inline"/>
                </div>
              </div>

            </div>
          </div>
        </div>
      </HoloPanel>
    </div>

    <div v-if="showCaptcha" class="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <CaptchaDialog @success="handleCaptchaSuccess" @close="handleCaptchaCancel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, watch} from 'vue';
import { useUserStore } from '@/store/userStore';
import { useCountdown } from '@/composables/useCountdown';
import HoloPanel from '@/components/holo/HoloPanel.vue';
import HoloBorder from '@/components/holo/HoloBorder.vue';
import HoloText from '@/components/holo/HoloText.vue';
import HoloInput from '@/components/holo/HoloInput.vue';
import HoloAvatar from '@/components/holo/HoloAvatar.vue';
import HoloCheckerboard from '@/components/holo/HoloCheckerboard.vue';
import HoloBarcode from '@/components/holo/HoloBarcode.vue';
import CaptchaDialog from '@/components/login/CaptchaDialog.vue';
import avatarSrc from '@/assets/icons/yachiyo-tsukimi-v3.svg';
import {eventBus} from "@/utils/eventBus";

const emit = defineEmits<{
  success: [];
}>();

const userStore = useUserStore();
const animKey = ref(0);
const registerStep = ref(1);
const showCaptcha = ref(false);
const currentCaptchaContext = ref<'emailLogin' | 'register' | 'forgot' | null>(null);
const { countdown, start: startCountdown } = useCountdown(60);

type Tab = 'password' | 'email' | 'register' | 'forgot';
const currentTab = ref<Tab>('password');
const tabs: { label: string; value: Tab }[] = [
  { label: '密码登录', value: 'password' },
  { label: '验证码登录', value: 'email' },
];

const loginForm = reactive({ email: '', password: '' });
const emailLoginForm = reactive({ email: '', code: '' });
const registerForm = reactive({username: '', email: '', code: '', password: '', confirmPassword: '', agreeTerms: false });
const forgotForm = reactive({ email: '', code: '', newPassword: '', confirmPassword: '' });

const handleSendCode = async (context: 'emailLogin' | 'register' | 'forgot') => {
  let email: string;
  if (context === 'emailLogin') email = emailLoginForm.email;
  else if (context === 'register') email = registerForm.email;
  else email = forgotForm.email;

  if (!email) {
    eventBus.emit('vue:show-message', { text: '请先输入邮箱', type: 'warning' });
    return;
  }

  currentCaptchaContext.value = context;
  showCaptcha.value = true;
};

const sendCode = async (email: string) => {
  try {
    await userStore.sendCode(email);
    startCountdown();
    eventBus.emit('vue:show-message', { text: '验证码已发送', type: 'success' });
  } catch (error) {
    console.error('发送验证码失败:', error);
    eventBus.emit('vue:show-message', { text: '发送失败，请重试', type: 'error' });
  }
};

const handleCaptchaSuccess = () => {
  if (currentCaptchaContext.value === 'register') {
    sendCode(registerForm.email);
  } else if (currentCaptchaContext.value === 'forgot') {
    sendCode(forgotForm.email);
  } else if (currentCaptchaContext.value === 'emailLogin') {
    sendCode(emailLoginForm.email); // 新增对登录场景的支持
  }
  showCaptcha.value = false;
  currentCaptchaContext.value = null;
};

const handleCaptchaCancel = () => {
  showCaptcha.value = false;
  currentCaptchaContext.value = null;
};

const handlePasswordLogin = async () => {
  try {
    await userStore.login(loginForm.email, loginForm.password);
    emit('success');
  } catch (error) {
    eventBus.emit('vue:show-message', { text: '登录失败，请检查邮箱和密码', type: 'error' });
  }
};

const handleEmailLogin = async () => {
  try {
    await userStore.loginByMail({ email: emailLoginForm.email, code: emailLoginForm.code });
    emit('success');
  } catch (error) {
    eventBus.emit('vue:show-message', { text: '登录失败，请检查邮箱和验证码', type: 'error' });
  }
};

const handleRegister = async () => {
  if (!registerForm.agreeTerms) {
    eventBus.emit('vue:show-message', { text: '请先同意用户协议', type: 'warning' });
    return;
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    eventBus.emit('vue:show-message', { text: '两次输入的密码不一致', type: 'warning' });
    return;
  }
  try {
    await userStore.register({
      username: registerForm.username,
      email: registerForm.email,
      code: registerForm.code,
      password: registerForm.password,
    });
    emit('success');
  } catch (error) {
    eventBus.emit('vue:show-message', { text: '注册失败，请重试', type: 'error' });
  }
};

const handleForgotPassword = async () => {
  if (forgotForm.newPassword !== forgotForm.confirmPassword) {
    eventBus.emit('vue:show-message', { text: '两次输入的密码不一致', type: 'warning' });
    return;
  }
  try {
    await userStore.changePassword({
      username: forgotForm.email,
      email: forgotForm.email,
      code: forgotForm.code,
      password: forgotForm.newPassword,
    });
    eventBus.emit('vue:show-message', { text: '密码修改成功，请使用新密码登录', type: 'success' });
    currentTab.value = 'password';
  } catch (error) {
    eventBus.emit('vue:show-message', { text: '修改失败，请重试', type: 'error' });
  }
};

const nextRegisterStep = () => {
  if (!registerForm.username) {
    eventBus.emit('vue:show-message', { text: '请输入用户名', type: 'warning' });
    return;
  }
  if (!registerForm.email) {
    eventBus.emit('vue:show-message', { text: '请输入邮箱', type: 'warning' });
    return;
  }

  // 简单的邮箱格式校验（可选）
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(registerForm.email)) {
    eventBus.emit('vue:show-message', { text: '邮箱格式不正确', type: 'warning' });
    return;
  }

  // 校验通过，进入第 2 步
  registerStep.value = 2;
};

// 5. 新增：返回上一步的逻辑
const prevRegisterStep = () => {
  registerStep.value = 1;
};

watch(currentTab, () => {
  if (currentTab.value === 'register') {
    registerStep.value = 1;
  }
});
</script>

<style scoped>
.submit-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--theme-color);
  box-shadow: 0 0 10px var(--theme-color-glow);
}

.send-code-button {
  background: rgba(77, 240, 255, 0.1);
  border: 1px solid var(--theme-color);
  color: var(--theme-color);
}

.send-code-button:hover:not(:disabled) {
  background: var(--theme-color);
  color: #000;
  box-shadow: 0 0 10px var(--theme-color-glow);
}

@keyframes popDecor {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
