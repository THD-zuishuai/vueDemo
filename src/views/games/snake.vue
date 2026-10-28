<template>
  <div class="min-h-screen bg-[#07070a] text-white font-sans flex flex-col items-center justify-center p-4 overflow-hidden relative">
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-0 right-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
    </div>

    <div class="relative z-10 w-full max-w-[500px] mb-4 flex justify-between items-end border-b border-white/10 pb-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-mono border border-green-500/30 rounded">ARCADE // 001</span>
          <span class="text-gray-500 text-[10px] font-mono">VER 2.4</span>
        </div>
        <h1 class="text-2xl font-black tracking-tighter mt-1 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          NEON SNAKE _ 霓虹贪吃蛇
        </h1>
      </div>
      <div class="text-right">
        <div class="text-[10px] text-gray-500 uppercase font-mono tracking-widest">Data_Sync</div>
        <div class="text-3xl font-mono font-bold text-cyan-400 leading-none">{{ score }}</div>
      </div>
    </div>

    <div class="relative z-10">
      <div class="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-green-500 z-20"></div>
      <div class="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500 z-20"></div>

      <canvas 
        ref="gameCanvas" 
        :width="gridSize * cellSize" 
        :height="gridSize * cellSize"
        class="bg-black/80 backdrop-blur-sm rounded shadow-[0_0_50px_rgba(34,197,94,0.1)]"
      ></canvas>

      <div v-if="gameState !== 'PLAYING'" class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm text-center">
        <div v-if="gameState === 'START'" class="animate-in fade-in zoom-in duration-300">
          <div class="text-5xl mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]">🐍</div>
          <p class="text-gray-400 text-xs mb-6 font-mono tracking-widest uppercase">无限循环协议已就绪</p>
          <button @click="startGame" class="group relative px-10 py-3 overflow-hidden rounded-full border border-green-500/50 transition-all hover:border-green-400">
            <div class="absolute inset-0 bg-green-500/10 group-hover:bg-green-500/20 transition-all"></div>
            <span class="relative font-bold tracking-[0.2em] text-green-400">START_LINK</span>
          </button>
        </div>

        <div v-if="gameState === 'GAMEOVER'" class="animate-in slide-in-from-bottom-4 duration-300">
          <h2 class="text-3xl font-black text-red-500 italic mb-2 tracking-tighter">SEGMENTATION FAULT</h2>
          <p class="text-gray-400 font-mono text-sm mb-8">链路完整性损坏。同步得分: {{ score }}</p>
          <button @click="startGame" class="px-10 py-3 bg-gradient-to-r from-green-600 to-cyan-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all">
            REBOOT SYSTEM
          </button>
        </div>
      </div>
    </div>

    <div class="mt-8 flex gap-12 text-gray-500 font-mono text-[10px] tracking-widest uppercase">
      <div class="flex flex-col items-center gap-2">
        <div class="flex gap-1">
          <span class="w-6 h-6 border border-white/10 flex items-center justify-center rounded">W</span>
        </div>
        <div class="flex gap-1">
          <span class="w-6 h-6 border border-white/10 flex items-center justify-center rounded">A</span>
          <span class="w-6 h-6 border border-white/10 flex items-center justify-center rounded">S</span>
          <span class="w-6 h-6 border border-white/10 flex items-center justify-center rounded">D</span>
        </div>
        <span>移动</span>
      </div>
      <div class="flex flex-col justify-center items-center">
        <div class="px-3 py-1 border border-cyan-500/30 text-cyan-500 mb-2 rounded">∞</div>
        <span>支持穿墙</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const gridSize = 20
const cellSize = 20
const initialSpeed = 110

const gameCanvas = ref(null)
const score = ref(0)
const gameState = ref('START') 

let ctx = null
let snake = []
let food = { x: 5, y: 5 }
let direction = 'RIGHT'
let nextDirection = 'RIGHT'
let lastRenderTime = 0
let gameLoop = null

onMounted(() => {
  ctx = gameCanvas.value.getContext('2d')
  window.addEventListener('keydown', handleKeyDown)
  drawBackground()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  cancelAnimationFrame(gameLoop)
})

function handleKeyDown(e) {
  const key = e.key.toUpperCase()
  const mapping = { 
    'W': 'UP', 'ARROWUP': 'UP',
    'S': 'DOWN', 'ARROWDOWN': 'DOWN',
    'A': 'LEFT', 'ARROWLEFT': 'LEFT',
    'D': 'RIGHT', 'ARROWRIGHT': 'RIGHT'
  }
  if (mapping[key]) changeDirection(mapping[key])
}

function changeDirection(newDir) {
  const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
  if (newDir !== opposites[direction]) {
    nextDirection = newDir
  }
}

function startGame() {
  score.value = 0
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ]
  direction = 'RIGHT'
  nextDirection = 'RIGHT'
  gameState.value = 'PLAYING'
  createFood()
  lastRenderTime = 0
  requestAnimationFrame(loop)
}

function createFood() {
  food = {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize)
  }
  if (snake.some(s => s.x === food.x && s.y === food.y)) createFood()
}

function loop(timestamp) {
  if (gameState.value !== 'PLAYING') return

  const elapsed = timestamp - lastRenderTime
  const currentSpeed = Math.max(initialSpeed - Math.floor(score.value / 50) * 5, 50)

  if (elapsed >= currentSpeed) {
    update()
    draw()
    lastRenderTime = timestamp
  }
  gameLoop = requestAnimationFrame(loop)
}

function update() {
  direction = nextDirection
  const head = { ...snake[0] }

  if (direction === 'UP') head.y--
  if (direction === 'DOWN') head.y++
  if (direction === 'LEFT') head.x--
  if (direction === 'RIGHT') head.x++

  // --- 关键修改：无限循环逻辑 (穿墙) ---
  head.x = (head.x + gridSize) % gridSize
  head.y = (head.y + gridSize) % gridSize

  // 碰撞检测：仅检测是否咬到自己
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameState.value = 'GAMEOVER'
    return
  }

  snake.unshift(head)

  if (head.x === food.x && head.y === food.y) {
    score.value += 10
    createFood()
  } else {
    snake.pop()
  }
}

function draw() {
  // 底色
  ctx.fillStyle = 'rgba(0, 0, 0, 1)'
  ctx.fillRect(0, 0, gameCanvas.value.width, gameCanvas.value.height)

  // 绘制微弱网格
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
  ctx.lineWidth = 1
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath(); ctx.moveTo(i * cellSize, 0); ctx.lineTo(i * cellSize, gridSize * cellSize); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i * cellSize); ctx.lineTo(gridSize * cellSize, i * cellSize); ctx.stroke()
  }

  // 绘制食物 (脉冲红/粉)
  ctx.shadowBlur = 15
  ctx.shadowColor = '#00ffcc'
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(food.x * cellSize + cellSize/2, food.y * cellSize + cellSize/2, cellSize/3, 0, Math.PI * 2)
  ctx.fill()

  // 绘制蛇身 (Green to Cyan 渐变)
  snake.forEach((segment, index) => {
    const ratio = index / snake.length
    ctx.shadowBlur = index === 0 ? 20 : 5
    ctx.shadowColor = `rgba(34, 197, 94, ${1 - ratio})`
    
    // 计算渐变色
    ctx.fillStyle = index === 0 ? '#fff' : `rgb(${34 + ratio * 20}, ${197}, ${94 + ratio * 150})`
    
    const p = index === 0 ? 1 : 2
    ctx.fillRect(
      segment.x * cellSize + p, 
      segment.y * cellSize + p, 
      cellSize - p * 2, 
      cellSize - p * 2
    )
  })
}

function drawBackground() {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, gameCanvas.value.width, gameCanvas.value.height)
}
</script>

<style scoped>
/* 简单的进入动画 */
.fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

canvas {
  image-rendering: pixelated;
}
</style>