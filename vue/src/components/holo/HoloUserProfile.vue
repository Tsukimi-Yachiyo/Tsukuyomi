<template>
  <div class="relative w-[340px] mx-auto" :style="wrapperStyle">
    <HoloPanel :is-open="true" :theme-color="themeColor" :glow-opacity="glowOpacity">
      <div class="relative z-[1] flex flex-col gap-3 p-4">
        <!-- Avatar + Name -->
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 flex-shrink-0">
            <HoloAvatar :src="userInfo?.userAvatar || ''" loop />
          </div>
          <div class="flex flex-col gap-0.5 min-w-0">
            <HoloText
              :text="userInfo?.userName || 'Unknown'"
              size="16px"
              weight="600"
            />
            <HoloText
              v-if="userInfo?.userGender"
              :text="userInfo.userGender"
              size="11px"
              secondary
            />
            <HoloText
              v-if="userInfo?.userCity"
              :text="userInfo.userCity"
              size="11px"
              secondary
            />
          </div>
        </div>

        <!-- Introduction -->
        <div class="pt-1 border-t border-t-[rgba(255,255,255,0.06)]">
          <HoloText
            :text="userInfo?.userIntroduction || '这家伙很懒，什么都没留下...'"
            size="12px"
            secondary
          />
        </div>

        <!-- Stats: Follower + Followee -->
        <div class="flex items-center justify-center gap-6 py-1">
          <div class="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity duration-200" @click="emit('stat-click', 'follower')">
            <span class="text-[18px] font-semibold font-mono" style="color: var(--theme-color)">{{ userInfo?.followerCount || 0 }}</span>
            <span class="text-[10px] text-white/50 tracking-[1px]">粉丝</span>
          </div>
          <div class="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity duration-200" @click="emit('stat-click', 'followee')">
            <span class="text-[18px] font-semibold font-mono" style="color: var(--theme-color)">{{ userInfo?.followeeCount || 0 }}</span>
            <span class="text-[10px] text-white/50 tracking-[1px]">关注</span>
          </div>
        </div>

        <!-- Follow Button -->
        <button
          v-if="!isSelf"
          class="w-full py-2 rounded-[20px] text-[13px] font-semibold tracking-[1px] border-none cursor-pointer transition-all duration-200 ease-in-out"
          :style="followBtnStyle"
          @click="handleFollow"
        >
          {{ isFollowing ? '已关注' : '+ 关注' }}
        </button>

        <!-- Self indicator -->
        <div v-else class="w-full py-2 text-center text-[12px] tracking-[2px]" style="color: var(--theme-color); text-shadow: 0 0 6px var(--theme-color-glow)">
          这是你自己哦
        </div>
      </div>

      <!-- L 型角标装饰（不要边框线条） -->
      <HoloBorder
        :layers="cornerOnlyLayers"
        :corners="['tl', 'tr', 'bl', 'br']"
        :corner-size="50"
        :show-notches="false"
      />
    </HoloPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { api } from '@/api';
import { useUserStore } from '@/store/userStore';
import type { UserDetailDTO } from '@/api/types';
import HoloAvatar from './HoloAvatar.vue';
import HoloText from './HoloText.vue';
import HoloPanel from './HoloPanel.vue';
import HoloBorder from './HoloBorder.vue';

interface Props {
  userId?: number | string;
  userInfo?: UserDetailDTO;
  themeColor?: string;
  glowOpacity?: number;
  isSelf?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  themeColor: '#4df0ff',
  glowOpacity: 0.6,
});

const emit = defineEmits<{
  'stat-click': [tab: 'follower' | 'followee'];
  'follow-success': [];
}>();

const userStore = useUserStore();
const userInfo = ref<UserDetailDTO | null>(null);
const isFollowing = ref(false);
const followLoading = ref(false);

computed(() => {
  return props.isSelf ? Number(userStore.userId) : Number(props.userId);
});

const cornerOnlyLayers = [
  { inset: 0, borderWidth: 0, cornerOffset: 0, cornerStrokeWidth: 3, opacity: 0.7 },
  { inset: 0, borderWidth: 0, cornerOffset: 6, cornerStrokeWidth: 1.5, opacity: 0.35 }
];

const wrapperStyle = computed(() => {
  const rgbStr = hexToRgb(props.themeColor);
  return {
    '--theme-color': props.themeColor,
    '--theme-color-glow': `rgba(${rgbStr}, ${props.glowOpacity})`,
    '--theme-color-rgb': rgbStr,
  };
});

const followBtnStyle = computed(() => {
  if (isFollowing.value) {
    return {
      background: 'transparent',
      color: 'rgba(77, 240, 255, 0.8)',
      border: '1px solid rgba(77, 240, 255, 0.4)',
    };
  }
  return {
    background: 'rgba(77, 240, 255, 0.9)',
    color: '#000',
  };
});

const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '77, 240, 255';
};

const loadUserInfo = async () => {
  try {
    if (props.isSelf) {
      if (!userStore.userInfo) {
        await userStore.loadSelfUserInfo();
      }
      userInfo.value = userStore.userInfo;
    } else {
      if (!props.userInfo) {
        userInfo.value = await api.user.getDetail('POSTER', Number(props.userId));
      } else {
        userInfo.value = props.userInfo;
      }
      const followMessage: UserDetailDTO = await api.user.getDetail('FOLLOW', Number(props.userId));
      const publicMessage: UserDetailDTO = await api.user.getDetail('PUBLIC', Number(props.userId));
      userInfo.value.userGender = publicMessage.userGender;
      userInfo.value.userCity = publicMessage.userCity;
      userInfo.value.userIntroduction = publicMessage.userIntroduction;
      userInfo.value.followeeCount = followMessage.followeeCount;
      userInfo.value.followerCount = followMessage.followerCount;
      userInfo.value.isFollowing = followMessage.isFollowing;
    }
    isFollowing.value = userInfo.value?.isFollowing || false;
  } catch (error) {
    console.error('[HoloUserProfile] Failed to load user info:', error);
  }
};

const handleFollow = async () => {
  if (followLoading.value || props.isSelf) return;
  followLoading.value = true;
  try {
    await api.user.follow(Number(props.userId));
    isFollowing.value = !isFollowing.value;
    emit('follow-success');
  } catch (error) {
    console.error('[HoloUserProfile] Follow failed:', error);
  } finally {
    followLoading.value = false;
  }
};

watch(() => props.userId, () => {
  userInfo.value = null;
  isFollowing.value = false;
  loadUserInfo();
}, { immediate: true });
</script>
