<template><div class="cover-art" :class="`tone-${tone}`"><img v-if="src && !failed" :src="src" :alt="alt || title" loading="lazy" @error="failed = true"/><template v-else><span class="cover-orbit orbit-one"></span><span class="cover-orbit orbit-two"></span><span class="cover-pixel">{{ glyph }}</span><span class="cover-title">{{ title }}</span><small>PIXEL SUPPLY · DEMO</small></template></div></template>
<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ src:String, alt:String, title:{type:String,default:'游戏封面'}, tone:{type:String,default:'blue'}, glyph:{type:String,default:'✦'} })
const failed = ref(false); watch(() => props.src, () => { failed.value = false })
</script>
