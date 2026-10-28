import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Future from '../views/Future.vue'
import Mine from '../views/Mine.vue'
import Gameindex from '../views/Gameindex.vue'
import snake from '../views/games/snake.vue'

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/Future',
    component: Future
  },
   {
    path: '/Mine',
    component: Mine
  },
  {
    path: '/Gameindex',
    component: Gameindex
  },
 {
    path: '/snake',
    component: snake
  },
  
]

const router = createRouter({
  // 自动跟随 vite.config.js 的 base（本地/腾讯云为 '/'，GitHub Pages 为 '/vueDemo/'）
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router