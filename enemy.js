class Enemy {
  constructor(difficulty = 1.0) {
    this.active = true;
    // 隨機從畫面邊緣出現
    let edge = floor(random(4));
    if (edge === 0) { this.x = random(width); this.y = -30; }
    else if (edge === 1) { this.x = random(width); this.y = height + 30; }
    else if (edge === 2) { this.x = -30; this.y = random(height); }
    else { this.x = width + 30; this.y = random(height); }

    // 隨機怪物種類
    let r = random();
    if (r < 0.4) this.init('FIRE_SLIME', color(255, 50, 0), 30, 0.8 * difficulty);
    else if (r < 0.8) this.init('ICE_SLIME', color(0, 150, 255), 30, 1.2 * difficulty);
    else this.init('GHOST', color(150, 50, 255), 50, 2.0 * difficulty);
    
    this.size = 60; // 怪物體型加大
  }

  init(type, col, hp, speed) {
    this.type = type;
    this.col = col;
    this.hp = hp;
    this.speed = speed;
  }

  update(player) {
    let angle = atan2(player.y - this.y, player.x - this.x);
    this.x += cos(angle) * this.speed;
    this.y += sin(angle) * this.speed;
  }

  display() {
    push();
    fill(this.col);
    noStroke();
    if (this.type === 'GHOST') {
      ellipse(this.x, this.y, this.size, this.size * 1.2);
      fill(255, 100);
      ellipse(this.x - 8, this.y - 5, 5, 5);
      ellipse(this.x + 8, this.y - 5, 5, 5);
    } else {
      arc(this.x, this.y + 10, this.size, this.size, PI, TWO_PI);
      ellipse(this.x, this.y + 10, this.size, 10);
    }
    pop();
  }

  takeDamage(amt, spellType, player) {
    let multiplier = 1;
    if (this.type === 'FIRE_SLIME' && spellType === 'ICE') multiplier = 2;
    if (this.type === 'ICE_SLIME' && spellType === 'FIRE') multiplier = 2;
    if (this.type === 'GHOST' && spellType === 'LIGHTNING') multiplier = 3;

    this.hp -= amt * multiplier;
    if (this.hp <= 0) {
      this.active = false;
      let c = player.registerKill();
      score += 10 * (c > 10 ? 10 : (c > 5 ? 5 : (c > 2 ? 2 : 1)));
      ParticleSystem.spawnExplosion(this.x, this.y, this.col);
    }
  }

  checkCollision(player) {
    return dist(this.x, this.y, player.x, player.y) < (this.size/2 + player.r/2);
  }

  isOffScreen() {
    return (this.x < -100 || this.x > width+100 || this.y < -100 || this.y > height+100);
  }
}

const ParticleSystem = {
  spawnExplosion: (x, y, col) => {
    for (let i = 0; i < 15; i++) {
      if (typeof Particle !== 'undefined') {
        particles.push(new Particle(x, y, col));
      }
    }
  }
};