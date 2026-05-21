import { api } from '@/api';

const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
};

const preloadVideo = async (src: string): Promise<void> => {
  try {
    await fetch(src);
  } catch {
    // 静默失败，不阻塞启动流程
  }
};

export const preloadResources = async () => {
  const imageModules = import.meta.glob('../assets/**/*.{png,jpg,jpeg,gif,svg,webp}', { eager: true });
  const videoModules = import.meta.glob('../assets/**/*.mp4', { eager: true });

  const imageUrls = Object.values(imageModules)
    .map((r: any) => typeof r === 'string' ? r : r?.default)
    .filter((u): u is string => typeof u === 'string');

  const videoUrls = Object.values(videoModules)
    .map((r: any) => typeof r === 'string' ? r : r?.default)
    .filter((u): u is string => typeof u === 'string');

  await Promise.all([
    ...imageUrls.map(preloadImage),
    ...videoUrls.map(preloadVideo),
  ]);
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