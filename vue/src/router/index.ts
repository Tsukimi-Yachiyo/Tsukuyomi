import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
      {
        path: '/',
        redirect: '/game',
      },
    {
      path: '/game',
      name: 'Game',
      component: () => import('@/page/GamePage.vue'),
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

export default router;
