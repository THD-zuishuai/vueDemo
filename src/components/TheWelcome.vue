<template>
  <div class="demo-wrap">
    <h2>Vue 3 - 鼠标 / 指针 拖动方向监听 Demo</h2>

    <div
      ref="area"
      class="area"
      @pointerdown="onPointerDown"
      @pointermove.prevent="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
    >
      <div v-if="!dragging" class="hint">按住并拖动（鼠标或触控）</div>
      <div v-else class="hint">拖动中… 当前方向：<strong>{{ currentDirection }}</strong></div>

      <!-- 可视化轨迹点（简单） -->
      <svg class="overlay" v-if="path.length">
        <polyline
          :points="polylinePoints"
          fill="none"
          stroke="rgba(0,0,0,0.25)"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <!-- 起点 / 终点标记 -->
      <div v-if="startPos" :style="markerStyle(startPos)" class="marker start">S</div>
      <div v-if="endPos" :style="markerStyle(endPos)" class="marker end">E</div>
    </div>

    <div class="info">
      <p><strong>状态</strong>: {{ dragging ? '拖动中' : '空闲' }}</p>
      <p><strong>开始时间</strong>: {{ formatTime(startTime) }}</p>
      <p><strong>结束时间</strong>: {{ formatTime(endTime) }}</p>
      <p><strong>持续时长</strong>: {{ durationMs }} ms</p>
      <p><strong>即时方向</strong>: {{ currentDirection }}</p>
      <p><strong>最终方向</strong>: {{ finalDirection }}</p>
      <p><strong>总位移</strong>: {{ totalDistance.toFixed(1) }} px</p>
      <p><strong>轨迹点数</strong>: {{ path.length }}</p>

      <div class="buttons">
        <button @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// refs
const area = ref(null)
const dragging = ref(false)
const startTime = ref(null)
const endTime = ref(null)
const startPos = ref(null)
const endPos = ref(null)
const lastPos = ref(null)
const path = ref([]) // [{x,y,t}]
const currentDirection = ref('—')
const finalDirection = ref('—')
const totalDistance = ref(0)
let activePointerId = null

// helpers
function formatTime(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleString()
}

const durationMs = computed(() => {
  if (!startTime.value) return 0
  const end = endTime.value || Date.now()
  return end - startTime.value
})

function distance(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

function calcDirection(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  // 判断主方向：水平/垂直
  if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return '静止'
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? '向右' : '向左'
  } else {
    return dy > 0 ? '向下' : '向上'
  }
}

// 事件处理
function onPointerDown(e) {
  // 只处理主按钮 (mouse) 或任意指针 (touch/stylus)
  if (e.pointerType === 'mouse' && e.button !== 0) return

  activePointerId = e.pointerId
  area.value.setPointerCapture(activePointerId)

  dragging.value = true
  startTime.value = Date.now()
  endTime.value = null
  finalDirection.value = '—'

  const p = getLocalPoint(e)
  startPos.value = { ...p }
  lastPos.value = { ...p }
  endPos.value = null
  path.value = [{ ...p, t: startTime.value }]
  currentDirection.value = '开始'
  totalDistance.value = 0
}

function onPointerMove(e) {
  if (!dragging.value) return
  if (e.pointerId !== activePointerId) return

  const p = getLocalPoint(e)
  const dx = p.x - lastPos.value.x
  const dy = p.y - lastPos.value.y
  const stepDist = Math.sqrt(dx * dx + dy * dy)
  totalDistance.value += stepDist

  // 更新即时方向（用最近一段）
  currentDirection.value = calcDirection(lastPos.value, p)

  lastPos.value = { ...p }
  path.value.push({ ...p, t: Date.now() })
}

function onPointerUp(e) {
  if (e.pointerId !== activePointerId) return

  area.value.releasePointerCapture(activePointerId)
  activePointerId = null

  dragging.value = false
  endTime.value = Date.now()

  if (startPos.value && lastPos.value) {
    endPos.value = { ...lastPos.value }
    finalDirection.value = calcDirection(startPos.value, endPos.value)
  }

  currentDirection.value = '结束'
}

function onPointerCancel(e) {
  // 当指针被中断（例如系统取消）
  if (e.pointerId !== activePointerId) return
  area.value.releasePointerCapture(activePointerId)
  activePointerId = null
  dragging.value = false
  endTime.value = Date.now()
  currentDirection.value = '已取消'
}

function getLocalPoint(e) {
  const rect = area.value.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

function markerStyle(p) {
  return {
    left: `${p.x - 10}px`,
    top: `${p.y - 10}px`
  }
}

function reset() {
  dragging.value = false
  startTime.value = null
  endTime.value = null
  startPos.value = null
  endPos.value = null
  lastPos.value = null
  path.value = []
  currentDirection.value = '—'
  finalDirection.value = '—'
  totalDistance.value = 0
}

const polylinePoints = computed(() => {
  return path.value.map(p => `${p.x},${p.y}`).join(' ')
})

// 清理（防止没捕获到 pointerup）
onMounted(() => {
  // nothing to add for now
})

onBeforeUnmount(() => {
  try {
    if (area.value && activePointerId != null) {
      area.value.releasePointerCapture(activePointerId)
      activePointerId = null
    }
  } catch (e) {
    // ignore
  }
})
</script>

<style scoped>
.demo-wrap {
  /* max-width: 900px; */
  width: 100%;
  margin: 18px auto;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft Yahei', 'Arial';
}

.area {
  position: relative;
  height: 420px;
  border: 2px dashed #d0d0d0;
  border-radius: 8px;
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  touch-action: none; /* 阻止滚动以便 touch 拖动正常工作 */
  background: linear-gradient(180deg, #fafafa, #fff);
}

.hint {
  font-size: 16px;
  color: #555;
  user-select: none;
}

.overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.marker {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #fff;
  user-select: none;
  transform: translate(-50%, -50%);
}
.marker.start { background: #28a745; }
.marker.end { background: #dc3545; }

.info {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}

.buttons { margin-top: 8px }
button { padding: 6px 10px; border-radius: 6px; border: 1px solid #ccc; background: #f7f7f7 }
</style>
