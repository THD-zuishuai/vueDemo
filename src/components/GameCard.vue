<template><article class="game-card"><RouterLink :to="`/games/${game.slug}`" class="card-cover-link"><GameCover :src="game.cover" :alt="game.coverAlt" :title="game.title" :tone="tone" :glyph="glyph"/><span v-if="game.recommended" class="featured-pill">精选推荐</span></RouterLink><div class="game-card-body"><div class="card-meta"><span>{{ category?.name || '游戏' }}</span><span>{{ game.platforms?.[0] || '平台待补充' }}</span></div><RouterLink :to="`/games/${game.slug}`" class="card-title">{{ game.title }}</RouterLink><p>{{ game.subtitle }}</p><div class="card-bottom"><span class="safe-tag">{{ game.downloadMode === 'official_link' ? '官方获取' : game.downloadMode === 'authorized_hosted' && game.licenseStatus === 'permission_confirmed' ? '已核实授权' : '信息展示' }}</span><button class="heart" :aria-label="favorites.includes(game.id) ? '取消收藏' : '收藏'" @click="toggleFavorite(game.id)">{{ favorites.includes(game.id) ? '♥' : '♡' }}</button></div></div></article></template>
<script setup>
import { computed, inject } from 'vue'
import GameCover from './GameCover.vue'
const props = defineProps({game:Object})
const data = inject('siteData'), favorites = inject('favorites'), toggleFavorite = inject('toggleFavorite')
const category = computed(() => data.categories.find(c => props.game.categoryIds?.includes(c.id)))
const tone = computed(() => category.value?.color || 'blue'), glyph = computed(() => category.value?.icon || '✦')
</script>
