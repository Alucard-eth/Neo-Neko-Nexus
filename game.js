const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const catImage = new Image();
catImage.src = 'neo-neko-pix_tp.png'; // Your cat image

const obstacleImage = new Image();
obstacleImage.src = 'cyberdog_t.png'; // Your square object image

const backgroundImage = new Image();
backgroundImage.src = 'city1.png'; // Your background image

const explosionImage = new Image();
explosionImage.src = 'explosion.png'; // Replace with your explosion image path


const explosionSound = new Audio('explosion.wav');
const laserSound = new Audio('laser.mp3');
const gameOverSound = new Audio('gameover.wav');




const projectiles = [];
const temporaryTexts = [];
const explosions = [];


let backgroundX1 = 0;
let backgroundX2 = canvas.width;
let score = 0;
let obstaclesDestroyed = 0;



function updateScore() {
  if (!checkProjectileCollision()) {
    score += 1;
  }
}

function playExplosionSound() {
  // Clone the audio element to allow overlapping sound effects
  const sound = explosionSound.cloneNode();
  sound.play();
}

function playLaserSound() {
  laserSound.currentTime = 0;
  laserSound.play();
}

function spawnExplosion(x, y) {
  const explosion = {
    x: x,
    y: y,
    frame: 0,
    maxFrame: 5, // Adjust the duration of the explosion animation
  };

  explosions.push(explosion);
}




function spawnTemporaryText(x, y, text, duration) {
  const tempText = {
    x: x,
    y: y,
    text: text,
    duration: duration,
    timeRemaining: duration,
  };

  temporaryTexts.push(tempText);
}

function spawnProjectile() {
  const projectile = {
    x: cat.x + cat.width,
    y: cat.y + cat.height / 2,
    width: 10,
    height: 5,
  };

  projectiles.push(projectile);
  playLaserSound();
}

function updateProjectiles() {
  const projectileSpeed = 7;

  for (let i = 0; i < projectiles.length; i++) {
    const projectile = projectiles[i];
    projectile.x += projectileSpeed;

    if (projectile.x > canvas.width) {
      projectiles.splice(i, 1);
      i--;
    }
  }
}

function checkProjectileCollision() {
  for (let i = 0; i < projectiles.length; i++) {
    const projectile = projectiles[i];

    for (let j = 0; j < obstacles.length; j++) {
      const obstacle = obstacles[j];

      if (
        projectile.x < obstacle.x + obstacle.width &&
        projectile.x + projectile.width > obstacle.x &&
        projectile.y < obstacle.y + obstacle.height &&
        projectile.y + projectile.height > obstacle.y
      ) {
        // Remove the projectile and obstacle
        projectiles.splice(i, 1);
        i--;
        obstacles.splice(j, 1);
        j--;

        spawnExplosion(obstacle.x, obstacle.y);

        playExplosionSound();

        spawnTemporaryText(obstacle.x, obstacle.y, '+100', 30);

        score += 200;
        obstaclesDestroyed++;

        // Decrease the score by 100
        score = Math.max(0, score - 100);
        return true;
      }
    }
  }
  return false;
}

function updateExplosions() {
  for (let i = 0; i < explosions.length; i++) {
    const explosion = explosions[i];
    explosion.frame++;

    if (explosion.frame > explosion.maxFrame) {
      explosions.splice(i, 1);
      i--;
    }
  }
}


function drawObstaclesDestroyed() {
  ctx.font = '24px Consolas';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(`Cyberdogs Destroyed: ${obstaclesDestroyed}`, 10, 60);
}

function updateTemporaryTexts() {
  for (let i = 0; i < temporaryTexts.length; i++) {
    const tempText = temporaryTexts[i];
    tempText.timeRemaining--;

    if (tempText.timeRemaining <= 0) {
      temporaryTexts.splice(i, 1);
      i--;
    }
  }
}

function drawTemporaryTexts() {
  ctx.font = '16px Arial';
  ctx.fillStyle = 'yellow';
  for (const tempText of temporaryTexts) {
    ctx.fillText(tempText.text, tempText.x, tempText.y);
  }
}


function drawScore() {
  ctx.font = '24px Arial';
  ctx.fillStyle = 'White';
  ctx.fillText(`Score: ${score}`, 10, 30);
}


function drawBackground() {
  ctx.drawImage(backgroundImage, backgroundX1, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, backgroundX2, 0, canvas.width, canvas.height);
}

function updateBackground() {
  const scrollSpeed = 2;

  backgroundX1 -= scrollSpeed;
  backgroundX2 -= scrollSpeed;

  if (backgroundX1 < -canvas.width) {
    backgroundX1 = canvas.width;
  }

  if (backgroundX2 < -canvas.width) {
    backgroundX2 = canvas.width;
  }
}

const cat = {
  x: 50,
  y: canvas.height / 2,
  width: 50,
  height: 50,
};

const obstacles = [];
const obstacleSpeed = 5;
const obstacleSpawnRate = 80;

let gameFrame = 0;

function spawnObstacle() {
  const obstacle = {
    x: canvas.width,
    y: Math.random() * (canvas.height - 50),
    width: 50,
    height: 50,
  };

  obstacles.push(obstacle);
}

function updateObstacles() {
  const speedIncreaseFactor = 0.005;
  const currentSpeed = obstacleSpeed + speedIncreaseFactor * score;

  for (let i = 0; i < obstacles.length; i++) {
    const obstacle = obstacles[i];
    obstacle.x -= currentSpeed;

    if (obstacle.x + obstacle.width < 0) {
      obstacles.splice(i, 1);
      i--;
    }
  }
}

function checkCollision() {
  for (const obstacle of obstacles) {
    if (
      cat.x < obstacle.x + obstacle.width &&
      cat.x + cat.width > obstacle.x &&
      cat.y < obstacle.y + obstacle.height &&
      cat.y + cat.height > obstacle.y
    ) {
      isGameOver = true;
      return true;
    }
  }
  updateScore();
  return false;
}

function updateCat() {
  cat.y += 1;

  // Prevent the cat from going outside the lower boundary
  if (cat.y + cat.height > canvas.height) {
    cat.y = canvas.height - cat.height;
  }
}


let jumpRequested = false;

canvas.addEventListener('click', () => {
  jumpRequested = true;
});

canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  
  if (score >= 100) {
    spawnProjectile();
    score -= 100;
  }
});

function updateCat() {
  if (jumpRequested) {
    const jumpHeight = 5;

    // Adjust the cat's y position
    cat.y -= jumpHeight;

    // Prevent the cat from going outside the upper boundary
    if (cat.y < 0) {
      cat.y = 0;
    }

    jumpRequested = false;
  }

  cat.y += 1;

  // Prevent the cat from going outside the lower boundary
  if (cat.y + cat.height > canvas.height) {
    cat.y = canvas.height - cat.height;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  drawScore();
  drawObstaclesDestroyed();
  drawExplosions();

  // Draw cat
  ctx.drawImage(catImage, cat.x, cat.y, cat.width, cat.height);

  // Draw obstacles
  for (const obstacle of obstacles) {
    ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }

  // Draw projectiles
  ctx.fillStyle = "red";
  for (const projectile of projectiles) {
    ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
  }

  



}



function gameOver(restartListener) {
  const overlay = document.getElementById('overlay');
  overlay.style.display = 'block';
  gameOverSound.play();

  const restartBtn = document.getElementById('restart-btn');
  restartBtn.addEventListener('click', restartListener);
}



function resetGameState() {
  obstacles.length = 0;
  gameFrame = 0;
  score = 0;
  obstaclesDestroyed = 0;
  cat.y = canvas.height / 2;
}



canvas.addEventListener('click', () => {
  cat.y -= 80;
});

document.getElementById('restart-btn').addEventListener('click', () => {
  document.getElementById('game-over').style.display = 'none';
  isGameOver = false;
  resetGameState();
  gameLoop();
});

function drawExplosions() {
  const explosionWidth = 50;
  const explosionHeight = 50;

  for (const explosion of explosions) {
    ctx.drawImage(explosionImage, explosion.x, explosion.y, explosionWidth, explosionHeight);
  }
}




function startGame() {

  resetGameState();

  function restartListener() {
    const overlay = document.getElementById('overlay');
    const restartBtn = document.getElementById('restart-btn');
    overlay.style.display = 'none';
    restartBtn.removeEventListener('click', restartListener);
    startGame();
  }

  function gameLoop() {
    if (gameFrame % obstacleSpawnRate === 0) {
      spawnObstacle();
    }

    updateBackground();
    updateObstacles();
    updateCat();
    updateProjectiles();
    updateTemporaryTexts();
    updateExplosions();

    if (checkCollision()) {
      gameOver(restartListener);
      return;
    }

    checkProjectileCollision();

    draw();
    drawTemporaryTexts();

    gameFrame++;
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
}



const gameScriptLoadedEvent = new Event('gameScriptLoaded');
document.dispatchEvent(gameScriptLoadedEvent);
startGame();

