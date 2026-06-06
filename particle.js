class Particle {
  constructor(x, y, col, speedMult = 1) {
    this.x = x;
    this.y = y;
    this.col = col;
    this.vx = random(-3, 3) * speedMult;
    this.vy = random(-3, 3) * speedMult;
    this.alpha = 255;
    this.size = random(4, 8);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 8;
  }

  display() {
    push();
    let c = color(this.col);
    c.setAlpha(this.alpha);
    fill(c);
    noStroke();
    ellipse(this.x, this.y, this.size);
    pop();
  }

  isFinished() {
    return this.alpha <= 0;
  }
}