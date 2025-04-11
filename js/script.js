const grid = document.getElementById('grid');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');

const gridWidth = 10;
const gridHeight = 20;
let gridArray = Array(gridWidth * gridHeight).fill(0); // 0 - пустая ячейка

const colors = ['blue', 'cyan', 'green', 'orange', 'purple', 'red', 'yellow'];

const shapes = [
    // I
    [[0, 1, 2, 3], [2, 12, 22, 32]],
    // L
    [[1, 2, 11, 21], [0, 1, 2, 12], [1, 11, 21, 20], [0, 10, 11, 12]],
    // J
    [[0, 1, 11, 21], [1, 11, 12, 2], [1, 11, 21, 22], [0, 10, 1, 2]],
    // T
    [[1, 10, 11, 12], [1, 11, 21, 12], [10, 11, 12, 21], [1, 10, 11, 21]],
    // Z
    [[0, 1, 11, 12], [2, 11, 12, 21]],
    // S
    [[1, 2, 10, 11], [0, 10, 11, 21]],
    // O
    [[0, 1, 10, 11]],
];


let currentShape;
let currentShapePos;
let currentRotation = 0;
let currentShapeColor;
let score = 0;
let level = 1;
let gameTimer;
let gameSpeed = 500;


function createGrid() {
    for (let i = 0; i < gridWidth * gridHeight; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        grid.appendChild(cell);
    }
}

function draw() {
    // Сначала очищаем сетку, удаляя классы .filled и color
    const cells = grid.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.classList.remove('filled');
        colors.forEach(color => cell.classList.remove(color));
        if (gridArray[index]) {
            cell.classList.add('filled', colors[gridArray[index] -1 ]); // gridArray хранит номера цветов
        }
    });

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
    currentShape = getRandomShape()[0]; // Берем первую ротацию новой фигуры
    currentRotation = 0;
    currentShapePos = Math.floor(gridWidth / 2) - 2; // Начальная позиция в центре сверху
    if(checkCollision())
        endGame();
    draw();
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
    let newRotation = currentRotation === shapes[colors.indexOf(currentShapeColor)].length - 1 ? 0 : currentRotation + 1;
    let rotatedShape = shapes[colors.indexOf(currentShapeColor)][newRotation];
    let prevShape = currentShape;
    currentShape = rotatedShape;
    if (checkCollision()) {
        currentShape = prevShape;
        return; // Возвращаем старую фигуру
    }

    currentRotation = newRotation;
    draw();

}



function moveShapeDown() {
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
    currentShapePos--;
    if(checkCollision()){
        currentShapePos++;
        return;
    }
    draw();
}

function moveShapeRight() {
    currentShapePos++;
    if(checkCollision()){
        currentShapePos--;
        return;
    }
    draw();
}

function freezeShape() {
    currentShape.forEach(index => {
        const gridIndex = currentShapePos + index;
        if (gridIndex >= 0 && gridIndex < gridArray.length)
            gridArray[gridIndex] = colors.indexOf(currentShapeColor) + 1; // Записываем цвет фигуры
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


function startGame() {
    createGrid();
    createNewShape();
    gameTimer = setInterval(moveShapeDown, gameSpeed);
    draw();
}

function endGame() {
    clearInterval(gameTimer);
    alert("Game Over! Score: " + score);
    gridArray = Array(gridWidth * gridHeight).fill(0);
    score = 0;
    level = 1;
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
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
