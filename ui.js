const UI = {
  drawHUD: (player, score) => {
    // HP
    fill(50);
    rect(20, 20, 200, 20);
    fill(255, 0, 0);
    rect(20, 20, map(player.hp, 0, 100, 0, 200), 20);
    
    // MP
    fill(50);
    rect(20, 50, 200, 20);
    fill(0, 150, 255);
    rect(20, 50, map(player.mp, 0, 100, 0, 200), 20);

    // 文字
    fill(255);
    textSize(24);
    textAlign(LEFT);
    text(`Score: ${score}`, 20, 100);
    
    if (player.combo > 1) {
      fill(255, 255, 0);
      textAlign(CENTER);
      textSize(40);
      text(`${player.combo} COMBO!`, width/2, 100);
    }
  },

  drawStartScreen: () => {
    background(0, 200);
    fill(255);
    textAlign(CENTER);
    textSize(60);
    text("Wizard Gesture Battle", width/2, height/2 - 100);
    textSize(20);
    text("操作說明：\n1. 食指：火球 (5MP)\n2. YA手勢：冰箭 (8MP)\n3. 五指張開：雷電 (30MP)\n\n點擊畫面開始遊戲", width/2, height/2 + 20);
  },

  drawGameOver: (finalScore, finalCombo) => {
    background(0, 220);
    fill(255);
    textAlign(CENTER);
    textSize(80);
    fill(255, 50, 50);
    text("GAME OVER", width/2, height/2 - 50);
    fill(255);
    textSize(30);
    text(`Final Score: ${finalScore}`, width/2, height/2 + 30);
    text(`Max Combo: ${finalCombo}`, width/2, height/2 + 70);
    textSize(20);
    text("點擊畫面重新開始", width/2, height/2 + 130);
  },

  drawBossHealth: (hp, max) => {
    fill(50);
    rect(width/2 - 200, 30, 400, 25);
    fill(200, 0, 255);
    rect(width/2 - 200, 30, map(hp, 0, max, 0, 400), 25);
    fill(255);
    textSize(14);
    text("遠古魔龍 ANCIENT DRAGON", width/2, 48);
  },

  drawCrosshair: (x, y) => {
    push();
    noFill();
    stroke(0, 255, 0, 150); // 綠色半透明
    strokeWeight(2);
    ellipse(x, y, 30);
    line(x - 20, y, x + 20, y);
    line(x, y - 20, x, y + 20);
    pop();
  }
};