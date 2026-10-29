<template>
  <div class="relative min-h-screen w-full overflow-x-hidden bg-[#0a0a0c] text-white font-sans">
    
    <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute top-[20%] -right-[5%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-bounce-slow"></div>
      <div class="absolute -bottom-[10%] left-[20%] w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[150px]"></div>
    </div>

    <main class="relative z-10 container mx-auto px-6 py-12 flex flex-col items-center">
      
      <header class="text-center mb-16 animate-fade-in-up">
        <div class="inline-block px-4 py-1.5 mb-4 text-sm font-medium tracking-wider uppercase border border-white/20 rounded-full bg-white/5 backdrop-blur-md">
          欢迎来到THD的个人站
        </div>
        <h1 class="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          你好, 我是 <span class="text-white">THD</span>
        </h1>
        <p class="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed pt-2">
          一个热爱代码、设计与生活的开发者。在这里，你可以找到我所有的实验室成果与日常奇思妙想。
        </p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        <div 
          v-for="(module, index) in modules" 
          :key="index"
          class="group relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(79,70,229,0.3)] cursor-default"
        >
          <div class="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="relative z-10">
            <div class="text-4xl mb-4">{{ module.icon }}</div>
            <h3 class="text-2xl font-bold mb-2">{{ module.title }}</h3>
            <p class="text-gray-400 text-sm leading-relaxed">{{ module.desc }}</p>
          </div>
        </div>
      </div>

      <footer class="mt-20 flex space-x-8 text-gray-500">
        <!-- <a href="#" class="hover:text-white transition-colors">GitHub</a> -->
        <!-- <a href="#" class="hover:text-white transition-colors">Blog</a>
        <a href="#" class="hover:text-white transition-colors">Twitter</a> -->
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const modules = ref([
  {
    title: '未来趋势',
    desc: 'THD输入足够的数据，通过gpt5.4模型,生成未来金融的趋势。',
    icon: '🚀'
  },
  {
    title: '我的履历',
    desc: 'THD的个人履历，包含个人信息、工作经历、项目经验、教育经历等。',
    icon: '✍️'
  },
  {
    title: '小游戏',
    desc: '好玩的小游戏',
    icon: '🧪'
  },
  {
    title: '音乐收藏',
    desc: '写代码时循环播放的歌单，从 Lo-Fi 到重金属，风格极其分裂。',
    icon: '🎵'
  },
  {
    title: '关于我',
    desc: '想知道我是谁？想找我合作？点击这里查看我的详细简历和联系方式。',
    icon: '👨‍💻'
  },
  {
    title: '碎碎念',
    desc: '生活碎片记录，包含摄影、旅行以及对这个世界的各种吐槽。',
    icon: '📸'
  }
])
</script>

<style scoped>
/* 自定义动画 */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 1s ease-out forwards;
}

.animate-bounce-slow {
  animation: bounce 6s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}

/* 隐藏滚动条但保留功能 */
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
</style>