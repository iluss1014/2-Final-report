// 遊戲全域配置
const CONFIG = {
  MP_REGEN: 0.16,             // 每幀恢復 MP (約每秒 10)
  BOSS_TIME: 60000,          // 60秒後 Boss 出現
  COMBO_TIMEOUT: 3000,       // 3秒內擊殺算 Combo
  VIDEO_W: 320,
  VIDEO_H: 240
};

let video;
let handpose;
let hands = [];
let gameState = 'START'; // START, PLAYING, BOSS, GAMEOVER
let player;
let enemies = [];
let spells = [];
let particles = [];
let boss = null;
let score = 0;
let maxCombo = 0;
let gameStartTime;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 初始化攝影機
  video = createCapture(VIDEO, { flipped: true });
  video.size(CONFIG.VIDEO_W, CONFIG.VIDEO_H);
  video.hide();

  // 初始化 HandPose
  handpose = ml5.handPose(video, { runtime: "tfjs" }, () => {
    console.log("Model Ready");
    // 確保模型準備好後再啟動辨識，避免 estimateHands 報錯
    handpose.detectStart(video, results => { hands = results; });
  });

  player = new Player();
}

function draw() {
  background(20);
  
  // 繪製半透明攝影機背景
  push();
  tint(255, 40);
  let s = max(width / video.width, height / video.height);
  image(video, (width - video.width * s) / 2, (height - video.height * s) / 2, video.width * s, video.height * s);
  pop();

  if (gameState === 'START') {
    UI.drawStartScreen();
  } else if (gameState === 'PLAYING' || gameState === 'BOSS') {
    runGame();
  } else if (gameState === 'GAMEOVER') {
    UI.drawGameOver(score, maxCombo);
  }
}

function runGame() {
  player.update();
  player.display();

  // 手勢辨識與施法
  Gesture.analyze(hands, player, spells);

  // 繪製瞄準準心 (傳入 player 物件以判斷 MP 狀態)
  UI.drawCrosshair(player);

  // Boss 出現判定
  if (gameState === 'PLAYING' && millis() - gameStartTime > CONFIG.BOSS_TIME) {
    gameState = 'BOSS';
    boss = new Boss();
  }

  // 怪物生成 (一般模式)
  if (gameState === 'PLAYING' && frameCount % 60 === 0) {
    let timeElapsed = millis() - gameStartTime;
    // 難度系數：每過 30 秒增加 0.2 倍速度，基礎為 1.0
    let difficulty = 1.0 + (timeElapsed / 30000) * 0.2;
    enemies.push(new Enemy(difficulty));
  }

  // 更新與繪製 Boss
  if (boss) {
    boss.update(player, spells);
    boss.display();
    if (boss.isDead()) {
      score += 500;
      gameState = 'GAMEOVER';
    }
  }

  // 怪物邏輯
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update(player);
    enemies[i].display();
    if (enemies[i].checkCollision(player)) {
      player.takeDamage(10);
      enemies.splice(i, 1);
    } else if (enemies[i].isOffScreen() || !enemies[i].active) {
      enemies.splice(i, 1);
    }
  }

  // 法術與碰撞
  for (let i = spells.length - 1; i >= 0; i--) {
    spells[i].update();
    spells[i].display();
    spells[i].checkHit(enemies, boss, player);
    if (!spells[i].active || spells[i].isOffScreen()) spells.splice(i, 1);
  }

  // 特效
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isFinished()) particles.splice(i, 1);
  }

  UI.drawHUD(player, score);
}

function mousePressed() {
  if (gameState === 'START') {
    gameState = 'PLAYING';
    gameStartTime = millis();
    score = 0;
    maxCombo = 0;
    player.reset();
    enemies = [];
    spells = [];
  } else if (gameState === 'GAMEOVER') {
    gameState = 'START';
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
