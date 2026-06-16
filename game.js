const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const livesEl = document.querySelector('#lives');
const levelEl = document.querySelector('#level');
const message = document.querySelector('#message');
const startButton = document.querySelector('#start-button');

const keys = new Set();
const stars = Array.from({ length: 90 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 1.8 + 0.4,
  s: Math.random() * 0.55 + 0.18,
}));

const state = {
  running: false,
  score: 0,
  lives: 3,
  level: 1,
  lastTime: 0,
  invaderDirection: 1,
  invaderDrop: false,
  playerBullets: [],
  enemyBullets: [],
  particles: [],
  invaders: [],
  awaitingNextLevel: false,
};

const player = {
  x: canvas.width / 2 - 26,
  y: canvas.height - 70,
  width: 52,
  height: 28,
  speed: 420,
  cooldown: 0,
};

function createInvaders() {
  state.invaders = [];
  const rows = Math.min(3 + state.level, 6);
  const cols = 10;
  const startX = 92;
  const startY = 78;
  const gapX = 66;
  const gapY = 48;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      state.invaders.push({
        x: startX + col * gapX,
        y: startY + row * gapY,
        width: 38,
        height: 26,
        type: row % 3,
        alive: true,
        wobble: Math.random() * Math.PI * 2,
      });
    }
  }
}

function resetGame() {
  state.awaitingNextLevel = false;
  state.running = true;
  state.score = 0;
  state.lives = 3;
  state.level = 1;
  state.playerBullets = [];
  state.enemyBullets = [];
  state.particles = [];
  state.invaderDirection = 1;
  player.x = canvas.width / 2 - player.width / 2;
  player.cooldown = 0;
  createInvaders();
  hideMessage();
  updateHud();
}

function continueLevel() {
  if (!state.awaitingNextLevel) {
    resetGame();
    return;
  }
  state.awaitingNextLevel = false;
  state.running = true;
  hideMessage();
}

function nextLevel() {
  state.level += 1;
  state.playerBullets = [];
  state.enemyBullets = [];
  state.invaderDirection = 1;
  createInvaders();
  showBanner(`LEVEL ${state.level}`, '隊列が速くなった！ Enter で続行。', '続行');
  state.awaitingNextLevel = true;
  state.running = false;
  updateHud();
}

function updateHud() {
  scoreEl.textContent = state.score.toString();
  livesEl.textContent = state.lives.toString();
  levelEl.textContent = state.level.toString();
}

function showBanner(title, text, buttonText) {
  message.querySelector('h2').textContent = title;
  message.querySelector('p').textContent = text;
  startButton.textContent = buttonText;
  message.classList.add('is-visible');
}

function hideMessage() {
  message.classList.remove('is-visible');
}

function shoot() {
  if (player.cooldown > 0 || !state.running) return;
  state.playerBullets.push({
    x: player.x + player.width / 2 - 3,
    y: player.y - 12,
    width: 6,
    height: 18,
    speed: -620,
  });
  player.cooldown = 0.28;
}

function enemyShoot() {
  const living = state.invaders.filter((invader) => invader.alive);
  if (!living.length) return;
  const shooter = living[Math.floor(Math.random() * living.length)];
  state.enemyBullets.push({
    x: shooter.x + shooter.width / 2 - 4,
    y: shooter.y + shooter.height,
    width: 8,
    height: 16,
    speed: 190 + state.level * 24,
  });
}

function addExplosion(x, y, color) {
  for (let i = 0; i < 16; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * (80 + Math.random() * 180),
      vy: Math.sin(angle) * (80 + Math.random() * 180),
      life: 0.45 + Math.random() * 0.35,
      color,
    });
  }
}

function hit(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function update(delta) {
  if (!state.running) return;

  if (keys.has('ArrowLeft') || keys.has('KeyA')) player.x -= player.speed * delta;
  if (keys.has('ArrowRight') || keys.has('KeyD')) player.x += player.speed * delta;
  player.x = Math.max(18, Math.min(canvas.width - player.width - 18, player.x));
  player.cooldown = Math.max(0, player.cooldown - delta);

  state.playerBullets.forEach((bullet) => { bullet.y += bullet.speed * delta; });
  state.enemyBullets.forEach((bullet) => { bullet.y += bullet.speed * delta; });
  state.playerBullets = state.playerBullets.filter((bullet) => bullet.y + bullet.height > 0);
  state.enemyBullets = state.enemyBullets.filter((bullet) => bullet.y < canvas.height + 30);

  const invaderSpeed = 42 + state.level * 13;
  let shouldDrop = false;
  state.invaders.forEach((invader) => {
    if (!invader.alive) return;
    invader.x += invaderSpeed * state.invaderDirection * delta;
    invader.wobble += delta * 4;
    if (invader.x < 24 || invader.x + invader.width > canvas.width - 24) shouldDrop = true;
  });

  if (shouldDrop) {
    state.invaderDirection *= -1;
    state.invaders.forEach((invader) => {
      invader.y += 22;
      invader.x += state.invaderDirection * 12;
    });
  }

  if (Math.random() < delta * (0.7 + state.level * 0.18)) enemyShoot();

  state.playerBullets.forEach((bullet) => {
    state.invaders.forEach((invader) => {
      if (!invader.alive || bullet.used || !hit(bullet, invader)) return;
      invader.alive = false;
      bullet.used = true;
      state.score += 100 + invader.type * 25;
      addExplosion(invader.x + invader.width / 2, invader.y + invader.height / 2, ['#75ff72', '#4dfcff', '#ff4dd8'][invader.type]);
    });
  });
  state.playerBullets = state.playerBullets.filter((bullet) => !bullet.used);

  state.enemyBullets.forEach((bullet) => {
    if (bullet.used || !hit(bullet, player)) return;
    bullet.used = true;
    state.lives -= 1;
    addExplosion(player.x + player.width / 2, player.y + player.height / 2, '#ffe66d');
    if (state.lives <= 0) {
      state.running = false;
      showBanner('GAME OVER', `スコア ${state.score} 点。Enter で再挑戦。`, 'もう一度');
    }
  });
  state.enemyBullets = state.enemyBullets.filter((bullet) => !bullet.used);

  if (state.invaders.some((invader) => invader.alive && invader.y + invader.height > player.y - 6)) {
    state.running = false;
    state.lives = 0;
    showBanner('侵略完了', `スコア ${state.score} 点。Enter で再挑戦。`, 'もう一度');
  }

  if (state.invaders.every((invader) => !invader.alive)) {
    state.score += state.level * 500;
    nextLevel();
  }

  state.particles.forEach((particle) => {
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.life -= delta;
  });
  state.particles = state.particles.filter((particle) => particle.life > 0);
  updateHud();
}

function drawStars(delta) {
  ctx.fillStyle = '#030611';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  stars.forEach((star) => {
    star.y += star.s * delta * 70;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
    ctx.fillStyle = `rgba(244, 251, 255, ${0.35 + star.s})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = '#4dfcff';
  ctx.fillRect(6, 12, 40, 14);
  ctx.fillStyle = '#75ff72';
  ctx.fillRect(22, 0, 8, 14);
  ctx.fillStyle = '#ff4dd8';
  ctx.fillRect(0, 20, 10, 8);
  ctx.fillRect(42, 20, 10, 8);
  ctx.restore();
}

function drawInvader(invader) {
  if (!invader.alive) return;
  const colors = ['#75ff72', '#4dfcff', '#ff4dd8'];
  const bob = Math.sin(invader.wobble) * 2;
  ctx.save();
  ctx.translate(invader.x, invader.y + bob);
  ctx.fillStyle = colors[invader.type];
  ctx.fillRect(6, 0, 26, 6);
  ctx.fillRect(0, 6, 38, 14);
  ctx.fillRect(6, 20, 7, 6);
  ctx.fillRect(25, 20, 7, 6);
  ctx.fillStyle = '#030611';
  ctx.fillRect(9, 9, 6, 5);
  ctx.fillRect(23, 9, 6, 5);
  ctx.restore();
}

function drawBullets() {
  state.playerBullets.forEach((bullet) => {
    ctx.fillStyle = '#ffe66d';
    ctx.shadowColor = '#ffe66d';
    ctx.shadowBlur = 12;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    ctx.shadowBlur = 0;
  });
  state.enemyBullets.forEach((bullet) => {
    ctx.fillStyle = '#ff4dd8';
    ctx.shadowColor = '#ff4dd8';
    ctx.shadowBlur = 12;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    ctx.shadowBlur = 0;
  });
}

function drawParticles() {
  state.particles.forEach((particle) => {
    ctx.globalAlpha = Math.max(0, particle.life * 2);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, 4, 4);
  });
  ctx.globalAlpha = 1;
}

function drawGround() {
  ctx.fillStyle = 'rgba(77, 252, 255, 0.2)';
  ctx.fillRect(0, canvas.height - 28, canvas.width, 2);
  ctx.fillStyle = 'rgba(117, 255, 114, 0.18)';
  for (let x = 20; x < canvas.width; x += 56) ctx.fillRect(x, canvas.height - 24, 30, 6);
}

function render(delta = 0.016) {
  drawStars(delta);
  drawGround();
  state.invaders.forEach(drawInvader);
  drawBullets();
  drawPlayer();
  drawParticles();
}

function loop(timestamp) {
  const delta = Math.min((timestamp - state.lastTime) / 1000 || 0.016, 0.04);
  state.lastTime = timestamp;
  update(delta);
  render(delta);
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  keys.add(event.code);
  if (event.code === 'Space') {
    event.preventDefault();
    shoot();
  }
  if (event.code === 'Enter' && !state.running) continueLevel();
});

window.addEventListener('keyup', (event) => keys.delete(event.code));
startButton.addEventListener('click', continueLevel);

createInvaders();
updateHud();
requestAnimationFrame(loop);
