<template>
  <div class="relative w-[90vw] max-w-md flex flex-col bg-gradient-to-b from-[rgba(30,40,80,0.95)] to-[rgba(20,30,60,0.95)] rounded-2xl border border-[rgba(77,240,255,0.3)] shadow-[0_0_30px_rgba(77,240,255,0.15)] backdrop-blur-md text-white p-6 font-(--font-cuxi)">
    <h3 class="text-[20px] font-semibold text-center mb-6 text-[rgba(77,240,255,0.9)]">
      今日签到
    </h3>

    <div class="flex flex-col gap-5">
      <div>
        <label class="block text-[13px] text-[rgba(77,240,255,0.7)] mb-2">
          今天的心情如何？
        </label>
        <div class="flex gap-3 justify-center">
          <button
            v-for="mood in moods"
            :key="mood.value"
            class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer min-w-[60px]"
            :class="selectedMood === mood.value ? 'border-[rgba(77,240,255,0.8)] bg-[rgba(77,240,255,0.15)]' : 'border-[rgba(255,255,255,0.2)] bg-transparent hover:border-[rgba(77,240,255,0.5)]'"
            @click="selectedMood = mood.value"
            type="button"
          >
            <div class="w-10 h-10" v-html="mood.icon"></div>
            <span class="text-[11px] text-white/70">{{ mood.label }}</span>
          </button>
        </div>
      </div>

      <div>
        <label class="block text-[13px] text-[rgba(77,240,255,0.7)] mb-2">
          想说点什么？
        </label>
        <textarea
          v-model="inputContent"
          class="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] text-white text-[14px] placeholder-white/30 focus:outline-none focus:border-[rgba(77,240,255,0.6)] focus:bg-[rgba(255,255,255,0.08)] transition-all duration-200 resize-none"
          placeholder="记录下今天的想法..."
          rows="3"
          maxlength="200"
        ></textarea>
        <div class="text-[11px] text-white/40 text-right mt-1.5">
          {{ inputContent.length }}/200
        </div>
      </div>

      <button
        class="w-full py-3 rounded-xl text-[15px] font-semibold transition-all duration-200 border-none cursor-pointer bg-[rgba(77,240,255,0.9)] text-black hover:bg-[rgba(77,240,255,1)] hover:shadow-[0_0_20px_rgba(77,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
        :disabled="isLoading || hasSignedIn"
        @click="handleSignIn"
        type="button"
      >
        <span v-if="isLoading">签到中...</span>
        <span v-else-if="hasSignedIn">今日已签到</span>
        <span v-else>签到</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api';

interface MoodOption {
  value: string;
  label: string;
  icon: string;
}

const moods: MoodOption[] = [
  {
    value: 'happy',
    label: '开心',
    icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="rgba(77,240,255,0.8)" stroke-width="1.5" fill="rgba(77,240,255,0.1)"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="rgba(77,240,255,0.8)" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="9" x2="9.01" y2="9" stroke="rgba(77,240,255,0.8)" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="9" x2="15.01" y2="9" stroke="rgba(77,240,255,0.8)" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  {
    value: 'calm',
    label: '平静',
    icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" fill="rgba(255,255,255,0.05)"/><line x1="8" y1="14" x2="16" y2="14" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="9" x2="9.01" y2="9" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="9" x2="15.01" y2="9" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  {
    value: 'sad',
    label: '难过',
    icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="rgba(150,150,200,0.6)" stroke-width="1.5" fill="rgba(150,150,200,0.05)"/><path d="M8 16s1.5-2 4-2 4 2 4 2" stroke="rgba(150,150,200,0.6)" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="9" x2="9.01" y2="9" stroke="rgba(150,150,200,0.6)" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="9" x2="15.01" y2="9" stroke="rgba(150,150,200,0.6)" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  {
    value: 'excited',
    label: '兴奋',
    icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="rgba(255,200,50,0.8)" stroke-width="1.5" fill="rgba(255,200,50,0.1)"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="rgba(255,200,50,0.8)" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="9" r="1" fill="rgba(255,200,50,0.8)"/><circle cx="15" cy="9" r="1" fill="rgba(255,200,50,0.8)"/><path d="M12 6v-2M18 8l1.5-1M6 8l-1.5-1" stroke="rgba(255,200,50,0.8)" stroke-width="1" stroke-linecap="round"/></svg>'
  },
  {
    value: 'tired',
    label: '疲惫',
    icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="rgba(180,180,220,0.5)" stroke-width="1.5" fill="rgba(180,180,220,0.05)"/><path d="M8 15s1.5 1 4 1 4-1 4-1" stroke="rgba(180,180,220,0.5)" stroke-width="1.5" stroke-linecap="round"/><path d="M8 10h2" stroke="rgba(180,180,220,0.5)" stroke-width="1.5" stroke-linecap="round"/><path d="M14 10h2" stroke="rgba(180,180,220,0.5)" stroke-width="1.5" stroke-linecap="round"/></svg>'
  },
];

const selectedMood = ref<string>('');
const inputContent = ref<string>('');
const isLoading = ref<boolean>(false);
const hasSignedIn = ref<boolean>(false);

const checkSignInStatus = async () => {
  try {
    hasSignedIn.value = await api.sign.getStatus();
  } catch (error) {
    console.error('[SignInDialog] Failed to check sign-in status:', error);
  }
};

const handleSignIn = async () => {
  if (isLoading.value || hasSignedIn.value) return;

  isLoading.value = true;

  try {
    await api.sign.checkIn();
    hasSignedIn.value = true;

    await new Promise(resolve => setTimeout(resolve, 1500));

    window.dispatchEvent(new CustomEvent('sign-in-success', {
      detail: {
        mood: selectedMood.value,
        content: inputContent.value,
      },
    }));
  } catch (error) {
    console.error('[SignInDialog] Sign-in failed:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  checkSignInStatus();
});
</script>
