<template>
    <section class="hero">
        <div class="hero-inner">
            <div class="hero-copy"><span class="eyebrow"><i></i>{{ data.home.eyebrow }}</span>
                <h1>{{ data.home.title }}</h1>
                <p>{{ data.home.subtitle }}</p>
                <form class="search-box" @submit.prevent="search"><span>⌕</span><input v-model="query"
                        :placeholder="data.home.searchPlaceholder" /><button>搜索游戏</button></form>
                <div class="hot-words"><span>热门：</span><button v-for="word in data.home.hotKeywords" :key="word"
                        @click="goSearch(word)">{{ word }}</button></div>
            </div>
            <div class="hero-visual">
                <div class="hero-sun"></div>
                <div class="hero-cloud cloud-a"></div>
                <div class="hero-cloud cloud-b"></div>
                <div class="hero-window">
                    <GameCover :src="heroGame?.cover" :alt="heroGame?.coverAlt" :title="heroGame?.title" tone="blue" />
                    <div class="hero-caption"><span>本周人气推荐</span><b>{{ heroGame?.title }}</b></div>
                </div><span class="float-star star-a">✦</span><span class="float-star star-b">✧</span><span
                    class="float-dot"></span>
            </div>
        </div>
    </section>
    <section class="section category-section">
        <div class="section-heading">
            <div><span class="eyebrow">FIND YOUR NEXT PLAY</span>
                <h2>想玩什么类型？</h2>
            </div>
            <RouterLink to="/categories" class="text-link">全部分类 →</RouterLink>
        </div>
        <div class="category-row">
            <RouterLink v-for="cat in categories" :key="cat.id" :to="{ path: '/games', query: { category: cat.id } }"
                class="category-tile" :class="`cat-${cat.color}`"><span class="category-icon">{{ cat.icon
                    }}</span><span><b>{{ cat.name }}</b><small>{{ cat.description }}</small></span><span
                    class="tile-arrow">↗</span></RouterLink>
        </div>
    </section>
    <section class="section">
        <div class="section-heading">
            <div><span class="eyebrow">HANDPICKED FOR YOU</span>
                <h2>{{ data.home.featuredTitle }}</h2>
                <p>{{ data.home.featuredDescription }}</p>
            </div>
            <RouterLink to="/games" class="text-link">浏览全部游戏 →</RouterLink>
        </div>
        <div class="game-grid">
            <GameCard v-for="game in featured" :key="game.id" :game="game" />
        </div>
    </section>
    <section class="guide-band">
        <div class="section guide-inner">
            <div><span class="eyebrow">PLAYER'S NOTEBOOK</span>
                <h2>{{ data.home.guidesTitle }}</h2>
                <p>{{ data.home.guidesDescription }}</p>
                <RouterLink to="/guides" class="button primary">阅读全部指南 →</RouterLink>
            </div>
            <div class="guide-mini-list">
                <RouterLink v-for="guide in guides" :key="guide.id" :to="`/guides/${guide.slug}`" class="guide-mini">
                    <span class="guide-icon">✎</span><span><small>{{ guide.category }} · {{ guide.readTime
                            }}</small><b>{{ guide.title }}</b><em>{{ guide.summary }}</em></span><strong>→</strong>
                </RouterLink>
            </div>
        </div>
    </section>
    <section class="section last-section">
        <div class="section-heading">
            <div><span class="eyebrow">MORE TO EXPLORE</span>
                <h2>继续发现好游戏</h2>
            </div>
            <RouterLink to="/games" class="text-link">查看游戏库 →</RouterLink>
        </div>
        <div class="game-grid compact-grid">
            <GameCard v-for="game in moreGames" :key="game.id" :game="game" />
        </div>
    </section>
</template>
<script setup>
import { inject, computed, ref } from 'vue'; import { useRouter } from 'vue-router'; import GameCard from '../components/GameCard.vue'; import GameCover from '../components/GameCover.vue'
const data = inject('siteData'), router = useRouter(), query = ref(''), categories = computed(() => [...data.categories].sort((a, b) => a.sortOrder - b.sortOrder)), games = computed(() => data.games.filter(g => g.published)), featured = computed(() => data.home.featuredGameIds.map(id => games.value.find(g => g.id === id)).filter(Boolean)), heroGame = computed(() => featured.value[0]), guides = computed(() => data.home.featuredGuideIds.map(id => data.guides.find(g => g.id === id)).filter(Boolean)), moreGames = computed(() => games.value.filter(g => !data.home.featuredGameIds.includes(g.id)).slice(0, 4))
function search() { router.push({ path: '/games', query: { q: query.value } }) } function goSearch(word) { router.push({ path: '/games', query: { q: word } }) }
</script>
