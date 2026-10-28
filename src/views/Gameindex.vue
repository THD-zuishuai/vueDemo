<template>
  <div class="min-h-screen w-full bg-[#07070a] text-white font-sans relative overflow-x-hidden">
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div class="absolute -top-[10%] -left-[10%] w-[450px] h-[450px] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute top-[20%] -right-[5%] w-[350px] h-[350px] bg-purple-600/20 rounded-full blur-[100px] animate-bounce-slow"></div>
      <div class="absolute -bottom-[10%] left-[20%] w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[130px]"></div>
    </div>

    <main class="relative z-10 container mx-auto px-5 py-8 md:py-16">
      <header class="text-center mb-12 animate-fade-in">
        <div class="inline-block px-4 py-1 mb-4 text-xs font-bold tracking-[0.2em] uppercase border border-cyan-500/30 rounded-lg bg-cyan-500/10 backdrop-blur-md text-cyan-400">
          ENTER THE METAVERSE — THD 娱乐中心
        </div>
        <h1 class="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent italic">
         老好玩了
        </h1>
        <!-- <p class="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
          欢迎来到神经漫游者终端。请选择一个协议进入虚拟世界，所有的物理法则在此失效。
        </p> -->
      </header>

      <div class="flex justify-center mb-10 overflow-x-auto pb-2 no-scrollbar">
        <div class="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-xl">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="activeCategory = cat"
            :class="[
              'px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap',
              activeCategory === cat ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="game in filteredGames"
          :key="game.id"
          @mouseenter="hoveredGame = game.id"
          @mouseleave="hoveredGame = null"
          class="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 hover:translate-y--2 hover:border-cyan-500/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
        >
          <div class="h-40 bg-gradient-to-br opacity-40 group-hover:opacity-60 transition-opacity duration-500" :class="game.color">
             <div class="flex items-center justify-center h-full text-6xl">
               {{ game.icon }}
             </div>
          </div>

          <div class="p-5">
            <div class="flex justify-between items-start mb-2">
              <span class="text-xs font-mono text-cyan-400 tracking-tighter">{{ game.tag }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300">V{{ game.version }}</span>
            </div>
            <h3 class="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">{{ game.title }}</h3>
            <p class="text-gray-400 text-xs leading-relaxed mb-5 line-clamp-2">
              {{ game.description }}
            </p>
            
            <button 
              @click="launchGame(game.url)"
              class="w-full py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-sm tracking-widest hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 hover:border-transparent transition-all duration-300 group-hover:scale-[1.02] active:scale-95"
            >
              LAUNCH GAME_
            </button>
          </div>

          <div v-if="hoveredGame === game.id" class="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div class="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-scan"></div>
          </div>
        </div>
      </div>

      <footer class="mt-20 flex flex-col items-center border-t border-white/5 pt-10">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-center">
          <!-- <div>
            <div class="text-2xl font-mono font-bold text-white">12,043</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest">在线玩家</div>
          </div> -->
          <!-- <div>
            <div class="text-2xl font-mono font-bold text-white">0.03ms</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest">平均延迟</div>
          </div>
          <div>
            <div class="text-2xl font-mono font-bold text-white">42</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest">活跃协议</div>
          </div>
          <div>
            <div class="text-2xl font-mono font-bold text-white">PRO</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest">系统状态</div>
          </div> -->
        </div>
        <div class="text-gray-600 text-[10px] tracking-[0.3em] uppercase">
          © 2026 THD LABS // NEURAL_INTERFACE_READY
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeCategory = ref('全部')
const hoveredGame = ref(null)

const categories = ['全部', '动作', '解谜', '复古', 'AI实验']

const games = [
  {
    id: 1,
    title: '霓虹贪吃蛇',
    tag: 'ARCADE // 001',
    version: '2.4',
    icon: '🐍',
    description: '在无限循环的虚拟空间中吞噬数据碎片，但别碰到你的尾巴。',
    color: 'from-green-500/40 to-cyan-500/40',
    category: '复古',
    url: 'snake'
  },
  {
    id: 2,
    title: '矩阵解密',
    tag: 'PUZZLE // 012',
    version: '1.0',
    icon: '🧩',
    description: '破解层层加密的逻辑防火墙，获取核心节点的访问权限。',
    color: 'from-blue-500/40 to-purple-500/40',
    category: '解谜',
    url: ''
  },
  {
    id: 3,
    title: '赛博跑手',
    tag: 'ACTION // 005',
    version: '0.8',
    icon: '🏃',
    description: '在高速移动的磁悬浮轨道上躲避障碍，收集能量核心。',
    color: 'from-pink-500/40 to-red-500/40',
    category: '动作',
    url: ''
  },
  {
    id: 4,
    title: 'AI 意识访谈',
    tag: 'EXPERIMENT // 099',
    version: 'BETA',
    icon: '🤖',
    description: '与失控的 AI 进行对话，试图在其逻辑崩溃前将其修复。',
    color: 'from-purple-500/40 to-indigo-500/40',
    category: 'AI实验',
    url: ''
  },
  {
    id: 5,
    title: '像素格斗',
    tag: 'ACTION // 002',
    version: '1.2',
    icon: '🥊',
    description: '复古风格的 1v1 格斗游戏，致敬 80 年代的街机经典。',
    color: 'from-yellow-500/40 to-orange-500/40',
    category: '动作',
    url: ''
  },
  {
    id: 6,
    title: '频率共振',
    tag: 'PUZZLE // 044',
    version: '1.5',
    icon: '📻',
    description: '通过调整波形频率来同步神经信号，极度考验反应力。',
    color: 'from-cyan-500/40 to-blue-500/40',
    category: '解谜',
    url: ''
  }
]

const filteredGames = computed(() => {
  if (activeCategory.value === '全部') return games
  return games.filter(g => g.category === activeCategory.value)
})

const launchGame = (link) => {
   if (link) {
    router.push(link)
  }
  // console.log(`正在启动游戏: ${game.title}`)
  // 这里可以执行跳转逻辑，比如：
  // router.push(game.url) 
  // alert(`正在连接到服务器 [${game.tag}]...\n即将跳转到 ${game.title}`)
}
</script>

<style scoped>
/* 隐藏滚动条 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}
.animate-bounce-slow {
  animation: bounce 8s infinite ease-in-out;
}

@keyframes scan {
  0% { top: 0; opacity: 0; }
  50% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
.animate-scan {
  animation: scan 2s linear infinite;
}
</style>