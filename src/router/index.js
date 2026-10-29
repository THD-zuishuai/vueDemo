import { createRouter, createWebHashHistory } from 'vue-router'

import Home from '../views/HomeView.vue'
import Games from '../views/Games.vue'
import Detail from '../views/Detail.vue'
import Categories from '../views/Categories.vue'
import Guides from '../views/Guides.vue'
import GuideDetail from '../views/GuideDetail.vue'
import Favorites from '../views/Favorites.vue'

const routes = [
  {
    path: '/',
    component: Home
  },
  { path: '/games', component: Games },
  { path: '/categories', component: Categories },
  { path: '/games/:slug', component: Detail },
  { path: '/guides', component: Guides },
  { path: '/guides/:slug', component: GuideDetail },
  { path: '/favorites', component: Favorites },
  ...(import.meta.env.DEV ? [{ path: '/__content-editor', component: () => import('../views/GameResourceEditor.vue') }] : []),
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  // 自动跟随 vite.config.js 的 base（本地/腾讯云为 '/'，GitHub Pages 为 '/vueDemo/'）
  // Hash 路由让详情页在 GitHub Pages 等无 history fallback 的静态托管上刷新可用。
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
