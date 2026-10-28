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
  history: createWebHistory('/vueDemo/'),
  routes
})

export default router