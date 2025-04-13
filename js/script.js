
const grid = document.getElementById('grid');
const scoreDisplay = document.getElementById('score').querySelector('span');
const levelDisplay = document.getElementById('level').querySelector('span');
const colorSchemeSelector = document.getElementById('color-scheme-selector');
const timerDisplay = document.getElementById('timer').querySelector('span');

const cell_size = 15;
const gridWidth = Math.floor(2028 / cell_size);   // 135
const gridHeight = Math.floor(847 / cell_size);  // 56
let gridArray = Array(gridWidth * gridHeight).fill(0);

const colors = ['blue', 'cyan', 'green', 'orange', 'purple', 'red', 'yellow'];

const shapes = [
    // I
    [[0, 1, 2, 3], [0, gridWidth, 2 * gridWidth, 3 * gridWidth]],
    // L
    [[0, 1, gridWidth + 1, 2 * gridWidth + 1], [0, gridWidth, gridWidth + 1, gridWidth + 2], [1, gridWidth + 1, 2 * gridWidth + 1, 2 * gridWidth], [gridWidth, gridWidth + 1, gridWidth + 2, 2]],
    // J
    [[1, 2, gridWidth + 2, 2 * gridWidth + 2], [gridWidth + 1, 2 * gridWidth + 1, 2 * gridWidth + 2, 2], [1, gridWidth + 1, 2 * gridWidth + 1, 2 * gridWidth], [gridWidth, gridWidth + 1, gridWidth + 2, 2]],
    // T
    [[1, gridWidth, gridWidth + 1, gridWidth + 2], [1, gridWidth + 1, 2 * gridWidth + 1, gridWidth + 2], [gridWidth, gridWidth + 1, gridWidth + 2, 2 * gridWidth + 1], [1, gridWidth, gridWidth + 1, 2 * gridWidth + 1]],
    // Z
    [[0, 1, gridWidth + 1, gridWidth + 2], [1, gridWidth, gridWidth + 1, 2 * gridWidth]],
    // S
    [[1, 2, gridWidth, gridWidth + 1], [0, gridWidth, gridWidth + 1, 2 * gridWidth + 1]],
    // O
    [[0, 1, gridWidth, gridWidth + 1]],
];


let currentShape;
let currentShapePos;
let currentRotation = 0;
let currentShapeColor;
let score = 0;
let level = 1;
let gameTimer;
let gameSpeed = 750;

let seconds = 0;
let timerInterval;
let shadowShapePos; // Добавлено

function createGrid() {
    grid.innerHTML = ''; // Очищаем старую сетку
    for (let i = 0; i < gridWidth * gridHeight; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        grid.appendChild(cell);
    }
}

function calculateShadowPosition() { // Добавлено
    shadowShapePos = currentShapePos;
    while (true) {
        shadowShapePos += gridWidth;
        let tempShape = currentShape.map(index => index);
        if (tempShape.some(index => {
            const gridIndex = shadowShapePos + index;
            if (gridIndex >= gridArray.length) return true;
            if (gridIndex < 0) return true;  // Проверка верхней границы
            return gridArray[gridIndex] !== 0;
        })) {
            shadowShapePos -= gridWidth;
            break;
        }
    }
}

function drawShadow() { // Добавлено
    if (!currentShape) return;

    calculateShadowPosition();
    const cells = grid.querySelectorAll('.cell');

    currentShape.forEach(index => {
        const gridIndex = shadowShapePos + index;
        if (gridIndex >= 0 && gridIndex < gridArray.length) {
            cells[gridIndex].classList.add('shadow');
        }
    });
}

function clearShadow() { // Добавлено
    const cells = grid.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('shadow'));
}

function draw() {
    const cells = grid.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.classList.remove('filled');
        colors.forEach(color => cell.classList.remove(color));
        cell.classList.remove('shadow'); // Удаляем класс тени
        if (gridArray[index]) {
            cell.classList.add('filled', colors[gridArray[index] - 1]);
        }
    });

    if (currentShape) {
        drawShadow();
    }

    if (currentShape) {
        currentShape.forEach(index => {
            const gridIndex = currentShapePos + index;
            if (gridIndex >= 0 && gridIndex < gridArray.length) {
                cells[gridIndex].classList.add('filled', currentShapeColor);
            }
        });
    }
}

function getRandomShape() {
    const randomIndex = Math.floor(Math.random() * shapes.length);
    currentShapeColor = colors[randomIndex];
    return shapes[randomIndex];
}

function createNewShape() {
    currentShape = getRandomShape()[0];
    currentRotation = 0;
    currentShapePos = Math.floor(gridWidth / 2) - (Math.floor(Math.random() * 6) - 3);
    if (checkCollision())
        endGame();
    draw(); // Обновляем экран, чтобы тень сразу появилась
}


function checkCollision() {
    return currentShape.some(index => {
        const gridIndex = currentShapePos + index;
        if (gridIndex < 0 || gridIndex >= gridArray.length)
            return true;
        return gridArray[gridIndex] !== 0;
    });
}

function rotateShape() {
    clearShadow(); // Очищаем старую тень
    let newRotation = currentRotation === shapes[colors.indexOf(currentShapeColor)].length - 1 ? 0 : currentRotation + 1;
    let rotatedShape = shapes[colors.indexOf(currentShapeColor)][newRotation];
    let prevShape = currentShape;
    currentShape = rotatedShape;
    if (checkCollision()) {
        currentShape = prevShape;
        return;
    }

    currentRotation = newRotation;
    draw();
}

function moveShapeDown() {
    clearShadow();  // Очищаем старую тень
    currentShapePos += gridWidth;
    if (checkCollision()) {
        currentShapePos -= gridWidth;
        freezeShape();
        removeFullRows();
        createNewShape();
    }
    draw();
}

function moveShapeLeft() {
    clearShadow(); // Очищаем старую тень
    currentShapePos--;

    if (currentShape.some(index => (currentShapePos + index) % gridWidth === gridWidth - 1 || (currentShapePos + index) % gridWidth < 0)) {
        currentShapePos++;
        return;
    }

    if (checkCollision()) {
        currentShapePos++;
        return;
    }
    draw();
}

function moveShapeRight() {
    clearShadow(); // Очищаем старую тень
    currentShapePos++;

    if (currentShape.some(index => (currentShapePos + index) % gridWidth === 0 || (currentShapePos + index) % gridWidth > gridWidth - 1)) {
        currentShapePos--;
        return;
    }

    if (checkCollision()) {
        currentShapePos--;
        return;
    }
    draw();
}

function freezeShape() {
    currentShape.forEach(index => {
        const gridIndex = currentShapePos + index;
        if (gridIndex >= 0 && gridIndex < gridArray.length)
            gridArray[gridIndex] = colors.indexOf(currentShapeColor) + 1;
    });
}

function removeFullRows() {
    for (let row = 0; row < gridHeight; row++) {
        const rowStartIndex = row * gridWidth;
        const rowEndIndex = rowStartIndex + gridWidth;

        const isRowFull = gridArray.slice(rowStartIndex, rowEndIndex).every(cell => cell !== 0);

        if (isRowFull) {
            gridArray.splice(rowStartIndex, gridWidth);
            gridArray.unshift(...Array(gridWidth).fill(0));
            score += 10;
            if (score % 100 === 0) {
                level++;
                gameSpeed = gameSpeed * 0.9;
                clearInterval(gameTimer);
                gameTimer = setInterval(moveShapeDown, gameSpeed);
            }
            scoreDisplay.textContent = score;
            levelDisplay.textContent = level;
        }
    }
}

function updateTimer() {
    seconds++;
    timerDisplay.textContent = seconds;
}

function startGame() {
    createGrid();
    createNewShape();
    gameTimer = setInterval(moveShapeDown, gameSpeed);
    timerInterval = setInterval(updateTimer, 1000);
    draw();
}

function endGame() {
    clearInterval(gameTimer);
    clearInterval(timerInterval);
    alert("Game Over! Score: " + score);
    gridArray = Array(gridWidth * gridHeight).fill(0);
    score = 0;
    level = 1;
    seconds = 0;
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    timerDisplay.textContent = seconds;

    draw();
}

document.addEventListener('keydown', event => {
    if (event.code === 'ArrowLeft') {
        moveShapeLeft();
    } else if (event.code === 'ArrowRight') {
        moveShapeRight();
    }
    else if (event.code === 'ArrowDown') {
        moveShapeDown();
    }
    else if (event.code === 'ArrowUp') {
        rotateShape();
    }
});

startGame();
