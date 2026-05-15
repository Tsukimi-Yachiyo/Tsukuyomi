import { api } from '@/api';

export const updateProgress = (percent: number) => {
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }
};

export const hideSplashScreen = () => {
  const splashScreen = document.getElementById('splash-screen');
  if (splashScreen) {
    splashScreen.classList.add('hidden');
    setTimeout(() => splashScreen.remove(), 800);
  }
};

const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
};

export const preloadResources = async () => {
  const modules = import.meta.glob('../assets/**/*.{png,jpg,jpeg,gif,svg,webp,mp4}', { eager: true });
  const resourceList = Object.values(modules);
  const totalResources = resourceList.length;
  let loadedCount = 0;

  if (totalResources === 0) return;

  const loadPromises = resourceList.map(async (resource: any) => {
    const url = typeof resource === 'string' ? resource : resource?.default;
    if (typeof url === 'string') {
      await preloadImage(url);
    }
    loadedCount++;
    const progress = Math.floor((loadedCount / totalResources) * 80);
    updateProgress(progress);
  });

  await Promise.all(loadPromises);
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    await api.system.hello();
    return true;
  } catch (error) {
    console.error('[System] Backend is down during bootstrap.', error);
    return false;
  }
};