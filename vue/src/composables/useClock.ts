import { ref, onMounted, onUnmounted } from 'vue';

export function useClock() {
  const currentTime = ref(new Date());
  let timer: number | null = null;

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年 ${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const formatTime = (date: Date) => {
    return date.toTimeString().split(' ')[0];
  };

  onMounted(() => {
    timer = window.setInterval(() => {
      currentTime.value = new Date();
    }, 1000);
  });

  onUnmounted(() => {
    if (timer !== null) {
      clearInterval(timer);
    }
  });

  return {
    currentTime,
    formatDate,
    formatTime
  };
}
