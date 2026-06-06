class Player {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.r = 50;
    this.targetX = width / 2;
    this.targetY = height / 2;
    this.reset();
  }

  reset() {
    this.hp = 100;
    this.mp = 100;
    this.combo = 0;
    this.targetX = width / 2;
    this.targetY = height / 2;
    this.lastKillTime = 0;
    this.lightningCooldown = 0;
  }

  update() {
    // MP 自然恢復
    this.mp = min(100, this.mp + CONFIG.MP_REGEN);
    
    // 冷卻計算
    if (this.lightningCooldown > 0) this.lightningCooldown--;

    // Combo 過時判定
    if (millis() - this.lastKillTime > CONFIG.COMBO_TIMEOUT) {
      this.combo = 0;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    noStroke();
    // 繪製魔法師身體
    fill(100, 100, 255);
    triangle(-25, 30, 25, 30, 0, -35);
    // 頭部
    fill(255, 220, 200);
    ellipse(0, -15, 20, 20);
    // 帽子
    fill(50);
    triangle(-20, -20, 20, -20, 0, -50);
    pop();
  }

  takeDamage(amt) {
    this.hp -= amt;
    if (this.hp <= 0) {
      this.hp = 0;
      gameState = 'GAMEOVER';
    }
  }

  registerKill() {
    this.combo++;
    this.lastKillTime = millis();
    if (this.combo > maxCombo) maxCombo = this.combo;
    return this.combo;
  }
}