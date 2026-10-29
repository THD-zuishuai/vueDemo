<template>
  <div class="manager-shell">
    <Transition name="toast"><div v-if="toast" class="manager-toast" role="status">{{ toast }}</div></Transition>
    <template v-if="view === 'list'">
      <header class="manager-header"><div><span class="eyebrow">LOCAL CONTENT WORKSPACE</span><h1>游戏资源管理</h1><p>在这里维护游戏内容和网盘渠道。更改暂存在浏览器草稿中，不会自动写入项目文件。</p></div><div class="header-actions"><button class="button secondary" @click="view='data'">导入数据</button><button class="button secondary" :disabled="validationErrors.length" @click="exportData">导出网站数据</button><button class="button primary" @click="createGame">＋ 新增游戏</button></div></header>
      <section class="list-toolbar"><div class="count-block"><b>{{ draft.games.length }}</b><span>款游戏资源</span></div><label class="search-control"><span>⌕</span><input v-model.trim="search" placeholder="搜索游戏名称" /></label><select v-model="categoryFilter" aria-label="按分类筛选"><option value="">全部分类</option><option v-for="category in draft.categories" :key="category.id" :value="category.id">{{ category.name }}</option></select><select v-model="publishFilter" aria-label="按发布状态筛选"><option value="all">全部状态</option><option value="published">已发布</option><option value="draft">未发布</option></select><button class="clear-filter" @click="clearFilters">清除筛选</button></section>
      <div class="table-card"><div class="table-scroll"><table><thead><tr><th>游戏资源</th><th>分类 / 平台</th><th>下载渠道</th><th>授权状态</th><th>发布状态</th><th class="actions-col">操作</th></tr></thead><tbody><tr v-for="game in pagedGames" :key="game.id"><td><div class="resource-name"><GameCover :src="game.cover" :alt="game.coverAlt" :title="game.title"/><div><b>{{ game.title || '未命名游戏' }}</b><small>{{ game.slug }}</small></div></div></td><td><div class="table-tags"><span v-for="name in categoryNames(game)" :key="name">{{ name }}</span><small>{{ game.platforms?.join(' · ') || '平台待补充' }}</small></div></td><td><span class="channel-count">{{ (game.downloadLinks || []).length }} 个渠道</span><small class="channel-enabled">{{ (game.downloadLinks || []).filter(x => x.enabled).length }} 个启用</small></td><td><span class="status-pill" :class="licenseClass(game)">{{ licenseLabel(game) }}</span></td><td><button class="publish-toggle" :class="{on:game.published}" @click="togglePublish(game)"><i></i>{{ game.published ? '已发布' : '未发布' }}</button></td><td><div class="row-actions"><button @click="editGame(game)">编辑</button><button @click="duplicateGame(game)">复制</button><button @click="deleteGame(game)" class="danger-text">删除</button></div></td></tr><tr v-if="!filteredGames.length"><td colspan="6"><div class="list-empty"><span>⌕</span><b>{{ search || categoryFilter || publishFilter !== 'all' ? '没有符合条件的游戏' : '还没有游戏资源' }}</b><small>{{ search || categoryFilter || publishFilter !== 'all' ? '调整筛选条件，或新增一款游戏。' : '点击“新增游戏”开始建立资源条目。' }}</small><button v-if="!search && !categoryFilter && publishFilter==='all'" class="button primary" @click="createGame">新增游戏</button></div></td></tr></tbody></table></div><footer class="pagination"><span>显示 {{ filteredGames.length ? (page-1)*pageSize+1 : 0 }}–{{ Math.min(page*pageSize,filteredGames.length) }} 条，共 {{ filteredGames.length }} 条</span><div><button :disabled="page<=1" @click="page--">上一页</button><span>{{ page }} / {{ pageCount }}</span><button :disabled="page>=pageCount" @click="page++">下一页</button></div></footer></div>
      <p class="draft-note"><span class="draft-dot"></span>浏览器草稿已自动保存 · {{ validationErrors.length ? `还有 ${validationErrors.length} 项数据需要修正` : '当前数据结构校验通过' }} <button @click="view='data'">数据管理与 JSON →</button></p>
    </template>

    <template v-else-if="view === 'edit' && working">
      <nav class="manager-breadcrumb"><button @click="cancelEdit">← 返回资源列表</button><span>/</span><span>{{ isNew ? '新增游戏' : '编辑游戏' }}</span><span v-if="isDirty" class="unsaved-label">有未保存的修改</span><button class="preview-jump" @click="view='data';dataTab='preview'">实时 JSON 预览 →</button></nav>
      <GameResourceForm :key="working.id" :game="working" :categories="draft.categories" :all-games="draft.games" :providers="draft.site.downloadProviders || []" :errors="formErrors" :is-new="isNew" @save="saveGame" @cancel="cancelEdit" @slug-manual="slugTouched=true" />
    </template>

    <template v-else>
      <nav class="manager-breadcrumb"><button @click="returnFromData">← {{ working ? '返回游戏编辑' : '返回资源列表' }}</button><span>/</span><span>数据管理</span></nav>
      <section class="data-manager"><header class="manager-header"><div><span class="eyebrow">IMPORT · VALIDATE · EXPORT</span><h1>数据管理</h1><p>JSON 仅用于整站数据导入、导出与检查，日常游戏编辑请使用资源表单。</p></div></header>
        <div class="data-tabs"><button :class="{active:dataTab==='preview'}" @click="dataTab='preview'">JSON 预览与校验</button><button :class="{active:dataTab==='import'}" @click="dataTab='import'">导入 JSON</button></div>
        <div class="validation-summary" :class="validationErrors.length?'has-errors':'valid-state'"><b>{{ validationErrors.length ? `发现 ${validationErrors.length} 项需要处理` : '数据结构校验通过' }}</b><ul v-if="validationErrors.length"><li v-for="error in validationErrors" :key="error">{{ error }}</li></ul><p v-else>游戏、分类、相关推荐、下载链接与授权状态检查均已通过。</p></div>
        <template v-if="dataTab==='preview'"><div class="json-toolbar"><span>实时 JSON · {{ liveData.games.length }} 款游戏</span><div><button class="button secondary" :disabled="validationErrors.length" @click="copyJson">复制完整 JSON</button><button class="button primary" :disabled="validationErrors.length" @click="exportData">导出 site-content.json</button></div></div><textarea ref="jsonBox" class="manager-json" readonly :value="json" spellcheck="false"/><p class="manager-hint">导出文件后，请替换项目中的 <code>src/data/site-content.json</code>，再重新运行或构建项目。当前内容是浏览器草稿，尚未写入源文件。</p></template>
        <template v-else><label class="import-label">粘贴 JSON 内容<textarea v-model="importText" class="manager-json import-json" placeholder="将完整 site-content.json 内容粘贴到这里" spellcheck="false" /></label><div v-if="importErrors.length" class="import-errors"><b>导入内容未通过校验，当前数据未更改：</b><ul><li v-for="error in importErrors" :key="error">{{ error }}</li></ul></div><div class="data-actions"><label class="button secondary file-button">从文件导入<input type="file" accept="application/json,.json" @change="readImportFile" /></label><button class="button secondary" @click="validateImport">校验 JSON</button><button class="button primary" :disabled="!importReady" @click="applyImport">导入并替换当前浏览器草稿</button></div><p class="manager-hint">导入前会先检查 JSON 语法、字段类型、重复 ID、分类及相关推荐引用、网盘链接和授权条件。无效内容不会覆盖当前草稿。</p></template>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import seed from '../data/site-content.json'
import GameCover from '../components/GameCover.vue'
import GameResourceForm from '../components/GameResourceForm.vue'
import { validateContent } from '../utils/content-validator'

const siteData = inject('siteData')
const storageKey = 'fgd-resource-manager-draft'
const view = ref('list')
const dataTab = ref('preview')
const search = ref('')
const categoryFilter = ref('')
const publishFilter = ref('all')
const page = ref(1)
const pageSize = 12
const toast = ref('')
const importText = ref('')
const importErrors = ref([])
const importCandidate = ref(null)
const jsonBox = ref(null)
const baseData = normalizeData(siteData || seed)
const draft = ref(loadDraft(baseData))
const working = ref(null)
const originalWorking = ref('')
const isNew = ref(false)
const slugTouched = ref(false)
let toastTimer

const liveData = computed(() => {
  if (!working.value) return draft.value
  const data = cloneData(draft.value)
  const index = data.games.findIndex(game => game.id === originalId.value)
  if (isNew.value || index < 0) data.games.push(cloneData(working.value))
  else data.games.splice(index, 1, cloneData(working.value))
  return data
})
const json = computed(() => JSON.stringify(liveData.value, null, 2))
const validationErrors = computed(() => validateContent(liveData.value))
const importReady = computed(() => importCandidate.value !== null && importErrors.value.length === 0)
const formErrors = computed(() => {
  if (!working.value) return []
  const game = working.value
  const errors = []
  if (!game.title?.trim()) errors.push('请填写游戏名称。')
  if (!game.description?.trim()) errors.push('请填写游戏介绍。')
  if (!game.categoryIds?.length) errors.push('请至少选择一个游戏分类。')
  if (!game.slug?.trim()) errors.push('游戏网址标识不能为空。')
  if (game.licenseUrl && !validUrl(game.licenseUrl)) errors.push('授权证明链接格式无效。')
  if (game.sourceUrl && !validUrl(game.sourceUrl)) errors.push('官方获取链接格式无效。')
  if (game.licenseStatus === 'official_only' && !validUrl(game.sourceUrl || '')) errors.push('选择“仅提供官方获取链接”时，请填写有效的官方获取链接。')
  const duplicateSlug = draft.value.games.some(item => item.id !== game.id && item.slug === game.slug)
  if (duplicateSlug) errors.push('游戏网址标识已被使用，请修改名称或重新生成。')
  const duplicateId = draft.value.games.some(item => item.id !== game.id && item.id === game.id)
  if (duplicateId) errors.push('游戏 ID 已重复，请重新生成。')
  const linkIds = new Set()
  for (const link of game.downloadLinks || []) {
    if (!link.provider.trim()) errors.push('每个下载渠道都需要填写网盘平台。')
    if (!link.label.trim()) errors.push('每个下载渠道都需要填写按钮名称。')
    if (link.url && !validUrl(link.url)) errors.push(`下载渠道「${link.provider || link.label}」的链接格式无效。`)
    if (link.enabled && !link.url) errors.push(`下载渠道「${link.provider || link.label}」启用前需要填写分享链接。`)
    if (linkIds.has(link.id)) errors.push(`下载渠道 ID 重复：${link.id}`)
    linkIds.add(link.id)
  }
  return errors
})
const filteredGames = computed(() => {
  const query = search.value.toLocaleLowerCase()
  return draft.value.games.filter(game => {
    const matchesSearch = !query || `${game.title || ''} ${game.subtitle || ''} ${game.description || ''} ${game.slug || ''}`.toLocaleLowerCase().includes(query)
    const matchesCategory = !categoryFilter.value || game.categoryIds?.includes(categoryFilter.value)
    const matchesPublish = publishFilter.value === 'all' || (publishFilter.value === 'published' ? game.published : !game.published)
    return matchesSearch && matchesCategory && matchesPublish
  })
})
const pageCount = computed(() => Math.max(1, Math.ceil(filteredGames.value.length / pageSize)))
const pagedGames = computed(() => filteredGames.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const isDirty = computed(() => Boolean(working.value) && JSON.stringify(working.value) !== originalWorking.value)

watch([search, categoryFilter, publishFilter], () => { page.value = 1 })
watch(importText, () => { importCandidate.value = null; importErrors.value = [] }, { flush: 'sync' })
watch(draft, value => { try { localStorage.setItem(storageKey, JSON.stringify(value)) } catch { showToast('浏览器存储空间不足，当前草稿仍保留在页面中') } }, { deep: true })
watch(() => working.value?.title, (title, previous) => {
  if (!working.value || slugTouched.value || !title) return
  if (previous === undefined && !isNew.value) return
  working.value.slug = uniqueSlug(slugify(title), working.value.id)
}, { flush: 'sync' })
onBeforeRouteLeave(() => !isDirty.value || window.confirm('当前游戏修改尚未保存，确定离开编辑器吗？'))

function normalizeData(value) {
  const data = cloneData(value)
  if (data.site && typeof data.site === 'object' && !Array.isArray(data.site) && !Array.isArray(data.site.downloadProviders)) data.site.downloadProviders = cloneData(seed.site.downloadProviders || [])
  data.games = (data.games || []).map(game => {
    const normalized = { ...game, screenshots: game.screenshots || [], categoryIds: game.categoryIds || [], tags: game.tags || [], platforms: game.platforms || [], language: game.language || [], features: game.features || [], controls: game.controls || [], requirements: game.requirements || [], relatedGameIds: game.relatedGameIds || [], downloadLinks: game.downloadLinks || [] }
    if (!Array.isArray(normalized.downloadLinks)) normalized.downloadLinks = []
    if (!normalized.downloadLinks.length && normalized.downloadUrl) {
      normalized.downloadLinks = [{ id: `link-${normalized.id}`, provider: '其他', label: normalized.downloadLabel || '网盘下载', url: normalized.downloadUrl, extractCode: '', version: normalized.version || '', fileSize: normalized.gameSize || '', note: '', enabled: normalized.licenseStatus === 'permission_confirmed' && normalized.downloadMode === 'authorized_hosted' }]
    }
    normalized.demoOnly = Boolean(normalized.demoOnly)
    return normalized
  })
  return data
}
function cloneData(value) { return JSON.parse(JSON.stringify(value)) }
function loadDraft(fallback) {
  try {
    const saved = localStorage.getItem(storageKey) || localStorage.getItem('fgd-editor-draft')
    if (!saved) return cloneData(fallback)
    const parsed = normalizeData(JSON.parse(saved))
    return validateContent(parsed).length ? cloneData(fallback) : parsed
  } catch { return cloneData(fallback) }
}
function slugify(value) {
  const ascii = value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return ascii || `game-${Math.random().toString(36).slice(2, 7)}`
}
function uniqueId(base) {
  const used = new Set(draft.value.games.map(game => game.id))
  let candidate = base || 'game'
  let suffix = 2
  while (used.has(candidate)) candidate = `${base}-${suffix++}`
  return candidate
}
function uniqueSlug(base, ownId = '') {
  const used = new Set(draft.value.games.filter(game => game.id !== ownId).map(game => game.slug))
  let candidate = base || `game-${Math.random().toString(36).slice(2, 7)}`
  let suffix = 2
  while (used.has(candidate)) candidate = `${base}-${suffix++}`
  return candidate
}
function newGame(title = '') {
  const slug = uniqueSlug(slugify(title || `game-${Math.random().toString(36).slice(2, 6)}`))
  const id = uniqueId(`game-${slug}`)
  return { id, slug, title, subtitle: '', description: '', cover: '', coverAlt: '', screenshots: [], categoryIds: [], tags: [], platforms: [], releaseYear: null, developer: '', version: '', language: [], gameSize: '', recommended: false, published: false, demoOnly: false, licenseStatus: 'pending_review', licenseNote: '授权情况待核实。', licenseUrl: '', sourceUrl: '', sourceNote: '', downloadMode: 'info_only', downloadUrl: '', downloadLabel: '', downloadLinks: [], features: [], controls: [], requirements: [], faqs: [], relatedGameIds: [] }
}
function createGame() { isNew.value = true; slugTouched.value = false; working.value = newGame(); originalWorking.value = JSON.stringify(working.value); view.value = 'edit' }
function editGame(game) { isNew.value = false; slugTouched.value = false; working.value = cloneData(game); originalWorking.value = JSON.stringify(working.value); view.value = 'edit' }
function duplicateGame(game) {
  const clone = cloneData(game)
  clone.title = `${game.title}（副本）`
  clone.id = uniqueId(`${game.id}-copy`)
  clone.slug = uniqueSlug(`${game.slug}-copy`)
  clone.downloadLinks = (clone.downloadLinks || []).map(link => ({ ...link, id: `link-${Math.random().toString(36).slice(2, 9)}`, enabled: false }))
  clone.published = false
  clone.relatedGameIds = clone.relatedGameIds.filter(id => id !== game.id)
  isNew.value = true; slugTouched.value = true; working.value = clone; originalWorking.value = JSON.stringify(clone); view.value = 'edit'
  showToast('已创建未发布副本，请检查内容和授权信息后保存')
}
function saveGame() {
  if (formErrors.value.length) return
  const game = cloneData(working.value)
  if (!game.id || draft.value.games.some(item => item.id === game.id && item.id !== (isNew.value ? '' : originalId.value))) game.id = uniqueId(`game-${slugify(game.title)}`)
  game.slug = uniqueSlug(game.slug, game.id)
  game.categoryIds = [...new Set(game.categoryIds)]
  game.downloadLinks = game.downloadLinks.map((link,index) => ({ ...link, id: link.id || `link-${game.id}-${index+1}`, enabled: Boolean(link.enabled && game.published && !game.demoOnly && game.licenseStatus === 'permission_confirmed') }))
  game.downloadMode = game.downloadLinks.some(link => link.enabled) ? 'authorized_hosted' : game.licenseStatus === 'official_only' ? 'official_link' : 'info_only'
  game.downloadUrl = ''
  game.downloadLabel = ''
  const index = draft.value.games.findIndex(item => item.id === (isNew.value ? '' : originalId.value))
  if (index < 0) draft.value.games.push(game)
  else draft.value.games.splice(index, 1, game)
  view.value = 'list'; working.value = null; isNew.value = false; showToast('游戏资源已保存到浏览器草稿')
}
const originalId = computed(() => { try { return JSON.parse(originalWorking.value).id } catch { return '' } })
function cancelEdit() { if (isDirty.value && !window.confirm('当前修改尚未保存，确定放弃这些修改吗？')) return; working.value = null; isNew.value = false; slugTouched.value = false; view.value = 'list' }
function returnFromData() { view.value = working.value ? 'edit' : 'list' }
function deleteGame(game) {
  if (!window.confirm(`确定删除「${game.title}」吗？删除后会同时清理首页推荐和相关推荐中的引用。`)) return
  draft.value.games = draft.value.games.filter(item => item.id !== game.id)
  draft.value.guides = draft.value.guides.map(guide => ({ ...guide, relatedGameIds: (guide.relatedGameIds || []).filter(id => id !== game.id) }))
  draft.value.games.forEach(item => { item.relatedGameIds = (item.relatedGameIds || []).filter(id => id !== game.id) })
  for (const list of ['featuredGameIds', 'recommendedGameIds']) draft.value.home[list] = (draft.value.home[list] || []).filter(id => id !== game.id)
  showToast('游戏资源已从浏览器草稿删除')
}
function togglePublish(game) {
  const next = !game.published
  if (next && (!game.title?.trim() || !game.description?.trim() || !game.categoryIds?.length)) { showToast('发布前请补全名称、介绍和至少一个分类'); editGame(game); return }
  game.published = next
  if (!next) game.downloadLinks?.forEach(link => { link.enabled = false })
  showToast(next ? '游戏已设为发布' : '游戏已下架；网盘入口已停用')
}
function clearFilters() { search.value = ''; categoryFilter.value = ''; publishFilter.value = 'all' }
function categoryNames(game) { return (game.categoryIds || []).map(id => draft.value.categories.find(category => category.id === id)?.name).filter(Boolean) }
function licenseLabel(game) { return game.licenseStatus === 'permission_confirmed' ? '已确认分发' : game.licenseStatus === 'official_only' ? '仅官方获取' : '授权待核实' }
function licenseClass(game) { return game.licenseStatus === 'permission_confirmed' ? 'license-ok' : game.licenseStatus === 'official_only' ? 'license-official' : 'license-pending' }
function validUrl(value) { try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false } }
function showToast(message) { toast.value = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.value = '' }, 2600) }
function onToast(event) { showToast(event.detail) }
function onBeforeUnload(event) { if (view.value === 'edit' && isDirty.value) { event.preventDefault(); event.returnValue = '' } }
onMounted(() => { window.addEventListener('editor-toast', onToast); window.addEventListener('beforeunload', onBeforeUnload) })
onBeforeUnmount(() => { window.removeEventListener('editor-toast', onToast); window.removeEventListener('beforeunload', onBeforeUnload); clearTimeout(toastTimer) })
async function copyJson() {
  try { await navigator.clipboard.writeText(json.value); showToast('完整 JSON 已复制') }
  catch { jsonBox.value?.focus(); jsonBox.value?.select(); showToast('浏览器不支持剪贴板，JSON 已选中，可按 Ctrl+C 复制') }
}
function exportData() {
  if (validationErrors.value.length) { showToast('请先修正数据校验错误再导出'); return }
  const url = URL.createObjectURL(new Blob([json.value], { type: 'application/json;charset=utf-8' }))
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'site-content.json'; anchor.click(); URL.revokeObjectURL(url); showToast('网站数据已导出')
}
function setImportCandidate(text) {
  importErrors.value = []; importCandidate.value = null
  let parsed
  try { parsed = JSON.parse(text) } catch (error) { importErrors.value = [`JSON 语法错误：${error.message}`]; return }
  try { parsed = normalizeData(parsed) } catch (error) { importErrors.value = [`JSON 数据结构无法读取：${error.message}`]; return }
  importErrors.value = validateContent(parsed)
  if (!importErrors.value.length) importCandidate.value = parsed
}
function validateImport() { setImportCandidate(importText.value); showToast(importErrors.value.length ? 'JSON 检查未通过，当前数据未改变' : 'JSON 语法和数据结构检查通过') }
function applyImport() { if (!importReady.value) return; if (!window.confirm('导入内容将替换当前浏览器草稿，确定继续吗？')) return; draft.value = importCandidate.value; working.value = null; isNew.value = false; importCandidate.value = null; importErrors.value = []; view.value = 'list'; showToast('JSON 已导入浏览器草稿，源文件尚未修改') }
function readImportFile(event) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { importText.value = String(reader.result || ''); setImportCandidate(importText.value) }; reader.readAsText(file); event.target.value = '' }

</script>

<style scoped>
.manager-shell{max-width:1320px;min-height:65vh;margin:0 auto;padding:36px 26px 65px;position:relative}.manager-header{display:flex;justify-content:space-between;align-items:flex-end;gap:22px;margin-bottom:25px}.manager-header h1{font-size:30px;letter-spacing:-.6px;margin:7px 0}.manager-header p{font-size:13px;color:var(--muted);margin:0;line-height:1.65}.header-actions{display:flex;gap:8px;flex-wrap:wrap}.list-toolbar{display:flex;align-items:center;gap:10px;padding:13px;background:#fff;border:1px solid var(--line);border-radius:13px;margin-bottom:14px}.count-block{min-width:135px;display:flex;align-items:baseline;gap:7px}.count-block b{font-size:21px;color:var(--blue)}.count-block span{font-size:11px;color:var(--muted)}.search-control{display:flex;align-items:center;height:40px;gap:7px;border:1px solid var(--line);border-radius:8px;padding:0 10px;flex:1;min-width:180px;color:#8ca0b7}.search-control span{font-size:22px}.search-control input{width:100%;border:0;outline:0;font-size:12px;color:var(--ink)}.list-toolbar select{height:40px;border:1px solid var(--line);border-radius:8px;background:#fff;padding:0 10px;color:#536a82;font-size:12px}.clear-filter{color:var(--blue);white-space:nowrap;font-size:11px}.table-card{background:#fff;border:1px solid var(--line);border-radius:13px;overflow:hidden}.table-scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:850px;text-align:left}th{background:#f8fbff;color:#8192a6;font-size:10px;font-weight:700;letter-spacing:.3px;padding:12px 14px;border-bottom:1px solid var(--line)}td{padding:12px 14px;border-bottom:1px solid #eff3f7;font-size:12px}tbody tr:last-child td{border-bottom:0}.resource-name{display:flex;align-items:center;gap:10px;min-width:180px}.resource-name>.cover-art{width:63px;height:48px;border-radius:8px;flex-shrink:0}.resource-name .cover-pixel{font-size:16px}.resource-name .cover-title{font-size:7px;margin-top:2px}.resource-name .cover-art>small{display:none}.resource-name b,.resource-name small{display:block}.resource-name b{font-size:12px;max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.resource-name small{font-size:9px;color:#92a2b5;margin-top:4px}.table-tags{display:grid;gap:4px}.table-tags span{font-size:10px;color:#5d7b9c}.table-tags small,.channel-enabled{font-size:9px;color:#95a4b5}.channel-count{display:block;font-weight:700;color:#506c88}.status-pill{display:inline-block;padding:5px 8px;border-radius:20px;font-size:10px;white-space:nowrap}.license-ok{background:#ebf8f2;color:#358469}.license-official{background:#eef4ff;color:#5276b3}.license-pending{background:#fff5e7;color:#b17e37}.publish-toggle{display:flex;align-items:center;gap:6px;font-size:10px;color:#8393a6;white-space:nowrap}.publish-toggle i{width:24px;height:14px;background:#c9d3de;border-radius:10px;position:relative}.publish-toggle i:after{content:"";position:absolute;width:10px;height:10px;border-radius:50%;background:#fff;left:2px;top:2px;transition:.18s}.publish-toggle.on{color:#438c73}.publish-toggle.on i{background:#63c5a5}.publish-toggle.on i:after{left:12px}.row-actions{display:flex;gap:9px;white-space:nowrap}.row-actions button{font-size:10px;color:var(--blue)}.row-actions .danger-text{color:#c86267}.actions-col{min-width:135px}.pagination{display:flex;justify-content:space-between;align-items:center;padding:12px 15px;color:#8899ab;font-size:10px;border-top:1px solid var(--line)}.pagination>div{display:flex;align-items:center;gap:10px}.pagination button{padding:6px 9px;border:1px solid var(--line);border-radius:7px;color:#607790;font-size:10px}.pagination button:disabled{opacity:.45;cursor:not-allowed}.list-empty{min-height:220px;display:grid;justify-items:center;align-content:center;gap:8px;color:#8b9db1}.list-empty>span{font-size:32px}.list-empty b{color:var(--ink);font-size:14px}.list-empty small{font-size:11px}.list-empty .button{margin-top:8px}.draft-note{display:flex;align-items:center;gap:7px;font-size:11px;color:#8193a7;padding:13px 2px}.draft-dot{width:7px;height:7px;border-radius:50%;background:#5bc2a0}.draft-note button{margin-left:auto;color:var(--blue);font-size:11px}.manager-breadcrumb{display:flex;align-items:center;gap:10px;margin-bottom:20px;color:#96a4b5;font-size:12px}.manager-breadcrumb button{color:var(--blue);font-weight:700}.unsaved-label{margin-left:auto;background:#fff3dc;color:#ad782c;border-radius:20px;padding:5px 9px;font-size:10px}.data-manager{background:#fff;border:1px solid var(--line);border-radius:15px;padding:22px}.data-manager .manager-header{margin-bottom:20px}.data-tabs{display:flex;gap:6px;border-bottom:1px solid var(--line);margin-bottom:16px}.data-tabs button{padding:10px 13px;color:#71849a;font-size:12px;border-bottom:2px solid transparent}.data-tabs button.active{color:var(--blue);border-color:var(--blue);font-weight:700}.validation-summary{padding:12px 14px;border-radius:10px;font-size:12px;margin:13px 0}.validation-summary p{margin:5px 0 0;font-size:11px}.validation-summary ul,.import-errors ul{margin:7px 0 0;padding-left:18px;line-height:1.7}.valid-state{background:#effaf5;color:#337e65}.has-errors,.import-errors{background:#fff6f3;border:1px solid #f2cdc3;color:#a84d42}.json-toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:14px 0;font-size:11px;color:#687e95}.json-toolbar>div,.data-actions{display:flex;gap:8px;flex-wrap:wrap}.json-toolbar .button{font-size:11px;padding:8px 11px}.manager-json{display:block;width:100%;min-height:54vh;border:1px solid var(--line);border-radius:10px;padding:14px;background:#f7faff;color:#334b65;font:11px/1.6 Consolas,monospace;resize:vertical}.import-label{font-size:12px;font-weight:700;color:#536d88}.import-json{margin-top:9px;min-height:52vh}.manager-hint{font-size:11px;line-height:1.7;color:#8294a8;margin:10px 0}.manager-hint code{color:#597795}.data-actions{margin-top:13px;align-items:center}.file-button{position:relative;overflow:hidden}.file-button input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}.import-errors{padding:11px 13px;border-radius:9px;font-size:11px;margin-top:12px}.manager-toast{position:fixed;z-index:50;right:25px;top:92px;max-width:min(400px,calc(100vw - 32px));padding:12px 17px;background:#183153;color:#fff;border-radius:10px;box-shadow:0 10px 30px #18315330;font-size:12px}.toast-enter-active,.toast-leave-active{transition:opacity .18s,transform .18s}.toast-enter-from,.toast-leave-to{opacity:0;transform:translateY(-6px)}
@media(max-width:850px){.manager-header{align-items:flex-start;flex-direction:column}.header-actions{width:100%}.list-toolbar{flex-wrap:wrap}.count-block{min-width:90px}.search-control{min-width:220px}.list-toolbar select{flex:1}.clear-filter{padding:8px}}
@media(max-width:600px){.manager-shell{padding:24px 14px 45px}.manager-header h1{font-size:25px}.header-actions .button{flex:1;padding:9px 8px;font-size:11px}.list-toolbar{gap:8px}.count-block{width:100%}.search-control{flex-basis:100%}.list-toolbar select{min-width:0}.pagination{gap:6px;flex-direction:column;align-items:flex-start}.pagination>div{align-self:flex-end}.data-manager{padding:14px}.json-toolbar{align-items:flex-start;flex-direction:column}.manager-json{min-height:45vh}.draft-note{flex-wrap:wrap}.draft-note button{margin-left:0}.manager-toast{top:75px;right:14px}}
</style>
<style scoped>
.preview-jump{margin-left:auto;color:var(--blue);font-size:11px;font-weight:700}.unsaved-label+.preview-jump{margin-left:4px}@media(max-width:600px){.preview-jump{margin-left:0}}
</style>
