const Gesture = {
  analyze: (hands, player, spells) => {
    if (hands.length > 0) {
      let landmarks = hands[0].keypoints;

      // 指尖與指節判定 (ml5 v1 索引)
      let thumbUp = landmarks[4].y < landmarks[3].y;
      let indexUp = landmarks[8].y < landmarks[6].y;
      let middleUp = landmarks[12].y < landmarks[10].y;
      let ringUp = landmarks[16].y < landmarks[14].y;
      let pinkyUp = landmarks[20].y < landmarks[18].y;

      // 比讚判定：只有拇指伸直
      player.isThumbsUp = thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp;

      // 目標座標映射
      let rawTx = map(landmarks[8].x, 0, CONFIG.VIDEO_W, 0, width);
      let rawTy = map(landmarks[8].y, 0, CONFIG.VIDEO_H, 0, height);

      // --- 自動鎖定邏輯 ---
      let closest = null;
      let minDist = 80; // 鎖定靈敏度（半徑 80 像素內自動吸附）

      // 檢查一般小怪
      for (let e of enemies) {
        let d = dist(rawTx, rawTy, e.x, e.y);
        if (d < minDist) { minDist = d; closest = e; }
      }
      // 檢查 Boss
      if (boss && !boss.isDead()) {
        let d = dist(rawTx, rawTy, boss.x, boss.y);
        if (d < minDist) { minDist = d; closest = boss; }
      }

      let tx = closest ? closest.x : rawTx;
      let ty = closest ? closest.y : rawTy;
      player.lockedTarget = closest;
      player.targetX = tx;
      player.targetY = ty;

      // 1. 食指 Pointing -> 火球
      if (indexUp && !middleUp && !ringUp && !pinkyUp) {
        // 只在非教學模式，或是教學步驟為 1 (火球) 時允許觸發
        if (gameState !== 'TUTORIAL' || tutorialStep === 1) {
          if (player.mp >= 5 && frameCount % 30 === 0) {
            spells.push(new Spell(player.x, player.y, tx, ty, 'FIRE', player.lockedTarget));
            player.mp -= 5;
          }
        }
      }
      // 2. YA Peace -> 冰箭
      else if (indexUp && middleUp && !ringUp && !pinkyUp) {
        // 只在非教學模式，或是教學步驟為 2 (冰箭) 時允許觸發
        if (gameState !== 'TUTORIAL' || tutorialStep === 2) {
          if (player.mp >= 8 && frameCount % 40 === 0) {
            spells.push(new Spell(player.x, player.y, tx, ty, 'ICE'));
            player.mp -= 8;
          }
        }
      }
      // 3. 張開五指 Open Palm -> 雷電
      else if (indexUp && middleUp && ringUp && pinkyUp) {
        // 只在非教學模式，或是教學步驟為 3 (雷電) 時允許觸發
        if (gameState !== 'TUTORIAL' || tutorialStep === 3) {
          if (player.mp >= 30 && player.lightningCooldown === 0) {
            Gesture.castLightning(player);
            player.mp -= 30;
            player.lightningCooldown = 300; // 5秒冷卻
          }
        }
      }
    }
  },

  castLightning: (player) => {
    // 全屏雷電效果
    push();
    background(255);
    pop();
    for (let e of enemies) {
      e.takeDamage(40, 'LIGHTNING', player);
    }
  }
};