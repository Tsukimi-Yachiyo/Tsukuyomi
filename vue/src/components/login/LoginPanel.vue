<template>
  <div class="login-panel-container">

    <!-- 使用缩放容器将体积缩小为原本的约三分之一 -->
    <div class="panel-scale-wrapper">

      <!-- 降低整体外发光，保持画面清脆锐利 -->
      <HoloPanel :is-open="true" theme-color="#4df0ff" :glow-opacity="0.1" style="padding: 15px;">

        <div v-if="true" :key="animKey" class="panel-content w-220 min-h-120">

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

          <!-- 左右分栏经典布局 -->
          <div class="login-layout">

            <!-- ================= 左侧区域 ================= -->
            <div class="layout-left">
              <div class="titles">
                <HoloText size="16px" secondary text="月见八千代" :anim="[0.6, 0.05]" />
                <HoloText size="54px" weight="bold" secondary style="letter-spacing: 5px; margin-top: -5px;" text="月见ヤチヨ" :anim="[0.8, 0.1]" />
                <HoloText size="38px" weight="bold" style="transform: skewX(-12deg); margin: 5px 0; display: inline-block;" text="系统认证中心" :anim="[1.1, 0.03]" />
                <HoloText size="18px" secondary text="TSUKUYOMI SECURE LOGIN" :anim="[1.4, 0.05]" />
              </div>

              <!-- 优化后的左侧底部：包含状态和移过来的快捷操作链接 -->
              <div class="bottom-section">
                <!-- 棋盘格 -->
                <HoloCheckerboard :rows="8" :cols="12" :size="10" :anim-delay="0.8" loop />

                <div class="bottom-info-group">
                  <div class="personnel">
                    <div>
                      <HoloText size="10px" text="SYSTEM STATUS" :anim="[1.5, 0.02]" />
                      <HoloText size="16px" secondary text="等待授权" :anim="[1.6, 0.1]" />
                    </div>
                    <div>
                      <HoloText size="10px" text="NETWORK" :anim="[1.7, 0.02]" />
                      <HoloText size="16px" secondary text="SECURE" :anim="[1.8, 0.1]" />
                    </div>
                  </div>

                  <!-- 快捷链接移到了这里，并使用左对齐 -->
                  <div class="quick-links-left">
                    <button v-if="currentTab !== 'register'" class="sys-link-btn" @click="currentTab = 'register'">
                      <HoloText size="14px" secondary text="发行新通行证" />
                      <HoloText size="10px" text="REGISTER ACCOUNT" />
                    </button>
                    <button v-if="currentTab !== 'forgot'" class="sys-link-btn" @click="currentTab = 'forgot'">
                      <HoloText size="14px" secondary text="密钥重置协议" />
                      <HoloText size="10px" text="PASSWORD RECOVERY" />
                    </button>
                    <button v-if="currentTab !== 'password' && currentTab !== 'email'" class="sys-link-btn" @click="currentTab = 'password'">
                      <HoloText size="14px" secondary text="返回认证面板" />
                      <HoloText size="10px" text="RETURN TO LOGIN" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ================= 右侧区域 ================= -->
            <div class="layout-right">
              <div class="sys-text-area">
                <HoloText size="12px" style="font-family: monospace;" text="RUNAMI YACHIYO" :anim="[0.5, 0.02]" />
                <HoloText size="12px" style="font-family: monospace;" text="TSUKUYOMI COAST MINI LIVE" :anim="[0.7, 0.02]" />
                <HoloText size="12px" style="font-family: monospace;" text="2030 7/18 THU. 21:00 START" :anim="[0.9, 0.02]" />
              </div>

              <!-- 表单主体 -->
              <div class="form-wrapper">
                <div class="tabs">
                  <button v-for="tab in tabs" :key="tab.value" class="tab-button" :class="{ active: currentTab === tab.value }" @click="currentTab = tab.value">
                    <HoloText :text="tab.label" size="13px" />
                  </button>
                </div>

                <div class="form-area">
                  <!-- 密码登录 -->
                  <template v-if="currentTab === 'password'">
                    <HoloInput v-model="loginForm.email" label="USER_ID / 邮箱" placeholder="Enter Email..." :anim-delay="1.2" />
                    <HoloInput v-model="loginForm.password" label="PASSWORD / 密码" type="password" placeholder="***" :anim-delay="1.4" />
                    <button class="submit-button" @click="handlePasswordLogin">
                      <HoloText text="ACCESS / 登录" size="16px" weight="bold" />
                    </button>
                  </template>

                  <!-- 验证码登录 -->
                  <template v-else-if="currentTab === 'email'">
                    <HoloInput v-model="emailLoginForm.email" label="USER_ID / 邮箱" placeholder="Enter Email..." :anim-delay="1.2" />
                    <div class="code-input-group">
                      <HoloInput v-model="emailLoginForm.code" label="AUTH_CODE / 验证码" placeholder="Code..." :anim-delay="1.4" />
                      <button class="send-code-button" @click="handleSendCode('emailLogin')" :disabled="countdown > 0">
                        <span v-if="countdown > 0">{{ countdown }}s</span><span v-else>发送</span>
                      </button>
                    </div>
                    <button class="submit-button" @click="handleEmailLogin">
                      <HoloText text="ACCESS / 登录" size="16px" weight="bold" />
                    </button>
                  </template>

                  <!-- 注册 -->
                  <template v-else-if="currentTab === 'register'">
                    <HoloInput v-model="registerForm.email" label="NEW_ID / 邮箱" placeholder="Enter Email..." :anim-delay="1.2" />
                    <div class="code-input-group">
                      <HoloInput v-model="registerForm.code" label="AUTH_CODE / 验证码" placeholder="Code..." :anim-delay="1.4" />
                      <button class="send-code-button" @click="handleSendCode('register')" :disabled="countdown > 0">
                        <span v-if="countdown > 0">{{ countdown }}s</span><span v-else>发送</span>
                      </button>
                    </div>
                    <HoloInput v-model="registerForm.password" label="PASSWORD / 密码" type="password" placeholder="***" :anim-delay="1.6" />
                    <HoloInput v-model="registerForm.confirmPassword" label="CONFIRM / 确认密码" type="password" placeholder="***" :anim-delay="1.8" />
                    <button class="submit-button" @click="handleRegister">
                      <HoloText text="REGISTER / 注册" size="16px" weight="bold" />
                    </button>
                  </template>

                  <!-- 忘记密码 -->
                  <template v-else-if="currentTab === 'forgot'">
                    <HoloInput v-model="forgotForm.email" label="USER_ID / 邮箱" placeholder="Enter Email..." :anim-delay="1.2" />
                    <div class="code-input-group">
                      <HoloInput v-model="forgotForm.code" label="AUTH_CODE / 验证码" placeholder="Code..." :anim-delay="1.4" />
                      <button class="send-code-button" @click="handleSendCode('forgot')" :disabled="countdown > 0">
                        <span v-if="countdown > 0">{{ countdown }}s</span><span v-else>发送</span>
                      </button>
                    </div>
                    <HoloInput v-model="forgotForm.newPassword" label="NEW_PWD / 新密码" type="password" placeholder="***" :anim-delay="1.6" />
                    <HoloInput v-model="forgotForm.confirmPassword" label="CONFIRM / 确认新密码" type="password" placeholder="***" :anim-delay="1.8" />
                    <button class="submit-button" @click="handleForgotPassword">
                      <HoloText text="UPDATE / 修改密码" size="16px" weight="bold" />
                    </button>
                  </template>
                </div>
              </div>

              <!-- 优化后的右下角：专注呈现身份特征 (头像与条形码) -->
              <div class="right-footer">
                <div class="avatar-barcode-group">
                  <div class="avatar-box" style="animation-delay: 1.5s;">
                    <div class="avatar-inner">
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

    <CaptchaDialog v-model:visible="showCaptcha" @success="handleCaptchaSuccess" @cancel="handleCaptchaCancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useStore } from '@/store/userStore';
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

const userStore = useStore();
const animKey = ref(0);
const showCaptcha = ref(false);
const currentCaptchaContext = ref<'register' | 'forgot' | null>(null);
const { countdown, start: startCountdown } = useCountdown(60);

type Tab = 'password' | 'email' | 'register' | 'forgot';
const currentTab = ref<Tab>('password');
const tabs: { label: string; value: Tab }[] = [
  { label: '密码登录', value: 'password' },
  { label: '验证码登录', value: 'email' },
];

const loginForm = reactive({ email: '', password: '' });
const emailLoginForm = reactive({ email: '', code: '' });
const registerForm = reactive({ email: '', code: '', password: '', confirmPassword: '' });
const forgotForm = reactive({ email: '', code: '', newPassword: '', confirmPassword: '' });

const handleSendCode = async (context: 'emailLogin' | 'register' | 'forgot') => {
  let email = '';
  if (context === 'emailLogin') email = emailLoginForm.email;
  else if (context === 'register') email = registerForm.email;
  else email = forgotForm.email;

  if (!email) {
    eventBus.emit('vue:show-message', { text: '请先输入邮箱', type: 'warning' });
    return;
  }

  if (context === 'register' || context === 'forgot') {
    currentCaptchaContext.value = context;
    showCaptcha.value = true;
    return;
  }
  await sendCode(email);
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
  if (currentCaptchaContext.value === 'register') sendCode(registerForm.email);
  else if (currentCaptchaContext.value === 'forgot') sendCode(forgotForm.email);
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
  } catch (error) {
    eventBus.emit('vue:show-message', { text: '登录失败，请检查邮箱和密码', type: 'error' });
  }
};

const handleEmailLogin = async () => {
  try {
    await userStore.loginByMail({ email: emailLoginForm.email, code: emailLoginForm.code });
  } catch (error) {
    eventBus.emit('vue:show-message', { text: '登录失败，请检查邮箱和验证码', type: 'error' });
  }
};

const handleRegister = async () => {
  if (registerForm.password !== registerForm.confirmPassword) {
    eventBus.emit('vue:show-message', { text: '两次输入的密码不一致', type: 'warning' });
    return;
  }
  try {
    await userStore.register({
      username: registerForm.email,
      email: registerForm.email,
      code: registerForm.code,
      password: registerForm.password,
    });
    await userStore.login(registerForm.email, registerForm.password);
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
</script>

<style scoped>
.login-panel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: transparent;
  overflow: hidden;
}

.panel-scale-wrapper {
  transform: scale(0.58);
  transform-origin: center center;
}

.panel-content {
  position: relative;
  z-index: 20;
  display: flex;
  flex-direction: column;
}

.login-layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;
  padding: 40px 50px;
  flex: 1;
}

.layout-left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.titles {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bottom-section {
  display: flex;
  align-items: flex-end;
  gap: 20px;
}

.bottom-info-group {
  display: flex;
  flex-direction: column;
  gap: 15px; /* 控制状态文字与底部操作链接的间距 */
  margin-bottom: -5px;
}

.personnel {
  display: flex;
  gap: 30px;
  padding-left: 10px;
}

/* 移至左侧底部的快捷操作链接样式 */
.quick-links-left {
  display: flex;
  gap: 20px;
  padding-left: 10px;
}

.quick-links-left .sys-link-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s;
  padding: 0;
  display: flex;
  flex-direction: column;
  /* 文字向左对齐 */
  align-items: flex-start;
  text-align: left;
}

.quick-links-left .sys-link-btn:hover {
  opacity: 1;
  /* 悬浮时轻微上浮，而不是向左缩进 */
  transform: translateY(-3px);
}

.layout-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.sys-text-area {
  text-align: right;
  opacity: 0.9;
  margin-bottom: 25px;
}

.form-wrapper {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  justify-content: flex-end;
  width: 100%;
}

.tab-button {
  background: transparent;
  border: 1px solid var(--theme-color);
  color: var(--theme-color);
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.3s;
  opacity: 0.5;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%);
}

.tab-button:hover { opacity: 0.8; }
.tab-button.active {
  background: rgba(77, 240, 255, 0.15);
  opacity: 1;
  border-bottom: 2px solid var(--theme-color);
  box-shadow: inset 0 -5px 10px rgba(77, 240, 255, 0.2);
}

.form-area {
  width: 100%;
}

.code-input-group {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}
.code-input-group :deep(.holo-input-wrapper) {
  flex: 1;
  margin-bottom: 0;
}

.send-code-button {
  background: rgba(77, 240, 255, 0.1);
  border: 1px solid var(--theme-color);
  color: var(--theme-color);
  padding: 8px 16px;
  cursor: pointer;
  height: 38px;
  transition: all 0.3s;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
}
.send-code-button:hover:not(:disabled) {
  background: var(--theme-color);
  color: #000;
  box-shadow: 0 0 10px var(--theme-color-glow);
}
.send-code-button:disabled { opacity: 0.4; cursor: not-allowed; }

.submit-button {
  width: 100%;
  background: rgba(77, 240, 255, 0.05);
  border: 1px solid var(--theme-color);
  color: var(--theme-color);
  padding: 10px 24px;
  margin-top: 25px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}
.submit-button::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 3px; height: 100%;
  background: var(--theme-color);
  box-shadow: 0 0 10px var(--theme-color-glow);
}
.submit-button:hover {
  background: rgba(77, 240, 255, 0.2);
  box-shadow: 0 0 15px var(--theme-color-glow);
}

.right-footer {
  display: flex;
  justify-content: flex-end; /* 因为移除了链接，只需靠右对齐即可 */
  align-items: flex-end;
  width: 100%;
  margin-top: auto;
  padding-top: 30px;
}

.avatar-barcode-group {
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  gap: 15px;
}

.avatar-box {
  border: 1px solid rgba(77, 240, 255, 0.3);
  padding: 6px;
  width: 80px;
  height: 80px;
  box-shadow: inset 0 0 15px rgba(77, 240, 255, 0.1);
  position: relative;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  animation: popDecor 0.5s ease-out forwards;
}

.avatar-inner {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
}

.corner-decoration {
  position: absolute;
  width: 8px; height: 8px;
  border-color: var(--theme-color);
}
.corner-decoration.corner-tl { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; }
.corner-decoration.corner-tr { top: -1px; right: -1px; border-top: 2px solid; border-right: 2px solid; }
.corner-decoration.corner-bl { bottom: -1px; left: -1px; border-bottom: 2px solid; border-left: 2px solid; }
.corner-decoration.corner-br { bottom: -1px; right: -1px; border-bottom: 2px solid; border-right: 2px solid; }

@keyframes popDecor {
  to { opacity: 1; transform: scale(1); }
}
</style>