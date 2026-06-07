const UI = {
  drawHUD: (player, score, level) => {
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
    
    fill(255, 200, 0);
    text(`Level: ${level}`, 20, 130);
    
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

  drawCrosshair: (player) => {
    let x = player.targetX;
    let y = player.targetY;

    push();
    noFill();
    translate(x, y);
    strokeWeight(3);

    // 根據狀態設定顏色
    if (player.lockedTarget) {
      stroke(255, 255, 0, 255); // 鎖定中：亮黃色
      rotate(frameCount * 0.1); // 鎖定時旋轉
      ellipse(0, 0, 50);        // 鎖定時圓圈變大一點
    } else if (player.mp < 5) {
      stroke(255, 0, 0, 255); // 警告紅色
    } else {
      stroke(0, 255, 0, 200); // 正常綠色
    }

    if (!player.lockedTarget) {
      ellipse(0, 0, 40);
    }
    
    // 繪製準心十字線
    line(-25, 0, 25, 0);
    line(0, -25, 0, 25);
    pop();
  },

  drawTutorial: (step, player) => {
    background(0, 150);
    fill(255);
    textAlign(CENTER);
    textSize(32);
    
    let msg = "";
    if (step === 0) msg = "第一步：移動食指，將準心移到畫面中央";
    else if (step === 1) msg = "第二步：伸出食指 (其餘收起)，發射火球";
    else if (step === 2) msg = "第三步：比出 YA 手勢，發射冰箭";
    else if (step === 3) msg = "最後：張開五指，釋放全螢幕雷電！";

    text("--- 魔法學徒訓練 ---", width/2, height/2 - 100);
    textSize(24);
    text(msg, width/2, height/2);
    
    // 提示手勢圖示 (文字版)
    textSize(18);
    fill(200);
    text("練習完畢後將自動開始第一關", width/2, height - 50);
  },

  drawLevelUp: (level) => {
    push();
    fill(255, 255, 0);
    textAlign(CENTER);
    textSize(80);
    let displayLevel = level > 3 ? "FINAL BOSS" : "LEVEL " + level;
    text(displayLevel, width/2, height/2);
    
    textSize(30);
    fill(255);
    text("Prepare for Battle...", width/2, height/2 + 60);
    pop();
  }
};