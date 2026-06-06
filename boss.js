class Boss {
  constructor() {
    this.x = width / 2;
    this.y = -200;
    this.targetY = 150;
    this.hp = 500;
    this.maxHp = 500;
    this.r = 150;
    this.lastAttack = 0;
  }

  update(player, spells) {
    // 進場動畫
    if (this.y < this.targetY) this.y += 2;
    
    // 左右移動 AI
    this.x = width/2 + sin(frameCount * 0.02) * 200;

    // 攻擊機制
    if (millis() - this.lastAttack > 2500) {
      spells.push(new Spell(this.x, this.y, player.x, player.y, 'BOSS_FIRE'));
      this.lastAttack = millis();
    }

    // 撞擊玩家判定
    if (dist(this.x, this.y, player.x, player.y) < this.r/2 + player.r/2) {
      player.takeDamage(1); // 觸碰持續扣血
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    // 繪製遠古魔龍
    fill(50, 120, 50);
    ellipse(0, 0, this.r, this.r * 0.7);
    fill(30, 80, 30);
    triangle(-60, -30, 60, -30, 0, -100); // 龍頭
    fill(255, 0, 0);
    ellipse(-20, -50, 10, 10); // 眼睛
    ellipse(20, -50, 10, 10);
    pop();
    
    UI.drawBossHealth(this.hp, this.maxHp);
  }

  takeDamage(amt) {
    this.hp -= amt;
    if (this.hp <= 0) {
      for(let i=0; i<100; i++) particles.push(new Particle(this.x, this.y, color(255, 200, 0)));
    }
  }

  isDead() {
    return this.hp <= 0;
  }
}