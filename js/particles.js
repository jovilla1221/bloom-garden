/* Ambient Particles — soft pollen, falling petals, sparkle bursts */
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 180;
    this.wind = 0.25;
  }

  addAmbientPollen(width, height) {
    if (this.particles.length < this.maxParticles) {
      this.particles.push({
        type: 'firefly',
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.8,
        color: ['#ffe4f0', '#ffd6e0', '#fff5f0', '#f0d9ff', '#fff0d9'][Math.floor(Math.random() * 5)],
        alpha: Math.random() * 0.5 + 0.15,
        pulseSpeed: Math.random() * 0.04 + 0.015
      });
    }
  }

  spawnPetalBurst(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 0.8;
      this.particles.push({
        type: 'petal',
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: Math.random() * 5 + 3,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        color: color,
        alpha: 1.0,
        life: 1.0,
        decay: Math.random() * 0.007 + 0.003
      });
    }
  }

  spawnSparkle(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.8 + 0.5;
      this.particles.push({
        type: 'sparkle',
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.6,
        size: Math.random() * 3 + 1.5,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
        color: ['#fff5e6', '#ffe4f0', '#ffd6e0'][Math.floor(Math.random() * 3)],
        alpha: 1.0,
        life: 1.0,
        decay: Math.random() * 0.01 + 0.005
      });
    }
  }

  update(width, height) {
    if (Math.random() < 0.3) this.addAmbientPollen(width, height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (p.type === 'firefly') {
        p.x += p.vx + this.wind * 0.3;
        p.y += p.vy;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.02;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      } else if (p.type === 'petal') {
        p.x += p.vx + this.wind;
        p.y += p.vy + 0.3;
        p.rotation += p.vRot;
        p.life -= p.decay;
        p.alpha = Math.max(0, p.life);
        if (p.life <= 0 || p.y > height + 20) this.particles.splice(i, 1);
      } else if (p.type === 'sparkle') {
        p.x += p.vx + this.wind * 0.5;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.life -= p.decay;
        p.alpha = Math.max(0, p.life);
        if (p.life <= 0) this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      if (p.type === 'firefly') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.type === 'petal') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'sparkle') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.3, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.3, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }
}

window.particleSystem = new ParticleSystem();