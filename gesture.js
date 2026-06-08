const Gesture = {
  analyze: (hands, player, spells) => {
    if (hands.length > 0) {
      let landmarks = hands[0].keypoints;
      if (gameState === 'TUTORIAL') tutorialHint = ""; // 偵測到手時預設清除提示

      // 指尖與指節判定 (ml5 v1 索引)
      // 優化：比較拇指尖(4)與拇指根部(2)以及食指根部(5)
      // 確保大拇指是真正豎起，而非握拳時橫跨在指縫間
      let thumbUp = landmarks[4].y < landmarks[2].y;
      let thumbExtended = landmarks[4].y < landmarks[5].y;

      let indexUp = landmarks[8].y < landmarks[6].y;
      let middleUp = landmarks[12].y < landmarks[10].y;
      let ringUp = landmarks[16].y < landmarks[14].y;
      let pinkyUp = landmarks[20].y < landmarks[18].y;

      // 比讚判定：拇指必須明顯高於根部與食指根部，且其他四指收起
      player.isThumbsUp = thumbUp && thumbExtended && !indexUp && !middleUp && !ringUp && !pinkyUp;

      // 目標座標映射
      let rawTx = map(landmarks[8].x, 0, CONFIG.VIDEO_W, 0, width);
      let rawTy = map(landmarks[8].y, 0, CONFIG.VIDEO_H, 0, height);

      // --- 優化：動量預測 (Extrapolation) 修正版 ---
      // 1. 先計算原始位移速度
      let vx = rawTx - player.prevRawX;
      let vy = rawTy - player.prevRawY;

      // 2. 關鍵修正：將「未預測」的原始座標存入紀錄，避免下一幀速度無限疊加
      player.prevRawX = rawTx;
      player.prevRawY = rawTy;

      // 3. 套用補償係數 (1.5倍是穩定且跟手的數值)
      rawTx += vx * 1.5;
      rawTy += vy * 1.5;

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

      // --- 教學模式動態提示邏輯 ---
      if (gameState === 'TUTORIAL') {
        if (tutorialStep === 1) { // 火球教學
          if (!indexUp) tutorialHint = "需伸出「食指」來施放火球";
          else if (middleUp || ringUp || pinkyUp) tutorialHint = "提示：請收起食指以外的手指";
        } else if (tutorialStep === 2) { // 冰箭教學
          if (!indexUp || !middleUp) tutorialHint = "請伸出「食指與中指」比出 YA";
          else if (ringUp || pinkyUp) tutorialHint = "提示：請收起無名指與小指";
        } else if (tutorialStep === 3) { // 雷電教學
          if (!indexUp || !middleUp || !ringUp || !pinkyUp) tutorialHint = "提示：請張開整個手掌";
        }
      }

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