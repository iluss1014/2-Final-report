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
let currentLevel = 1;
let tutorialStep = 0; // 0: 瞄準, 1: 火球, 2: 冰箭, 3: 雷電
let lastLevelUpTime = 0;
let lastThumbsUpState = false;
let tutorialHint = ""; // 教學模式的動態提示文字

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
  tint(255, 120); // 將透明度從 40 提高到 120，讓背景畫面更明亮清晰
  let s = max(width / video.width, height / video.height);
  image(video, (width - video.width * s) / 2, (height - video.height * s) / 2, video.width * s, video.height * s);
  pop();

  if (gameState === 'START') {
    UI.drawStartScreen();
  } else if (gameState === 'TUTORIAL') {
    runTutorial();
  } else if (gameState === 'LEVEL_UP') {
    runLevelUp();
  } else if (gameState === 'PLAYING' || gameState === 'BOSS') {
    runGame();
  } else if (gameState === 'GAMEOVER') {
    UI.drawGameOver(score, maxCombo);
  }
}

function runTutorial() {
  player.update();
  player.mp = 100; // 教學模式無限 MP
  Gesture.analyze(hands, player, spells);
  UI.drawCrosshair(player);

  // 在教學關中隨機生成 4 個不會動的敵人
  if (enemies.length < 4) {
    let e = new Enemy();
    e.x = random(100, width - 100);
    e.y = random(100, height - 100);
    e.speed = 0; // 教學模式怪物不動
    enemies.push(e);
  }

  handleEntities(false); // 執行繪製與碰撞，不更新怪物位移
  UI.drawTutorial(tutorialStep, player);

  // 檢查是否「比讚」跳過目前的教學步驟
  if (player.isThumbsUp && !lastThumbsUpState) {
    tutorialStep++;
    enemies = []; // 換步時刷新敵人
  }
  lastThumbsUpState = player.isThumbsUp;

  if (tutorialStep > 3) {
    gameState = 'LEVEL_UP';
    currentLevel = 1;
    lastLevelUpTime = millis();
  }
}

function runLevelUp() {
  UI.drawLevelUp(currentLevel);
  // 顯示 2 秒後開始關卡
  if (millis() - lastLevelUpTime > 2000) {
    if (currentLevel > 3) {
      gameState = 'BOSS';
      boss = new Boss();
    } else {
      gameState = 'PLAYING';
    }
    gameStartTime = millis();
  }
}

function runGame() {
  player.update();
  player.display();

  // 手勢辨識與施法
  Gesture.analyze(hands, player, spells);

  // 繪製瞄準準心 (傳入 player 物件以判斷 MP 狀態)
  UI.drawCrosshair(player);

  // 波次/關卡時間判定 (每波 20 秒)
  let timeInLevel = millis() - gameStartTime;
  if (gameState === 'PLAYING' && timeInLevel > 20000) {
    currentLevel++;
    gameState = 'LEVEL_UP';
    lastLevelUpTime = millis();
    enemies = []; // 清空當前怪物
    spells = [];
  }

  // 怪物生成 (一般模式)
  if (gameState === 'PLAYING' && frameCount % 60 === 0) {
    let difficulty = 1.0 + (currentLevel - 1) * 0.3;
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

  handleEntities(true);
  UI.drawHUD(player, score, currentLevel);
}

// 將實體處理邏輯獨立出來，讓教學模式也能共享碰撞判定
function handleEntities(doUpdate) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (doUpdate) enemies[i].update(player);
    enemies[i].display();
    if (enemies[i].checkCollision(player)) {
      player.takeDamage(10);
      enemies.splice(i, 1);
    } else if (enemies[i].isOffScreen() || !enemies[i].active) {
      enemies.splice(i, 1);
    }
  }

  for (let i = spells.length - 1; i >= 0; i--) {
    spells[i].update();
    spells[i].display();
    spells[i].checkHit(enemies, boss, player);
    if (!spells[i].active || spells[i].isOffScreen()) spells.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isFinished()) particles.splice(i, 1);
  }
}

function mousePressed() {
  if (gameState === 'START') {
    gameState = 'TUTORIAL';
    tutorialStep = 0;
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
