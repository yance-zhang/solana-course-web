import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    { path: '/', component: 'index' },
    { path: '/course/:id', component: 'course/detail.tsx' },
  ],
  npmClient: 'yarn',
  tailwindcss: {},
  plugins: [
    '@umijs/plugins/dist/tailwindcss',
    '@umijs/plugins/dist/dva',
    '@umijs/plugins/dist/antd',
  ],
  dva: {},
  antd: {},
});
