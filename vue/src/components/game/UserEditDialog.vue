<template>
  <div class="relative w-[520px]">

    <HoloPanel :is-open="true" theme-color="#4df0ff" :glow-opacity="0.15">
      <HoloBorder
        :anim="[0.1, 0.4]"
        :layers="[
          { inset: 5, borderWidth: 2, cornerOffset: 5, cornerStrokeWidth: 3, opacity: 0.8 },
          { inset: 0, borderWidth: 1, cornerOffset: 0, cornerStrokeWidth: 2, opacity: 0.5 }
        ]"
        :corners="['tl', 'br']"
        :corner-size="30"
        :show-notches="false"
      />

      <div class="relative z-10 flex flex-col gap-4 px-5 py-4">

        <div class="flex justify-between items-center border-b border-[#4df0ff]/30 pb-3">
          <HoloText size="14px" weight="bold" text="EDIT PROFILE / 编辑资料" />
          <button @click="emit('close')" class="text-[#4df0ff] hover:text-white transition-colors text-3xl leading-none outline-none">&times;</button>
        </div>

        <div class="flex items-center gap-5">
          <div class="relative">
            <UserAvatar
              :user-id="Number(userStore.userId)"
              :avatar-url="avatar"
              :username="form.userName"
              size="lg"
              :clickable="false"
              class="rounded-full border-2 border-[#4df0ff]/40"
            />
            <label
              class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#4df0ff] flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
              title="更换头像"
            >
              <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
              <svg class="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </label>
          </div>
          <div class="flex-1">
            <HoloInput v-model="form.userName" label="USER_NAME / 用户名" placeholder="请输入用户名" />
          </div>
        </div>

        <div class="flex gap-4 items-center">
          <HoloText size="10px" text="GENDER / 性别" class="text-[#4df0ff]/80" />
          <div class="flex gap-2">
            <button
              class="px-4 py-1 text-sm rounded border transition-all"
              :class="form.userGender === 'MALE' ? 'bg-[#4df0ff]/30 border-[#4df0ff] text-[#4df0ff]' : 'border-[#4df0ff]/20 text-[#4df0ff]/40 hover:text-[#4df0ff]'"
              @click="form.userGender = 'MALE'"
            >
              男
            </button>
            <button
              class="px-4 py-1 text-sm rounded border transition-all"
              :class="form.userGender === 'FEMALE' ? 'bg-[#ff70a6]/30 border-[#ff70a6] text-[#ff70a6]' : 'border-[#ff70a6]/20 text-[#ff70a6]/40 hover:text-[#ff70a6]'"
              @click="form.userGender = 'FEMALE'"
            >
              女
            </button>
            <button
              class="px-4 py-1 text-sm rounded border transition-all"
              :class="form.userGender === 'OTHER' ? 'bg-[#4df0ff]/20 border-[#4df0ff] text-[#4df0ff]' : 'border-[#4df0ff]/20 text-[#4df0ff]/40 hover:text-[#4df0ff]'"
              @click="form.userGender = 'OTHER'"
            >
              保密
            </button>
          </div>
        </div>

        <div>
          <HoloInput v-model="form.userIntroduction" label="INTRO / 个人简介" placeholder="介绍一下自己吧..." />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <HoloInput v-model="form.userCity" label="CITY / 城市" placeholder="居住城市" />
          <HoloInput v-model="form.userBirthday" label="BIRTHDAY / 生日" placeholder="YYYY-MM-DD" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <HoloInput v-model="form.userMail" label="EMAIL / 邮箱" placeholder="your@email.com" />
          <HoloInput v-model="form.userPhone" label="PHONE / 电话" placeholder="手机号" />
        </div>

        <HoloInput v-model="form.userQQ" label="QQ / QQ号" placeholder="QQ号" />

        <div v-if="errors.length > 0" class="space-y-1">
          <div v-for="(err, idx) in errors" :key="idx" class="text-[#ff4d4d] text-xs flex items-center gap-1">
            <span class="inline-block w-1 h-1 rounded-full bg-[#ff4d4d]" />
            {{ err }}
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            class="flex-1 py-2 text-sm font-medium rounded border border-[#4df0ff] text-[#4df0ff] hover:bg-[#4df0ff] hover:text-black transition-all"
            @click="save"
            :disabled="saving"
          >
            {{ saving ? '保存中...' : '保存修改' }}
          </button>
          <button
            class="flex-1 py-2 text-sm font-medium rounded border border-[#4df0ff]/30 text-[#4df0ff]/60 hover:text-[#4df0ff] transition-all"
            @click="reset"
          >
            重置
          </button>
        </div>

      </div>
    </HoloPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { api } from '@/api';
import type { UserDetailDTO } from '@/api/types';
import { useUserStore } from '@/store/userStore';
import { useModal } from '@/composables/useModal';
import HoloPanel from '@/components/holo/HoloPanel.vue';
import HoloBorder from '@/components/holo/HoloBorder.vue';
import HoloText from '@/components/holo/HoloText.vue';
import HoloInput from '@/components/holo/HoloInput.vue';
import UserAvatar from '@/components/UserAvatar.vue';

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const userStore = useUserStore();

interface EditForm {
  userName: string;
  userIntroduction: string;
  userCity: string;
  userGender: string;
  userPhone: string;
  userQQ: string;
  userMail: string;
  userBirthday: string;
}

const form = reactive<EditForm>({
  userName: '',
  userIntroduction: '',
  userCity: '',
  userGender: 'OTHER',
  userPhone: '',
  userQQ: '',
  userMail: '',
  userBirthday: '',
});

const errors = ref<string[]>([]);
const saving = ref(false);
const avatar = ref<string | null>(null);

function initForm() {
  const info = userStore.userInfo;
  if (info) {
    form.userName = info.userName || '';
    form.userIntroduction = info.userIntroduction || '';
    form.userCity = info.userCity || '';
    form.userGender = info.userGender || 'OTHER';
    form.userPhone = info.userPhone || '';
    form.userQQ = info.userQQ || '';
    form.userMail = info.userMail || '';
    form.userBirthday = info.userBirthday || '';
    avatar.value = info.userAvatar || '';
  }
}

function validate(): boolean {
  errors.value = [];
  if (!form.userName.trim()) {
    errors.value.push('用户名不能为空');
  }
  if (form.userMail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.userMail)) {
    errors.value.push('邮箱格式不正确');
  }
  if (form.userPhone && !/^1\d{10}$/.test(form.userPhone)) {
    errors.value.push('手机号格式不正确');
  }
  if (form.userBirthday && !/^\d{4}-\d{2}-\d{2}$/.test(form.userBirthday)) {
    errors.value.push('生日格式应为 YYYY-MM-DD');
  }
  if (form.userQQ && !/^\d{5,12}$/.test(form.userQQ)) {
    errors.value.push('QQ号格式不正确');
  }
  return errors.value.length === 0;
}

async function save() {
  if (!validate()) return;
  saving.value = true;
  try {
    const payload: Partial<UserDetailDTO> = {
      userName: form.userName.trim(),
      userIntroduction: form.userIntroduction,
      userCity: form.userCity,
      userGender: form.userGender,
      userPhone: form.userPhone,
      userQQ: form.userQQ,
      userMail: form.userMail,
      userBirthday: form.userBirthday,
    };
    await api.user.updateDetail(payload);
    await userStore.loadSelfUserInfo();
    emit('success');
    emit('close');
  } catch (error) {
    console.error('[UserEditDialog] Save failed:', error);
  } finally {
    saving.value = false;
  }
}

function reset() {
  initForm();
  errors.value = [];
}

async function handleAvatarUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];
  if (!file.type.startsWith('image/')) {
    return;
  }
  const formData = new FormData();
  formData.append('avatar', file);
  try {
    await api.user.updateAvatar(formData);
    await userStore.loadSelfUserInfo();
    avatar.value = userStore.userInfo?.userAvatar || '';
  } catch (error) {
    console.error('[UserEditDialog] Avatar upload failed:', error);
  }
  target.value = '';
}

initForm();
</script>
