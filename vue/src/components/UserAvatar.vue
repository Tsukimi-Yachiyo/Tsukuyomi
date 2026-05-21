<template>
  <div
    class="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-cyan-400/15"
    :class="[sizeClass, clickable ? 'cursor-pointer hover:ring-2 hover:ring-cyan-400/40 transition-all' : '']"
    @click="handleClick"
  >
    <img
      v-if="avatarUrl && !imgError"
      :src="avatarUrl"
      :alt="username || '用户头像'"
      class="w-full h-full object-cover"
      loading="lazy"
      @error="imgError = true"
    />
    <span v-else class="text-cyan-400 font-semibold select-none" :class="textSizeClass">
      {{ placeholder }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const props = withDefaults(defineProps<{
  userId: number;
  avatarUrl?: string;
  username?: string;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
}>(), {
  avatarUrl: '',
  username: '',
  size: 'md',
  clickable: true,
});

const router = useRouter();
const imgError = ref(false);

const sizeClass = computed(() => ({
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
}[props.size]));

const textSizeClass = computed(() => ({
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
}[props.size]));

const placeholder = computed(() =>
  props.username ? props.username.charAt(0).toUpperCase() : 'U'
);

function handleClick() {
  if (props.clickable && props.userId) {
    router.push(`/user-profile/${props.userId}`);
  }
}
</script>
