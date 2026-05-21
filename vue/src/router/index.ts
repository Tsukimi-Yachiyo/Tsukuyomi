import { createRouter, createWebHashHistory } from 'vue-router';
import { useStore } from '@/store/userStore';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/components/SystemBoot.vue'),
    },
    {
      path: '/post/:id',
      name: 'Post',
      component: () => import('@/page/PostPage.vue'),
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/page/AdminPage.vue'),
    },
    {
      path: '/maintenance',
      name: 'Maintenance',
      component: () => import('@/page/MaintenancePage.vue'),
    },
    {
      path: '/test',
      name: 'Test',
      component: () => import('@/page/TestPage.vue'),
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('@/page/AboutPage.vue'),
    },
  ],
});

const authRoutes = ['Post', 'Admin'];

router.beforeEach((to) => {
  if (authRoutes.includes(to.name as string)) {
    const userStore = useStore();
    if (!userStore.isLoggedIn) {
      return { name: 'Home' };
    }
  }
});

export default router;
