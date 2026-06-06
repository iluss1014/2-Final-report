const Gesture = {
  analyze: (hands, player, spells) => {
    if (hands.length > 0) {
      let landmarks = hands[0].keypoints;

      // 指尖與指節判定 (ml5 v1 索引)
      let indexUp = landmarks[8].y < landmarks[6].y;
      let middleUp = landmarks[12].y < landmarks[10].y;
      let ringUp = landmarks[16].y < landmarks[14].y;
      let pinkyUp = landmarks[20].y < landmarks[18].y;

      // 目標座標映射
      let tx = map(landmarks[8].x, 0, CONFIG.VIDEO_W, width, 0); // 反轉 X 以對應鏡像畫面
      let ty = map(landmarks[8].y, 0, CONFIG.VIDEO_H, 0, height);
      player.targetX = tx;
      player.targetY = ty;

      // 1. 食指 Pointing -> 火球
      if (indexUp && !middleUp && !ringUp && !pinkyUp) {
        if (player.mp >= 5 && frameCount % 30 === 0) {
          spells.push(new Spell(player.x, player.y, tx, ty, 'FIRE'));
          player.mp -= 5;
        }
      }
      // 2. YA Peace -> 冰箭
      else if (indexUp && middleUp && !ringUp && !pinkyUp) {
        if (player.mp >= 8 && frameCount % 40 === 0) {
          spells.push(new Spell(player.x, player.y, tx, ty, 'ICE'));
          player.mp -= 8;
        }
      }
      // 3. 張開五指 Open Palm -> 雷電
      else if (indexUp && middleUp && ringUp && pinkyUp) {
        if (player.mp >= 30 && player.lightningCooldown === 0) {
          Gesture.castLightning(player);
          player.mp -= 30;
          player.lightningCooldown = 300; // 5秒冷卻
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