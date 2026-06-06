class Spell {
  constructor(sx, sy, tx, ty, type, target = null) {
    this.x = sx;
    this.y = sy;
    this.type = type;
    this.active = true;
    this.target = target; // 記錄追蹤目標
    this.r = 40; // 玩家子彈判定加大

    let angle = atan2(ty - sy, tx - sx);
    let speed = (type === 'FIRE') ? 8 : 12;
    if (type === 'BOSS_FIRE') speed = 7;

    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
    
    this.damage = (type === 'FIRE') ? 40 : (type === 'ICE' ? 30 : 0);
    if (type === 'BOSS_FIRE') this.damage = 15;
  }

  update() {
    // 火球追蹤邏輯 (只有 FIRE 類型且有目標時觸發)
    if (this.type === 'FIRE' && this.target) {
      // 檢查目標是否仍然有效 (Enemy 使用 active, Boss 使用 hp > 0)
      let isTargetAlive = (this.target.active !== false) && (this.target.hp > 0);
      
      if (isTargetAlive) {
        // 計算朝向目標的新角度
        let angle = atan2(this.target.y - this.y, this.target.x - this.x);
        let speed = 8; // 保持原本設定的火球速度
        this.vx = cos(angle) * speed;
        this.vy = sin(angle) * speed;
      }
    }

    this.x += this.vx;
    this.y += this.vy;
    
    // 拖尾粒子
    if (this.type === 'FIRE') {
      particles.push(new Particle(this.x, this.y, color(255, 150, 0), 2));
    } else if (this.type === 'ICE') {
      particles.push(new Particle(this.x, this.y, color(150, 255, 255), 1));
    }
  }

  display() {
    push();
    noStroke();
    if (this.type === 'FIRE') {
      fill(255, 100, 0);
      ellipse(this.x, this.y, this.r);
    } else if (this.type === 'ICE') {
      fill(100, 200, 255);
      push();
      translate(this.x, this.y);
      rotate(atan2(this.vy, this.vx));
      triangle(30, 0, -15, -12, -15, 12); // 冰箭外型同步加大
      pop();
    } else if (this.type === 'BOSS_FIRE') {
      fill(255, 0, 100);
      ellipse(this.x, this.y, 80); // Boss 火球加大
    }
    pop();
  }

  checkHit(enemies, boss, player) {
    if (this.type === 'BOSS_FIRE') {
      if (dist(this.x, this.y, player.x, player.y) < 65) { // 調整 Boss 碰撞半徑
        player.takeDamage(this.damage);
        this.active = false;
      }
      return;
    }

    for (let e of enemies) {
      if (dist(this.x, this.y, e.x, e.y) < (this.r + e.size)/2) {
        e.takeDamage(this.damage, this.type, player);
        if (this.type !== 'ICE') this.active = false; // 火球不穿透，冰箭穿透
      }
    }

    if (boss && dist(this.x, this.y, boss.x, boss.y) < (this.r + boss.r)/2) {
      boss.takeDamage(this.damage);
      this.active = false;
    }
  }

  isOffScreen() {
    return (this.x < -50 || this.x > width + 50 || this.y < -50 || this.y > height + 50);
  }
}