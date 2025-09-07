// 游戏常量
const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 200, y: 200 }];
const INITIAL_DIRECTION = { x: GRID_SIZE, y: 0 };

// 游戏状态
let gameRunning = false;
let gamePaused = false;
let score = 0;
let snake = [...INITIAL_SNAKE];
let direction = { ...INITIAL_DIRECTION };
let food = {};
let gameLoop;
let gameSpeed = 150; // 游戏速度（毫秒）

// DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

// 初始化游戏
function initGame() {
    snake = [...INITIAL_SNAKE];
    direction = { ...INITIAL_DIRECTION };
    score = 0;
    gameRunning = false;
    gamePaused = false;
    generateFood();
    updateScore();
    updateSpeedDisplay();
    draw();
}

// 生成食物
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE,
            y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    food = newFood;
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = score;
}

// 更新速度显示
function updateSpeedDisplay() {
    const speedText = {
        50: '极快',
        75: '快',
        100: '较快',
        125: '中快',
        150: '中',
        175: '中慢',
        200: '慢',
        225: '较慢',
        250: '很慢',
        275: '极慢',
        300: '超慢'
    };
    speedValue.textContent = speedText[gameSpeed] || '中';
}

// 更新游戏速度
function updateGameSpeed() {
    gameSpeed = parseInt(speedSlider.value);
    updateSpeedDisplay();

    // 如果游戏正在运行，更新游戏循环
    if (gameRunning && !gamePaused) {
        clearInterval(gameLoop);
        gameLoop = setInterval(gameStep, gameSpeed);
    }
}

// 绘制游戏画面
function draw() {
    // 清空画布
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 绘制蛇
    ctx.fillStyle = '#27ae60';
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#2ecc71'; // 蛇头用更亮的绿色
        } else {
            ctx.fillStyle = '#27ae60';
        }
        ctx.fillRect(segment.x, segment.y, GRID_SIZE - 2, GRID_SIZE - 2);
    });

    // 绘制食物
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x, food.y, GRID_SIZE - 2, GRID_SIZE - 2);

    // 绘制网格线（可选）
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_SIZE, i);
        ctx.stroke();
    }
}

// 更新蛇的位置
function updateSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        generateFood();
    } else {
        snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];

    // 检查边界碰撞
    if (head.x < 0 || head.x >= CANVAS_SIZE || head.y < 0 || head.y >= CANVAS_SIZE) {
        return true;
    }

    // 检查自身碰撞
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);

    // 显示游戏结束界面
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over';
    gameOverDiv.innerHTML = `
        <div>游戏结束!</div>
        <div>最终分数: ${score}</div>
        <div>点击重新开始或按空格键</div>
    `;
    document.querySelector('.container').appendChild(gameOverDiv);

    // 移除游戏结束界面
    const removeGameOver = () => {
        if (gameOverDiv.parentNode) {
            gameOverDiv.parentNode.removeChild(gameOverDiv);
        }
    };

    setTimeout(removeGameOver, 3000);
}

// 显示暂停界面
function showPause() {
    const pauseDiv = document.createElement('div');
    pauseDiv.className = 'game-paused';
    pauseDiv.textContent = '游戏暂停';
    document.querySelector('.container').appendChild(pauseDiv);

    return pauseDiv;
}

// 隐藏暂停界面
function hidePause(pauseDiv) {
    if (pauseDiv && pauseDiv.parentNode) {
        pauseDiv.parentNode.removeChild(pauseDiv);
    }
}

// 主游戏循环
function gameStep() {
    if (!gameRunning || gamePaused) return;

    updateSnake();

    if (checkCollision()) {
        gameOver();
        return;
    }

    draw();
}

// 键盘控制
function handleKeyPress(event) {
    if (!gameRunning) return;

    const key = event.key.toLowerCase();

    // 暂停/继续游戏
    if (key === ' ') {
        event.preventDefault();
        togglePause();
        return;
    }

    if (gamePaused) return;

    // 方向控制
    switch (key) {
        case 'arrowup':
        case 'w':
            if (direction.y === 0) {
                direction = { x: 0, y: -GRID_SIZE };
            }
            break;
        case 'arrowdown':
        case 's':
            if (direction.y === 0) {
                direction = { x: 0, y: GRID_SIZE };
            }
            break;
        case 'arrowleft':
        case 'a':
            if (direction.x === 0) {
                direction = { x: -GRID_SIZE, y: 0 };
            }
            break;
        case 'arrowright':
        case 'd':
            if (direction.x === 0) {
                direction = { x: GRID_SIZE, y: 0 };
            }
            break;
    }
}

// 开始游戏
function startGame() {
    if (gameRunning) return;

    gameRunning = true;
    gamePaused = false;
    gameLoop = setInterval(gameStep, gameSpeed);
    startBtn.textContent = '游戏中...';
}

// 暂停/继续游戏
function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;

    if (gamePaused) {
        clearInterval(gameLoop);
        pauseBtn.textContent = '继续';
        showPause();
    } else {
        gameLoop = setInterval(gameStep, gameSpeed);
        pauseBtn.textContent = '暂停';
        const pauseDiv = document.querySelector('.game-paused');
        hidePause(pauseDiv);
    }
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameLoop);
    const gameOverDiv = document.querySelector('.game-over');
    const pauseDiv = document.querySelector('.game-paused');

    if (gameOverDiv) gameOverDiv.remove();
    if (pauseDiv) pauseDiv.remove();

    initGame();
    startGame();
}

// 事件监听器
document.addEventListener('keydown', handleKeyPress);
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);
speedSlider.addEventListener('input', updateGameSpeed);

// 初始化游戏
initGame();
