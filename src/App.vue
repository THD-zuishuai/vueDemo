<template>
  <div class="site-shell">
    <header class="topbar"><div class="nav-wrap">
      <RouterLink to="/" class="brand"><span class="brand-mark">{{ data.site.logoText }}</span><span><b>{{ data.site.name }}</b><small>{{ data.site.nameEn }}</small></span></RouterLink>
      <button class="menu-toggle" @click="menuOpen = !menuOpen" aria-label="切换导航">☰</button>
      <nav :class="{ open: menuOpen }"><RouterLink v-for="item in data.navigation" :key="item.path" :to="item.path" @click="menuOpen = false">{{ item.label }}</RouterLink></nav>
      <div class="nav-actions"><RouterLink class="favorite-link" to="/favorites">♡ <span>我的收藏</span><i>{{ favorites.length }}</i></RouterLink></div>
    </div></header>
    <main><RouterView /></main>
    <footer class="footer"><div class="footer-inner"><div class="brand footer-brand"><span class="brand-mark">{{ data.site.logoText }}</span><span><b>{{ data.site.name }}</b><small>{{ data.site.nameEn }}</small></span></div><p>{{ data.site.footerText }}</p><div class="footer-links"><RouterLink to="/games">发现游戏</RouterLink><RouterLink to="/guides">攻略指南</RouterLink><RouterLink to="/favorites">我的收藏</RouterLink></div><small>{{ data.site.disclaimer }}</small></div></footer>
  </div>
</template>
<script setup>
import { ref, provide } from 'vue'
import data from './data/site-content.json'
const menuOpen = ref(false)
const favorites = ref(JSON.parse(localStorage.getItem('fgd-favorites') || '[]'))
function toggleFavorite(id) { favorites.value = favorites.value.includes(id) ? favorites.value.filter(x => x !== id) : [...favorites.value, id]; localStorage.setItem('fgd-favorites', JSON.stringify(favorites.value)) }
provide('siteData', data); provide('favorites', favorites); provide('toggleFavorite', toggleFavorite)
</script>
