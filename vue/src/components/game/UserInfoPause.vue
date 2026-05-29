<template>
  <div v-if="!userInfo" class="relative w-[90vw] max-w-400 h-auto min-h-125 flex items-center justify-center bg-transparent text-white font-(--font-cuxi) p-5 box-border">
    <div class="w-6 h-6 border-2 border-transparent border-t-[rgba(77,240,255,0.8)] rounded-full animate-spin" />
  </div>
  <div v-else class="relative w-[90vw] max-w-400 h-auto min-h-125 flex flex-col bg-transparent text-white font-(--font-cuxi) p-5 box-border">
    <div class="flex items-center mb-2">
      <div class="flex items-center gap-4">
        <div class="w-20 h-20 shrink-0">
          <UserAvatar
            :user-id="displayUserId"
            :avatar-url="userInfo.userAvatar"
            :username="userInfo.userName"
            size="lg"
            class="w-full h-full"
          />
        </div>
        <div class="flex flex-col gap-1">
          <h2 class="text-[22px] font-semibold m-0 text-white">{{ userInfo.userName }}</h2>
          <span class="text-[13px] text-[rgba(77,240,255,0.8)]" v-if="userInfo.userGender">
            {{ userInfo.userGender }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-4 ml-auto">
        <div class="relative w-12.5 h-12.5 cursor-pointer hover:opacity-70 transition-opacity duration-200" :class="{ 'pointer-events-none opacity-50': !isSelf }" @click="handleStatClick('follower')">
          <img src="@/assets/ui_button/follower.png" alt="粉丝" class="w-full h-full object-contain" />
          <span class="absolute -bottom-1 -right-1 text-[11px] font-semibold text-white font-mono bg-black/60 px-1 rounded">{{ userInfo.followerCount || 0 }}</span>
        </div>
        <div class="relative w-12.5 h-12.5 cursor-pointer hover:opacity-70 transition-opacity duration-200" :class="{ 'pointer-events-none opacity-50': !isSelf }" @click="handleStatClick('followee')">
          <img src="@/assets/ui_button/followee.png" alt="关注" class="w-full h-full object-contain" />
          <span class="absolute -bottom-1 -right-1 text-[11px] font-semibold text-white font-mono bg-black/60 px-1 rounded">{{ userInfo.followeeCount || 0 }}</span>
        </div>
      </div>
    </div>

    <div class="mb-4 py-2">
      <p class="text-[13px] leading-relaxed text-white/60 m-0">{{ userInfo.userIntroduction || '这家伙很懒，什么都没留下...' }}</p>
    </div>

    <div class="flex gap-5 flex-1 min-h-0">
      <div class="flex-1 flex flex-col gap-3 min-w-0">
        <div class="slot-container flex-1 min-h-45 overflow-visible flex items-center justify-center">
          <slot name="content">
            <div class="text-white/30 text-[14px]">
            </div>
          </slot>
        </div>
        <div class="flex justify-start" v-if="!isSelf">
          <button class="px-4.5 py-1.5 rounded-3xl text-[13px] font-medium tracking-[0.5px] border-none cursor-pointer transition-all duration-200 ease-in-out bg-[rgba(77,240,255,0.9)] text-black hover:opacity-85" :class="{ 'bg-transparent text-[rgba(77,240,255,0.8)] border border-[rgba(77,240,255,0.4)]': userInfo.isFollowing }" @click="handleFollow">
            {{ userInfo.isFollowing ? '已关注' : '+ 关注' }}
          </button>
        </div>
      </div>

      <div class="w-50 shrink-0 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-1.5 mb-6" v-if="isSelf && coinCount !== null">
            <img src="@/assets/icons/coin.svg" alt="金币" class="w-5 h-5" />
            <span class="text-[16px] font-semibold text-[#ffd700] font-mono">{{ coinCount }}</span>
            <button class="ml-auto px-3.5 py-1 rounded-[20px] text-[12px] font-medium border-none cursor-pointer transition-all duration-200 ease-in-out bg-[rgba(77,240,255,0.9)] text-black hover:opacity-85" @click="handleSignIn">
              签到
            </button>
          </div>

          <div class="flex flex-col gap-2.5 relative">
            <div class="flex items-center justify-between">
              <h4 class="text-[13px] font-semibold text-[rgba(77,240,255,0.8)] m-0">用户详情</h4>
              <button v-if="isSelf" class="w-5 h-5 cursor-pointer opacity-60 hover:opacity-100 transition-opacity duration-200" @click="openEditDialog">
                <img src="@/assets/icons/edit.svg" alt="编辑" class="w-full h-full" />
              </button>
            </div>
          <div class="flex flex-col gap-0.5" v-if="userInfo.userCity">
            <span class="text-[11px] text-[rgba(77,240,255,0.6)]">城市</span>
            <span class="text-[13px] text-white/85 break-all">{{ userInfo.userCity }}</span>
          </div>
          <div class="flex flex-col gap-0.5" v-if="userInfo.userBirthday">
            <span class="text-[11px] text-[rgba(77,240,255,0.6)]">生日</span>
            <span class="text-[13px] text-white/85 break-all">{{ userInfo.userBirthday }}</span>
          </div>
          <div class="flex flex-col gap-0.5" v-if="userInfo.userMail">
            <span class="text-[11px] text-[rgba(77,240,255,0.6)]">邮箱</span>
            <span class="text-[13px] text-white/85 break-all">{{ userInfo.userMail }}</span>
          </div>
          <div class="flex flex-col gap-0.5" v-if="userInfo.userPhone">
            <span class="text-[11px] text-[rgba(77,240,255,0.6)]">电话</span>
            <span class="text-[13px] text-white/85 break-all">{{ userInfo.userPhone }}</span>
          </div>
          <div class="flex flex-col gap-0.5" v-if="userInfo.userQQ">
            <span class="text-[11px] text-[rgba(77,240,255,0.6)]">QQ</span>
            <span class="text-[13px] text-white/85 break-all">{{ userInfo.userQQ }}</span>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { api } from '@/api';
import { useUserStore } from '@/store/userStore';
import { useModal } from '@/composables/useModal';
import type { UserDetailDTO } from '@/api/types';
import UserAvatar from '@/components/UserAvatar.vue';
import FollowListDialog from '@/components/game/FollowListDialog.vue';
import UserEditDialog from '@/components/game/UserEditDialog.vue';
import SignInDialog from '@/components/game/SignInDialog.vue';

const props = defineProps<{
  userId?: number | string;
}>();

const userStore = useUserStore();
const { addModal } = useModal();
const userInfo = ref<UserDetailDTO | null>(null);
const coinCount = ref<number | null>(null);

const isSelf = computed(() => {
  if (!props.userId) return true;
  return String(props.userId) === userStore.userId;
});

const displayUserId = computed(() => {
  return isSelf.value ? Number(userStore.userId) : Number(props.userId);
});

const loadUserInfo = async () => {
  try {
    if (isSelf.value) {
      if (!userStore.userInfo) {
        await userStore.loadSelfUserInfo();
      }
      userInfo.value = userStore.userInfo;
      coinCount.value = await api.coin.get();
    } else {
      userInfo.value = await api.user.getDetail('PUBLIC', Number(props.userId));
      userInfo.value.userName = await api.user.getDetail("NAME",Number(props.userId)).then(res => res.userName);
      const followStatus = await api.user.getDetail("FOLLOW",Number(props.userId));
      userInfo.value.isFollowing = followStatus.isFollowing;
      userInfo.value.followerCount = followStatus.followerCount;
      userInfo.value.followeeCount = followStatus.followeeCount;
    }
  } catch (error) {
    console.error('[UserInfoPause] Failed to load user info:', error);
  }
};

function openFollowDialog(tab: 'follower' | 'followee') {
  addModal({
    type: 'function',
    component: FollowListDialog,
    props: {
      userId: displayUserId.value,
      followerCount: userInfo.value?.followerCount || 0,
      followeeCount: userInfo.value?.followeeCount || 0,
      userName: userInfo.value?.userName || '',
      initialTab: tab,
    },
    onClosed: () => {
      loadUserInfo();
    },
  });
}

function handleStatClick(tab: 'follower' | 'followee') {
  if (!isSelf.value) return;
  openFollowDialog(tab);
}

async function handleFollow() {
  try {
    await api.user.follow(Number(props.userId));
    if (userInfo.value) {
      userInfo.value.isFollowing = !userInfo.value.isFollowing;
    }
  } catch (error) {
    console.error('[UserInfoPause] Follow failed:', error);
  }
}

function openEditDialog() {
  addModal({
    type: 'function',
    component: UserEditDialog,
    props: {},
    onClosed: () => {
      loadUserInfo();
    },
  });
}

function handleSignIn() {
  addModal({
    type: 'function',
    component: SignInDialog,
    props: {},
    closable: true,
    onClosed: async () => {
      coinCount.value = await api.coin.get();
    },
  });
}

watch(() => props.userId, () => {
  userInfo.value = null;
  coinCount.value = null;
  loadUserInfo();
}, { immediate: true });
</script>
