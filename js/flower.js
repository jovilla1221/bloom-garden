/* Procedural Plant & Flower Growth Engine — Lily & Peonies */
class Flower {
  constructor(startX, startY, targetHeight, species = 'lily', scaleMultiplier = 1.0) {
    this.startX = startX;
    this.startY = startY;
    this.targetHeight = targetHeight * scaleMultiplier;
    this.species = species;
    this.scale = scaleMultiplier;

    this.stemProgress = 0;
    this.bloomProgress = 0;
    this.growthSpeed = 0.018 + Math.random() * 0.01;
    this.bloomSpeed = 0.022 + Math.random() * 0.012;

    const curveOffset = (Math.random() - 0.5) * 60 * this.scale;
    this.controlX1 = this.startX + curveOffset;
    this.controlY1 = this.startY - this.targetHeight * 0.35;
    this.controlX2 = this.startX - curveOffset * 0.4;
    this.controlY2 = this.startY - this.targetHeight * 0.65;
    this.endX = this.startX + curveOffset * 0.6;
    this.endY = this.startY - this.targetHeight;

    this.currentX = this.startX;
    this.currentY = this.startY;

    this.leaves = [];
    const leafCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < leafCount; i++) {
      this.leaves.push({
        atStemRatio: 0.25 + (i / leafCount) * 0.55,
        side: i % 2 === 0 ? 1 : -1,
        size: (10 + Math.random() * 8) * this.scale,
        angle: (Math.PI / 3.5 + Math.random() * 0.15) * (i % 2 === 0 ? 1 : -1)
      });
    }

    this.initSpeciesParams();
    this.soundPlayed = false;
    this.swayPhase = Math.random() * Math.PI * 2;
  }

  initSpeciesParams() {
    switch (this.species) {
      case 'lily':
        this.petalCount = 6;
        this.petalColor = '#fff0f5';
        this.petalInnerColor = '#ffe4ec';
        this.centerColor = '#fff9fa';
        this.stamenColor = '#d4a574';
        this.stigmaColor = '#c97a8a';
        this.radius = 36 * this.scale;
        this.stemColor = '#3a5a40';
        this.leafColor = '#4a7c59';
        this.leafVeinColor = '#5db37e';
        break;
      case 'peony':
        this.petalCount = 18;
        this.petalColor = '#ffb7c5';
        this.petalInnerColor = '#ffd1dc';
        this.petalDeepColor = '#e88da8';
        this.centerColor = '#fff0f3';
        this.stamenColor = '#ffd9a8';
        this.stigmaColor = '#f4a6b8';
        this.radius = 42 * this.scale;
        this.stemColor = '#2d5a3d';
        this.leafColor = '#3d7a4f';
        this.leafVeinColor = '#6ec67b';
        break;
      default:
        this.petalColor = '#fff0f5';
        this.radius = 30 * this.scale;
        this.stemColor = '#3a5a40';
        this.leafColor = '#4a7c59';
    }
  }

  getBezierPoint(t) {
    const invT = 1 - t;
    const x = Math.pow(invT, 3) * this.startX +
              3 * Math.pow(invT, 2) * t * this.controlX1 +
              3 * invT * Math.pow(t, 2) * this.controlX2 +
              Math.pow(t, 3) * this.endX;
    const y = Math.pow(invT, 3) * this.startY +
              3 * Math.pow(invT, 2) * t * this.controlY1 +
              3 * invT * Math.pow(t, 2) * this.controlY2 +
              Math.pow(t, 3) * this.endY;
    return { x, y };
  }

  update(time) {
    if (this.stemProgress < 1.0) {
      this.stemProgress += this.growthSpeed;
      if (this.stemProgress > 1.0) this.stemProgress = 1.0;
      const p = this.getBezierPoint(this.stemProgress);
      this.currentX = p.x;
      this.currentY = p.y;
    } else if (this.bloomProgress < 1.0) {
      if (!this.soundPlayed) {
        window.soundEngine.playBloomSound();
        window.particleSystem.spawnPetalBurst(this.endX, this.endY, this.petalColor, 10);
        this.soundPlayed = true;
      }
      this.bloomProgress += this.bloomSpeed;
      if (this.bloomProgress > 1.0) this.bloomProgress = 1.0;
    }
  }

  draw(ctx, time) {
    ctx.save();

    const windSway = Math.sin(time * 0.0008 + this.swayPhase) * 8 * this.scale;
    const stemDrawnProgress = this.stemProgress;

    ctx.lineWidth = 3 * this.scale;
    ctx.strokeStyle = this.stemColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const steps = Math.max(8, Math.floor(stemDrawnProgress * 28));
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * stemDrawnProgress;
      const pt = this.getBezierPoint(t);
      const swayX = pt.x + windSway * t * 0.6;
      if (i === 0) ctx.moveTo(swayX, pt.y);
      else ctx.lineTo(swayX, pt.y);
    }
    ctx.stroke();

    for (const leaf of this.leaves) {
      if (stemDrawnProgress >= leaf.atStemRatio) {
        const leafProgress = Math.min(1.0, (stemDrawnProgress - leaf.atStemRatio) * 3.5);
        const pt = this.getBezierPoint(leaf.atStemRatio);
        const swayX = pt.x + windSway * leaf.atStemRatio * 0.6;
        this.drawLeaf(ctx, swayX, pt.y, leaf.angle, leaf.size * leafProgress, leaf.side, time);
      }
    }

    if (stemDrawnProgress >= 0.9) {
      const headSwayX = this.endX + windSway * 0.8;
      this.drawFlowerHead(ctx, headSwayX, this.endY, time);
    }

    ctx.restore();
  }

  drawLeaf(ctx, x, y, angle, size, side, time) {
    ctx.save();
    ctx.translate(x, y);
    const leafSway = Math.sin(time * 0.0012 + this.swayPhase + 1) * 0.15 * side;
    ctx.rotate(angle * side + leafSway);
    ctx.fillStyle = this.leafColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.45 * side, -size * 0.35, size * 0.9 * side, 0);
    ctx.quadraticCurveTo(size * 0.45 * side, size * 0.35, 0, 0);
    ctx.fill();
    ctx.strokeStyle = this.leafVeinColor;
    ctx.lineWidth = 1 * this.scale;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.8 * side, 0);
    ctx.stroke();
    ctx.restore();
  }

  drawFlowerHead(ctx, x, y, time) {
    ctx.save();
    ctx.translate(x, y);
    const currentRadius = this.radius * (0.15 + 0.85 * this.bloomProgress);
    const bloomPhase = this.bloomProgress;

    // Fast ambient glow without costly canvas shadowBlur
    if (bloomPhase > 0.1) {
      const glowGrad = ctx.createRadialGradient(0, 0, currentRadius * 0.2, 0, 0, currentRadius * 1.3);
      glowGrad.addColorStop(0, 'rgba(255, 180, 205, 0.25)');
      glowGrad.addColorStop(1, 'rgba(255, 180, 205, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, currentRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    switch (this.species) {
      case 'lily':
        this.drawLily(ctx, currentRadius, bloomPhase, time);
        break;
      case 'peony':
        this.drawPeony(ctx, currentRadius, bloomPhase, time);
        break;
      default:
        this.drawRadialPetals(ctx, currentRadius, bloomPhase);
    }
    ctx.restore();
  }

  drawLily(ctx, r, bloomPhase, time) {
    const count = 6;
    const angleStep = (Math.PI * 2) / count;
    const recurveAmount = 0.35 * bloomPhase;

    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      ctx.save();
      ctx.rotate(angle);
      const petalCurve = recurveAmount * (0.8 + Math.sin(time * 0.001 + i) * 0.2);

      ctx.fillStyle = this.petalInnerColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        r * 0.15, -r * petalCurve,
        r * 0.6, -r * (0.9 + petalCurve * 0.3),
        r, 0
      );
      ctx.bezierCurveTo(
        r * 0.6, r * (0.9 + petalCurve * 0.3),
        r * 0.15, r * petalCurve,
        0, 0
      );
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.ellipse(r * 0.35, 0, r * 0.22, r * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const stamenCount = 6;
    for (let i = 0; i < stamenCount; i++) {
      const angle = i * (Math.PI * 2 / stamenCount) + 0.3;
      const len = r * 0.7 * bloomPhase;
      ctx.save();
      ctx.rotate(angle);
      ctx.strokeStyle = this.stamenColor;
      ctx.lineWidth = 2.5 * this.scale * bloomPhase;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -len);
      ctx.stroke();

      ctx.fillStyle = this.stigmaColor;
      ctx.beginPath();
      ctx.arc(0, -len, 3.5 * this.scale * bloomPhase, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = this.centerColor;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.18 * bloomPhase, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPeony(ctx, r, bloomPhase, time) {
    const layers = 4;
    for (let l = layers; l >= 1; l--) {
      const layerRadius = (r * l) / layers;
      const count = 4 + l * 2;
      const angleStep = (Math.PI * 2) / count;
      const layerOffset = l * 0.25;

      for (let i = 0; i < count; i++) {
        const angle = i * angleStep + layerOffset;
        ctx.save();
        ctx.rotate(angle);
        const petalR = layerRadius * 0.48;
        const depth = (layers - l + 1) / layers;

        const petalColor = l % 2 === 0 ? this.petalColor : this.petalDeepColor;
        ctx.fillStyle = petalColor;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
          petalR * 0.2, -petalR * 0.4,
          petalR, -petalR * 0.25,
          petalR * 0.95, 0
        );
        ctx.bezierCurveTo(
          petalR, petalR * 0.25,
          petalR * 0.2, petalR * 0.4,
          0, 0
        );
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.beginPath();
        ctx.ellipse(petalR * 0.3, 0, petalR * 0.2, petalR * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.fillStyle = this.centerColor;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.22 * bloomPhase, 0, Math.PI * 2);
    ctx.fill();

    const stamenCount = 14;
    for (let i = 0; i < stamenCount; i++) {
      const angle = i * (Math.PI * 2 / stamenCount);
      const rad = r * 0.15 * bloomPhase;
      const sx = Math.cos(angle) * rad;
      const sy = Math.sin(angle) * rad;
      ctx.fillStyle = this.stamenColor;
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5 * this.scale * bloomPhase, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawRadialPetals(ctx, r, bloomPhase) {
    const count = this.petalCount;
    const angleStep = (Math.PI * 2) / count;
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = this.petalColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(r * 0.5, -r * 0.4, r, 0);
      ctx.quadraticCurveTo(r * 0.5, r * 0.4, 0, 0);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = this.centerColor;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28 * bloomPhase, 0, Math.PI * 2);
    ctx.fill();
  }
}

window.Flower = Flower;