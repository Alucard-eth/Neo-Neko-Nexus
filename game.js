const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const catImage = new Image();
catImage.src = 'neo-neko-pix_tp.png'; // Your cat image

const obstacleImage = new Image();
obstacleImage.src = 'cyberdog_t.png'; // Your square object image

const backgroundImage = new Image();
backgroundImage.src = 'city1.png'; // Your background image

const explosionImage = new Image();
explosionImage.src = 'explosion.png';

const catSprite = new Image();
catSprite.src = 'neo-neko2_tp.png'; //Not currently used

const obstacleSprite = new Image();
obstacleSprite.src = 'cyberdog2_t.png'; //Not currently used

const secondObjectImage = new Image();
secondObjectImage.src = 'ethercoin.png'; // Your second object image


const catFrameCount = 4; // Number of animation frames in the cat sprite sheet
const catFrameWidth = catSprite.width / catFrameCount;
const catFrameHeight = catSprite.height;

const obstacleFrameCount = 4; // Number of animation frames in the obstacle sprite sheet
const obstacleFrameWidth = obstacleSprite.width / obstacleFrameCount;
const obstacleFrameHeight = obstacleSprite.height;




const explosionSound = new Audio('explosion.wav');
const laserSound = new Audio('laser.mp3');
const gameOverSound = new Audio('gameover.wav');
const loseLifeSound = new Audio('losing-life.wav');
const backgroundMusic = new Audio('backgroundmusic.mp3');
const spawnSound = new Audio('spawn.mp3');
const collectSound = new Audio('collectcoin.mp3');
const NoammoSound = new Audio('noammo.mp3');


backgroundMusic.loop = true;
backgroundMusic.volume = 0.5; // Volume level between 0 (silent) and 1 (max)


let playerHealth = 3;
const maxHealth = 3;


const projectiles = [];
const temporaryTexts = [];
const explosions = [];
const particles = [];
const secondObjects = [];



let backgroundX1 = 0;
let backgroundX2 = canvas.width;
let score = 0;
let obstaclesDestroyed = 0;


const secondObjectSpawnRate = 150;



function spawnSecondObject() {
  const secondObject = {
    x: canvas.width,
    y: Math.random() * (canvas.height - 50),
    width: 50,
    height: 50,
  };

  secondObjects.push(secondObject);
}

function updateSecondObjects() {
  for (let i = 0; i < secondObjects.length; i++) {
    const secondObject = secondObjects[i];
    secondObject.x -= obstacleSpeed;

    if (secondObject.x + secondObject.width < 0) {
      secondObjects.splice(i, 1);
      i--;
    }
  }
}

function drawSecondObjects() {
  for (const secondObject of secondObjects) {
    ctx.drawImage(secondObjectImage, secondObject.x, secondObject.y, secondObject.width, secondObject.height);
  }
}


function checkSecondObjectCollision() {
  for (let i = 0; i < secondObjects.length; i++) {
    const secondObject = secondObjects[i];

    if (
      cat.x < secondObject.x + secondObject.width &&
      cat.x + cat.width > secondObject.x &&
      cat.y < secondObject.y + secondObject.height &&
      cat.y + cat.height > secondObject.y
    ) {
      secondObjects.splice(i, 1);
      i--;

      score += 100;
      collectSound.play();
      spawnTemporaryText(secondObject.x, secondObject.y, '+100', 30);
    }
  }
}




function updateScore() {
  if (!checkProjectileCollision()) {
    score += 1;
  }
}

function spawnParticle(x, y) {
  const numLines = 5; // Number of lines to create as particles
  for (let i = 0; i < numLines; i++) {
    const yOffset = (Math.random() - 0.5) * 30; // Random y-axis offset, adjust the multiplier to control the range
    const particle = {
      x: x,
      y: y + yOffset, // Add the yOffset to the original y value
      length: 10 + i * 5, // Length of the line
      opacity: 1 - i * 0.15, // Varying opacity for each line
      fadeSpeed: 0.02 + i * 0.003, // Varying fade-out speed for each line
    };
    particles.push(particle);
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

function playNoAmmo() {
  NoammoSound.currentTime = 0;
  NoammoSound.play();
}

function playLoseLifeSound() {
  loseLifeSound.currentTime = 0;
  loseLifeSound.play();
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

        spawnTemporaryText(obstacle.x, obstacle.y, '+200', 30);

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
  frame: 0,
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
    frame: 0,
  };

  obstacles.push(obstacle);
  spawnSound.play();
}

function updateObstacles() {

  for (const obstacle of obstacles) {
    obstacle.frame = (obstacle.frame + 1) % obstacleFrameCount;
  }


  const speedIncreaseFactor = 0.005;
  const currentSpeed = obstacleSpeed + speedIncreaseFactor * score;

  for (let i = 0; i < obstacles.length; i++) {
    const obstacle = obstacles[i];
    obstacle.x -= currentSpeed;


    if (gameFrame % 4 === 0) {
      spawnParticle(obstacle.x + obstacle.width, obstacle.y + obstacle.height / 2);
    }


    if (obstacle.x + obstacle.width < 0) {
      obstacles.splice(i, 1);
      i--;
    }
  }
}

function updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    particle.x -= 1; // Adjust the particle speed
    particle.opacity -= particle.fadeSpeed; // Adjust the fade-out speed

    // Remove the particle if its opacity reaches 0
    if (particle.opacity <= 0) {
      particles.splice(i, 1);
      i--;
    }
  }
}

function drawParticles() {
  for (const particle of particles) {
    const gradient = ctx.createLinearGradient(
      particle.x, particle.y,
      particle.x - particle.length, particle.y
    );
    gradient.addColorStop(0, `rgba(0, 127, 255, ${particle.opacity})`);
    gradient.addColorStop(1, `rgba(0, 127, 255, 0)`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(particle.x - particle.length, particle.y);
    ctx.stroke();
  }
}





function checkCollision(cat, obstacles) {
  for (let i = 0; i < obstacles.length; i++) {
    const obstacle = obstacles[i];
    if (
      cat.x < obstacle.x + obstacle.width &&
      cat.x + cat.width > obstacle.x &&
      cat.y < obstacle.y + obstacle.height &&
      cat.y + cat.height > obstacle.y
    ) {
      // Remove the collided obstacle or reset its position
      obstacles.splice(i, 1);
      i--;

      // Decrement cat (player) health
      playerHealth--;
      playLoseLifeSound();

      if (playerHealth <= 0) {
        return true;
      }
    }
  }
  return false;
}




function updateCat() {
  cat.frame = (cat.frame + 1) % catFrameCount;
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
  else{
    playNoAmmo();
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
  drawHealth();
  drawParticles();

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
  
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  
  gameOverSound.play();


  const restartBtn = document.getElementById('restart-btn');
  restartBtn.addEventListener('click', restartListener);
}

function drawHeart(x, y, width, height) {
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y + height / 4);
  ctx.quadraticCurveTo(x, y, x + width / 4, y + height / 2);
  ctx.quadraticCurveTo(x, y + height, x + width / 2, y + height);
  ctx.quadraticCurveTo(x + width, y + height, x + (3 * width) / 4, y + height / 2);
  ctx.quadraticCurveTo(x + width, y, x + width / 2, y + height / 4);
  ctx.closePath();
}



function resetGameState() {
  obstacles.length = 0;
  gameFrame = 0;
  score = 0;
  obstaclesDestroyed = 0;
  cat.y = canvas.height / 2;
  playerHealth = 3;

  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  backgroundMusic.play();
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

function drawHealth() {
  const heartSize = 25;
  const heartSpacing = 10;

  for (let i = 0; i < maxHealth; i++) {
    if (i < playerHealth) {
      ctx.fillStyle = "red";
      drawHeart(10 + i * (heartSize + heartSpacing), 70, heartSize, heartSize);
      ctx.fill();
    } else {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      drawHeart(10 + i * (heartSize + heartSpacing), 70, heartSize, heartSize);
      ctx.stroke();
    }
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

    if (gameFrame % secondObjectSpawnRate === 0) {
      spawnSecondObject();
    }

    updateBackground();
    updateObstacles();
    updateSecondObjects();
    updateCat();
    updateProjectiles();
    updateTemporaryTexts();
    updateExplosions();
    updateParticles();
    checkSecondObjectCollision();


    if (checkCollision(cat, obstacles)) {
      gameOver(restartListener);
      return;
    }

    checkProjectileCollision();
    updateScore();

    draw();
    drawTemporaryTexts();
    drawSecondObjects();

    gameFrame++;
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
}

const gameScriptLoadedEvent = new Event('gameScriptLoaded');
document.dispatchEvent(gameScriptLoadedEvent);


startGame();