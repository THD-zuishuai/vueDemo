<template>
  <div class="birthday-container">
    <div class="bg-gradient"></div>

    <canvas id="canvas" ref="canvasRef"></canvas>

    <main class="content">
      <transition name="fade-up" appear>
        <div v-if="showContent" class="glass-card">
          <header class="header">
            <span class="date">2026.03.11</span>
            <div class="line"></div>
          </header>

          <section class="main-body">
            <h1 class="title">Happy Birthday</h1>
            <p class="name">致：疼帅逼</p>
            
            <div class="message-box">
              <p>愿每一枚星辰，都落在你的梦里；</p>
              <p>愿每一寸时光，都温柔你的岁月。</p>
              <p>在这个属于你的日子里，</p>
              <p>愿你永远拥有热忱，永远被爱包围。</p>
            </div>
          </section>

          <footer class="footer">
            <button @click="playSurprise" class="action-btn">
              <span>开启惊喜</span>
            </button>
          </footer>
        </div>
      </transition>
    </main>

    <div class="music-icon" :class="{ 'rotate': isPlaying }" @click="toggleMusic">
      🎵
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showContent = ref(true);
const isPlaying = ref(false);
const canvasRef = ref(null);

// 粒子背景逻辑
onMounted(() => {
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = Math.random() * 0.5 + 0.2;
      this.opacity = Math.random();
    }
    update() {
      this.y -= this.speedY;
      if (this.y < 0) this.y = canvas.height;
    }
    draw() {
      ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < 100; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
});

const playSurprise = () => {
  alert('✨ 愿你眼里有星辰，心中有山海，生日快乐！');
};

const toggleMusic = () => {
  isPlaying.value = !isPlaying.value;
};
</script>

<style scoped>
/* 核心样式 */
.birthday-container {
  margin-left: 0;
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0a0a0a; /* 极简黑 */
  color: #fff;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

.bg-gradient {
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, #1a1a2e 0%, #000 70%);
  animation: drift 20s infinite linear;
}

#canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.content {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
}

.glass-card {
  width: 100%;
  max-width: 320px;
  padding: 40px 30px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
}

.header {
  margin-bottom: 40px;
}

.date {
  font-size: 12px;
  letter-spacing: 4px;
  color: rgba(255, 255, 255, 0.5);
}

.line {
  width: 40px;
  height: 1px;
  background: #d4af37; /* 金色 */
  margin: 10px auto;
}

.title {
  font-size: 2.2rem;
  font-weight: 200;
  margin: 0;
  background: linear-gradient(to right, #fff, #d4af37, #fff);
  -webkit-background-clip: text;
  color: transparent;
  animation: shimmer 3s infinite;
}

.name {
  margin-top: 10px;
  font-weight: 300;
  letter-spacing: 2px;
}

.message-box {
  margin: 40px 0;
  font-size: 14px;
  line-height: 2.5;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
}

.action-btn {
  background: transparent;
  border: 1px solid #d4af37;
  color: #d4af37;
  padding: 12px 35px;
  border-radius: 30px;
  font-size: 14px;
  letter-spacing: 2px;
  transition: all 0.3s;
}

.action-btn:active {
  background: #d4af37;
  color: #000;
}

.music-icon {
  position: absolute;
  top: 30px;
  right: 30px;
  z-index: 100;
  font-size: 24px;
  opacity: 0.7;
}

.rotate {
  animation: rotating 3s linear infinite;
}

/* 动画 */
@keyframes drift {
  from { transform: translate(-25%, -25%) rotate(0deg); }
  to { transform: translate(-25%, -25%) rotate(360deg); }
}

@keyframes shimmer {
  0% { background-position: -200%; }
  100% { background-position: 200%; }
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fade-up-enter-active {
  transition: all 1.5s ease-out;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
</style>