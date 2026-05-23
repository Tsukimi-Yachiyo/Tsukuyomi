<template>
  <div class="user-profile-container" v-if="userInfo">

    <div class="profile-left">
      <div class="user-identity">
        <UserAvatar
            :user-id="displayUserId"
            :avatar-url="userInfo.userAvatar"
            :username="userInfo.userName"
            size=lg
            class="avatar-glow"
        />
        <div class="name-info">
          <h2 class="username">{{ userInfo.userName }}</h2>
          <span class="gender" v-if="userInfo.userGender">
            {{ userInfo.userGender === 'MALE' ? '♂' : (userInfo.userGender === 'FEMALE' ? '♀' : '⚧') }}
          </span>
        </div>
      </div>

      <div class="info-box bio-box">
        <h3 class="box-title">个人简介</h3>
        <p class="bio-text">{{ userInfo.userIntroduction || '这家伙很懒，什么都没留下...' }}</p>
      </div>

      <div class="action-buttons">
        <template v-if="!isSelf">
          <button class="btn follow-btn" :class="{ 'is-followed': userInfo.isFollowing }">
            {{ userInfo.isFollowing ? '已关注' : '+ 关注' }}
          </button>
          <button class="btn msg-btn">发消息</button>
        </template>
        <template v-else>
          <button class="btn edit-btn">编辑用户详情</button>
        </template>
      </div>
    </div>

    <div class="profile-right">
      <div class="info-box stats-box">
        <div class="stat-item">
          <span class="stat-val">{{ userInfo.followeeCount || 0 }}</span>
          <span class="stat-label">关注</span>
        </div>
        <div class="stat-item">
          <span class="stat-val">{{ userInfo.followerCount || 0 }}</span>
          <span class="stat-label">粉丝</span>
        </div>
        <div class="stat-item" v-if="isSelf && coinCount !== null">
          <span class="stat-val">{{ coinCount }}</span>
          <span class="stat-label">金币</span>
        </div>
      </div>

      <div class="info-box attributes-box">
        <h3 class="box-title">详细资料</h3>
        <div class="details-grid">
          <div class="detail-item" v-if="userInfo.userCity">
            <span class="label">城市</span>
            <span class="val">{{ userInfo.userCity }}</span>
          </div>
          <div class="detail-item" v-if="userInfo.userBirthday">
            <span class="label">生日</span>
            <span class="val">{{ userInfo.userBirthday }}</span>
          </div>
          <div class="detail-item" v-if="userInfo.userMail">
            <span class="label">邮箱</span>
            <span class="val">{{ userInfo.userMail }}</span>
          </div>
          <div class="detail-item" v-if="userInfo.userPhone">
            <span class="label">电话</span>
            <span class="val">{{ userInfo.userPhone }}</span>
          </div>
          <div class="detail-item" v-if="userInfo.userQQ">
            <span class="label">QQ</span>
            <span class="val">{{ userInfo.userQQ }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div class="user-profile-container loading-container" v-else>
    <div class="loading-text">系统数据读取中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { api } from '@/api';
import { useUserStore } from '@/store/userStore';
import type { UserDetailDTO } from '@/api/types';
import UserAvatar from '@/components/UserAvatar.vue';

const props = defineProps<{
  userId?: number | string;
}>();

const userStore = useUserStore();

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
      userInfo.value = await api.user.getDetail('FULL', Number(props.userId));
    }
  } catch (error) {
    console.error('[UserInfoPause] Failed to load user info:', error);
  }
};

watch(() => props.userId, () => {
  userInfo.value = null;
  coinCount.value = null;
  loadUserInfo();
}, { immediate: true });
</script>

<style scoped>
/* 最外层容器：完全透明，控制左右布局 */
.user-profile-container {
  display: flex;
  gap: 40px;
  width: 100%;
  max-width: 900px;
  background: transparent; /* 背景透明 */
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  align-items: flex-start;
}

/* ================= 左右区域分配 ================= */
.profile-left {
  flex: 4;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-right {
  flex: 6;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ================= 通用信息框样式 ================= */
/* 给里面的各个区块加上科技感十足的毛玻璃半透明框 */
.info-box {
  background: rgba(15, 20, 30, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(77, 240, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  box-shadow: inset 0 0 20px rgba(77, 240, 255, 0.05);
}

.box-title {
  font-size: 14px;
  color: rgba(77, 240, 255, 0.8);
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* ================= 左侧细节 ================= */
.user-identity {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 10px;
}

.avatar-glow {
  box-shadow: 0 0 15px rgba(77, 240, 255, 0.4);
  border-radius: 50%;
}

.name-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 26px;
  font-weight: bold;
  margin: 0;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.gender {
  font-size: 18px;
  color: #4df0ff;
}

.bio-box {
  flex-grow: 1; /* 让简介框自然撑开 */
  min-height: 120px;
}

.bio-text {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

/* ================= 按钮区域 ================= */
.action-buttons {
  display: flex;
  gap: 16px;
  padding: 0 10px;
}

.btn {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
}

.follow-btn {
  background: rgba(77, 240, 255, 0.9);
  color: #000;
  border: 1px solid #4df0ff;
}

.follow-btn.is-followed {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.msg-btn, .edit-btn {
  background: rgba(0, 0, 0, 0.3);
  color: #4df0ff;
  border: 1px solid rgba(77, 240, 255, 0.5);
  backdrop-filter: blur(4px);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(77, 240, 255, 0.2);
}

.edit-btn:hover {
  background: rgba(77, 240, 255, 0.1);
}

/* ================= 右侧细节 ================= */
.stats-box {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 24px 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-val {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  font-family: monospace; /* 让数字更有科技感 */
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

/* 用户属性网格 */
.attributes-box {
  flex-grow: 1;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 8px;
}

.detail-item .label {
  font-size: 12px;
  color: rgba(77, 240, 255, 0.6);
}

.detail-item .val {
  font-size: 14px;
  color: #fff;
  word-break: break-all;
}

/* ================= 加载态 ================= */
.loading-container {
  min-height: 300px;
  align-items: center;
  justify-content: center;
}

.loading-text {
  color: #4df0ff;
  font-size: 16px;
  letter-spacing: 2px;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; text-shadow: 0 0 0 transparent; }
  50% { opacity: 1; text-shadow: 0 0 10px #4df0ff; }
}
</style>