import { ref, onUnmounted } from 'vue';

export function useCountdown(initialSeconds = 60) {
  const countdown = ref(0);
  let timer: number | null = null;

  const start = () => {
    countdown.value = initialSeconds;
    
    timer = window.setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0 && timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  };

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    countdown.value = 0;
  };

  const isActive = () => countdown.value > 0;

  onUnmounted(() => {
    stop();
  });

  return {
    countdown,
    start,
    stop,
    isActive
  };
}
