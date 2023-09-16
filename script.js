//board
let board, context;
let boardWidth = 360;
let boardHeight = 600
let bgm = new Audio("./assets/bgm.wav")
let gameOverAudio = new Audio("./assets/gameover.wav");

//player
let playerWidth = 45;
let playerHeight = 80;
let playerX = boardWidth - 170;
let playerY = boardHeight - 90;
let playerImg;

let player = {
    x: playerX,
    y: playerY,
    width: playerWidth,
    height: playerHeight
}

// enemy cars
const enemyCarCollection = ["blue.png", "green.png", "yellow.png", "red.png", "rock.png", "wood.png"];
const enemyCarXArray = [95, 165, 235, 310];
let enemyCars = [];
let enemyCarWidth = playerWidth;
let enemyCarHeight = playerHeight;
let enemyCarX = boardWidth - 95;
let enemyCarY = -100;
let enemyCarImg, enemyTwoImg, enemyThreeImg, enemyFourImg;
let crashAudio = new Audio("./assets/crash.wav");

// bonus 
let bonusCollection = [];
let bonusWidth = 50;
let bonusHeight = 50;
let bonusY = -100;
let bonusImg;
let bonusAudio = new Audio("./assets/bonus.wav");

// bullet
let bulletCollection = [];
let bulletWidth = 30;
let bulletHeight = 30;
let bulletY = playerY - playerHeight;
let bulletImg;
let bulletX;
let bulletAudio = new Audio("./assets/shot.wav");
let carExplosionAudio = new Audio("./assets/blast.wav");


//velocity of cars
let downWardVelocity = 3;
let upWardVelocity = 2;
let carMovement = 0;
selectedEnemyCar = enemyCarCollection[Math.floor(Math.random() * enemyCarCollection.length)];
let interval = 1500;
let isCollisionDetected = false;
let isGamePaused = false;
let isGameResumed = false;

// score board
let score = 0;
let gameOver = false;
let playerLifeCount = 3;
const newLives = [];
let highestScore = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");
    // bgm.play();


    //load player car
    playerImg = new Image();
    playerImg.src = "./images/player.png";
    playerImg.onload = function () {
        context.drawImage(playerImg, player.x, player.y, player.width, player.height)
    }
    // Event Listener
    document.addEventListener("keydown", moveCar);

    //load first enemy car
    requestAnimationFrame(update);
    setInterval(insertEnemyCars, interval);

    setInterval(insertEnemyCars, interval);
    setInterval(insertBonus, 2000);
}

function update() {
    // if (gameOver) {
    //     return;
    // }
    requestAnimationFrame(update);

    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(playerImg, player.x, player.y, player.width, player.height);
    //player car movement

    //enemy cars
    for (let i = 0; i < enemyCars.length; i++) {
        let enemyCar = enemyCars[i];
        enemyCar.y += downWardVelocity;
        context.drawImage(enemyCar.img, enemyCar.x, enemyCar.y, enemyCar.width, enemyCar.height);

        //update score
        if (!enemyCar.passed && player.y < enemyCar.y - player.height) {
            score += 1;
            enemyCar.passed = true;
            document.querySelector(".score").innerHTML = score;
        }
        // update highest score
        if (score > highestScore) {
            highestScore = score;
            document.querySelector("#high-score").innerHTML = highestScore;
        }
        //check collision
        if (checkCarCollision(player, enemyCar)) {
            isCollisionDetected = true;
        }
    }

    // remove passed enemy car
    while (enemyCars.length > 0 && enemyCars[0].y > 600) {
        enemyCars.shift();
    }

    //bonus
    for (let i = 0; i < bonusCollection.length; i++) {
        let bonus = bonusCollection[i];
        bonus.y += downWardVelocity;
        context.drawImage(bonus.img, bonus.x, bonus.y, bonus.width, bonus.height);
        if (checkCarCollision(player, bonus)) {
            bonusAudio.play();
            score += 10;
            bonusAudio.play();
            bonus.y += 600;
        }

    }

    //remove passed bonus
    while (bonusCollection.length > 0 && bonusCollection[0].y > 600) {
        bonusCollection.shift();
    }

    //create bullets
    for (let i = 0; i < bulletCollection.length; i++) {

        let bullet = bulletCollection[i];
        bullet.y -= upWardVelocity * 2;
        context.drawImage(bullet.img, bullet.x, bullet.y, bullet.width, bullet.height);
        bulletAudio.play();
    }

    // Score board
    context.fillStyle = "white";
    context.font = "25px san-serif";
    scoreIcon = new Image();
    scoreIcon.src = "./images/score.png";
    context.drawImage(scoreIcon, 45, 5, 20, 20);
    context.fillText(score, 72, 23);

    //lives
    playerLife = new Image();
    playerLife.src = "./images/life.png";
    context.drawImage(playerLife, 300, 5, 20, 20);
    context.fillText(playerLifeCount, 280, 23)

    //bullet strikes car
    bulletStrikesEnemyCar();

    // start game after collision
    if (isCollisionDetected) {
        crashAudio.play();
        player.x = playerX;
        player.y = playerY;
        isCollisionDetected = false;
        enemyCars.length = 0
        bonusCollection.length = 0;
        bulletCollection.length = 0;
        playerLifeCount--;
    }

    if (playerLifeCount == 0) {
        gameOver = true;
        gameOverAudio.play();
        document.querySelector(".game-over-alert").style.display = "flex";
    }

    document.querySelector(".score").innerHTML = score;
    document.querySelector("#high-score").innerHTML = highestScore;
}


//Enemy cars
function insertEnemyCars() {
    if (gameOver) {
        return;
    }
    enemyCarImg = new Image();
    let selectedEnemyCar = enemyCarCollection[Math.floor(Math.random() * enemyCarCollection.length)];
    enemyCarImg.src = `./images/${selectedEnemyCar}`;

    let enemyCarX = boardWidth - enemyCarXArray[Math.round(Math.random() * enemyCarXArray.length)];
    let enemyCar = {
        img: enemyCarImg,
        x: enemyCarX,
        y: -enemyCarHeight,
        width: enemyCarWidth,
        height: enemyCarHeight,
        passed: false
    }
    enemyCars.push(enemyCar);

}

// Fire bullet
function fireBullet() {
    if (gameOver) {
        return;
    }

    bulletImg = new Image();
    bulletImg.src = "./images/arrow.png";
    let bullet = {
        img: bulletImg,
        x: player.x + 10,
        y: player.y - 30,
        width: bulletWidth,
        height: bulletHeight,
        passed: false
    }
    bulletCollection.push(bullet);
}


// Bonus
function insertBonus() {
    if (gameOver) {
        return;
    }
    bonusImg = new Image();
    bonusImg.src = "./images/score.png";
    let bonusX = boardWidth - enemyCarXArray[Math.round(Math.random() * enemyCarXArray.length)];
    let bonus = {
        img: bonusImg,
        x: bonusX,
        y: bonusY,
        width: bonusWidth,
        height: bonusHeight,
        passed: false
    }
    bonusCollection.push(bonus);

}



function resetGame() {
    enemyCars = [];
    bonusCollection = [];
    playerX = boardWidth - 170;
    playerY = boardHeight - 90;
    gameOver = false;
    playerLifeCount = 3
    score = 0;
}

function checkCarCollision(car, enemy) {
    if (
        car.x < enemy.x + enemy.width
        &&
        car.x + car.width > enemy.x
        &&
        car.y < enemy.y + enemy.height
        &&
        car.y + car.height > enemy.y
    )
        return true;
}

function bulletStrikesEnemyCar() {
    for (let i = 0; i < bulletCollection.length; i++) {
        let bullet = bulletCollection[i];
        for (let j = 0; j < enemyCars.length; j++) {
            let enemyCar = enemyCars[j];
            if (checkCarCollision(bullet, enemyCar)) {
                carExplosionAudio.play();
                bulletCollection.splice(i, 1);
                enemyCars.splice(j, 1);
                score++;
            }
        }
    }
    //remove passed bullets
    while (bulletCollection.length > 0 && bulletCollection[0].y < 0) {
        bulletCollection.shift();
    }

}

// game pause


document.querySelector(".new-game").addEventListener("click", function () {
    document.querySelector(".game-over-alert").style.display = "none";
    gameOver = true;
    resetGame();
});

// control player
function moveCar(event) {
    if (event.key == "a" || event.code == "ArrowLeft") {
        player.x = Math.max(50, player.x - 75)
    }
    if (event.key == "d" || event.code == "ArrowRight") {
        player.x = Math.min(player.x + 75, 270)
    }
    if (event.key == "w" || event.code == "ArrowUp") {
        player.y = Math.max(player.y - 75, 30)
    }
    if (event.key == "s" || event.code == "ArrowDown") {
        player.y = Math.min(player.y + 75, 475)
    }
    if (event.code == "Space") {
        fireBullet();
    }
    if(event.code == "Enter"){
        pauseGame();
    }
}

function pauseGame(){
    isGamePaused = true;
    cancelAnimationFrame(update);
    clearInterval(interval);
    alert("Paused\nClick Ok to resume.");
}