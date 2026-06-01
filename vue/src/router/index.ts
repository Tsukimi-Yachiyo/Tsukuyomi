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
      component: () => import('@/page/PostViewPage.vue'),
    },
    {
      path: '/post/new',
      name: 'PostEditor',
      component: () => import('@/page/PostEditorPage.vue'),
    },
    {
      path: '/post/edit/:id',
      name: 'PostEditorEdit',
      component: () => import('@/page/PostEditorPage.vue'),
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
      path: '/user/:id',
      name: 'User',
      component: () => import('@/page/UserPage.vue'),
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('@/page/AboutPage.vue'),
    },
    {
      path: '/agreement',
      name: 'Agreement',
      component: () => import('@/page/AgreementPage.vue'),
    },
    {
      path: '/column/view',
      name: 'ColumnView',
      component: () => import('@/page/ColumnViewPage.vue'),
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('@/page/HistoryPage.vue'),
    },
  ],
});

export default router;
