<template>
  <article class="channel-card">
    <header class="channel-head">
      <div><span class="channel-number">下载渠道 {{ index + 1 }}</span><span v-if="model.enabled && !canPublish" class="channel-warning">授权确认后才能启用</span></div>
      <button type="button" class="channel-remove" @click="$emit('remove')">删除渠道</button>
    </header>
    <div class="channel-fields">
      <label>网盘平台
        <select v-model="providerChoice" @change="syncProvider">
          <option value="">请选择平台</option>
          <option v-for="provider in providers" :key="provider" :value="provider">{{ provider }}</option>
          <option value="__other">其他平台</option>
        </select>
      </label>
      <label v-if="providerChoice === '__other'">自定义平台名称
        <input v-model.trim="model.provider" placeholder="填写平台名称" />
      </label>
      <label>按钮名称
        <input v-model.trim="model.label" placeholder="如：平台名称下载" />
      </label>
      <label class="channel-wide">分享链接
        <div class="channel-input-action"><input v-model.trim="model.url" type="url" placeholder="https://…" /><button type="button" @click="copy(model.url, '分享链接')" :disabled="!model.url">复制链接</button></div>
        <small v-if="model.url && !validUrl(model.url)" class="field-error">请输入有效的 http 或 https 链接</small>
      </label>
      <label>提取码
        <div class="channel-input-action"><input v-model.trim="model.extractCode" placeholder="没有提取码可留空" /><button type="button" @click="copy(model.extractCode, '提取码')" :disabled="!model.extractCode">复制</button></div>
      </label>
      <label>对应版本<input v-model.trim="model.version" placeholder="如：1.2.0" /></label>
      <label>文件大小<input v-model.trim="model.fileSize" placeholder="如：850 MB" /></label>
      <label class="channel-wide">下载说明<textarea v-model.trim="model.note" rows="2" placeholder="可选，填写渠道相关说明" /></label>
    </div>
    <footer class="channel-foot">
      <span>{{ model.enabled ? '渠道已启用' : '渠道已停用' }}<small v-if="!canPublish"> · 当前授权状态不会在网站展示本站网盘按钮</small></span>
      <label class="switch-label"><input v-model="model.enabled" type="checkbox" :disabled="!canPublish" /> 启用渠道</label>
    </footer>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({ model: { type: Object, required: true }, index: { type: Number, required: true }, providers: { type: Array, default: () => [] }, canPublish: Boolean })
defineEmits(['remove'])
const providerChoice = ref(props.providers.includes(props.model.provider) ? props.model.provider : (props.model.provider ? '__other' : ''))
const validUrl = (value) => { try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false } }
watch(() => props.model.provider, value => { providerChoice.value = props.providers.includes(value) ? value : (value ? '__other' : '') })
function syncProvider() { if (providerChoice.value !== '__other') props.model.provider = providerChoice.value; else if (props.providers.includes(props.model.provider)) props.model.provider = '' }
async function copy(value, label) {
  try { await navigator.clipboard.writeText(value); window.dispatchEvent(new CustomEvent('editor-toast', { detail: `${label}已复制` })) }
  catch { window.dispatchEvent(new CustomEvent('editor-toast', { detail: '浏览器不支持剪贴板，请手动选择并复制' })) }
}
</script>

<style scoped>
.channel-card{border:1px solid var(--line);border-radius:14px;background:#fbfdff;padding:16px;margin:12px 0}.channel-head,.channel-foot{display:flex;align-items:center;justify-content:space-between;gap:12px}.channel-number{font-size:13px;font-weight:800}.channel-warning{margin-left:9px;color:#b77b22;font-size:11px}.channel-remove{color:#c35e64;font-size:12px}.channel-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 13px;margin:13px 0}.channel-fields label{font-size:11px;color:#60758d;font-weight:700}.channel-fields input,.channel-fields select,.channel-fields textarea{display:block;width:100%;margin-top:5px;padding:9px 10px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);font-size:12px}.channel-wide{grid-column:1/-1}.channel-input-action{display:flex;gap:6px}.channel-input-action input{min-width:0;flex:1}.channel-input-action button{margin-top:5px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--blue);font-size:11px}.channel-input-action button:disabled{opacity:.45}.channel-foot{padding-top:10px;border-top:1px solid var(--line);font-size:11px;color:var(--muted)}.channel-foot small{font-size:10px}.switch-label{display:flex;align-items:center;gap:6px;color:var(--ink);font-weight:700}.field-error{display:block;color:#c45c52;margin-top:4px;font-weight:500}@media(max-width:560px){.channel-fields{grid-template-columns:1fr}.channel-wide{grid-column:auto}.channel-foot{align-items:flex-start;flex-direction:column}}
</style>
