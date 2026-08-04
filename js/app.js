/* Bloom Garden — tap to grow lilies & peonies, soft dreamy vibe */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gardenCanvas');
  const ctx = canvas.getContext('2d');

  let flowers = [];
  let sizeMultiplier = 1.0;
  let isPointerDown = false;
  let lastTapTime = 0;

  const startOverlay = document.getElementById('startOverlay');
  const startBtn = document.getElementById('startBtn');
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bgMusic');
  const btnClear = document.getElementById('btnClear');
  const btnAuto = document.getElementById('btnAuto');
  const btnShot = document.getElementById('btnShot');

  let musicOn = false;
  let musicUnlocked = false;
  let autoInterval = null;

  function pickSpecies() {
    return Math.random() < 0.5 ? 'lily' : 'peony';
  }

  function startMusic() {
    if (musicOn) return;
    bgMusic.volume = 0.32;
    bgMusic.play().then(() => { musicOn = true; updateMusicIcon(); }).catch(() => {});
  }

  function updateMusicIcon() {
    musicToggle.classList.toggle('muted', !musicOn);
    musicToggle.innerHTML = musicOn
      ? '<i class="fa-solid fa-volume-high"></i>'
      : '<i class="fa-solid fa-volume-xmark"></i>';
  }

  function toggleMusic() {
    if (!musicOn) startMusic();
    else { bgMusic.pause(); musicOn = false; updateMusicIcon(); }
  }

  function showUI() {
    startOverlay.classList.add('hidden');
    startMusic();
    musicUnlocked = true;
  }

  startBtn.addEventListener('click', showUI);
  musicToggle.addEventListener('click', toggleMusic);
  window.addEventListener('pointerdown', () => { if (!musicUnlocked) showUI(); }, { once: true });

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function plantFlower(x, y, count = 1) {
    const targetHeight = Math.random() * 170 + 110;
    const groundY = window.innerHeight + 30;
    for (let i = 0; i < count; i++) {
      const jx = x + (Math.random() - 0.5) * 40;
      const flower = new Flower(jx, groundY, targetHeight, pickSpecies(), sizeMultiplier);
      flowers.push(flower);
    }
  }

  function handleTap(x, y) {
    const now = Date.now();
    const isTap = now - lastTapTime > 140;
    lastTapTime = now;

    if (isTap) {
      plantFlower(x, y, 1);
      window.particleSystem.spawnSparkle(x, y);
    } else {
      plantFlower(x, y, 2);
    }
  }

  window.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.cmd-bar') || e.target.closest('#musicToggle')) return;
    isPointerDown = true;
    handleTap(e.clientX, e.clientY);
  });

  window.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    handleTap(e.clientX, e.clientY);
  });

  window.addEventListener('pointerup', () => { isPointerDown = false; });

  // --- Commands ---
  btnClear.addEventListener('click', () => {
    flowers = [];
    window.particleSystem.particles = [];
  });

  btnAuto.addEventListener('click', () => {
    if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
      btnAuto.classList.remove('on');
      btnAuto.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i><span>Otomatis</span>';
    } else {
      btnAuto.classList.add('on');
      btnAuto.innerHTML = '<i class="fa-solid fa-pause"></i><span>Berhenti</span>';
      autoInterval = setInterval(() => {
        const rx = Math.random() * window.innerWidth;
        plantFlower(rx, window.innerHeight * 0.3, 1);
      }, 400);
    }
  });

  btnShot.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'BloomGarden-' + Date.now() + '.png';
    link.href = dataUrl;
    link.click();
  });

  function animate() {
    const time = performance.now();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < flowers.length; i++) {
      flowers[i].update(time);
      flowers[i].draw(ctx, time);
    }
    if (flowers.length > 300) flowers.shift();

    window.particleSystem.update(window.innerWidth, window.innerHeight);
    window.particleSystem.draw(ctx);

    requestAnimationFrame(animate);
  }
  animate();
});