const markovCanvas = document.getElementById("game-markov");
const markovCtx = markovCanvas.getContext("2d");

// Размер сетки и тайлов
const gridSize = 20;
const cols = Math.floor(markovCanvas.width / gridSize);
const rows = Math.floor(markovCanvas.height / gridSize);

// Игровые переменные
let markovSnake = [{ x: Math.floor(cols/2), y: Math.floor(rows/2) }];
let markovApple = getRandomApplePosition();
let markovDirection = { x: 0, y: 0 };
let markovGameOver = false;
let markovGameInterval = null;
let markovScore = 0;

// Модель марковской цепи
let markovModel = {};

function startMarkovSnake() {
    if (markovGameInterval) {
        clearInterval(markovGameInterval);
    }

    markovGameOver = false;
    markovSnake = [{ x: Math.floor(cols/2), y: Math.floor(rows/2) }];
    markovDirection = { x: 0, y: 0 };
    markovApple = getRandomApplePosition();
    markovScore = 0;
    drawMarkovGame();

    markovGameInterval = setInterval(markovGameLoop, 150);
}

function resetMarkovSnake() {
    markovModel = {};
    startMarkovSnake();
}

function markovGameLoop() {
    if (!markovGameOver) {
        markovDecideDirection();
        moveMarkovSnake();
        checkMarkovCollision();
        drawMarkovGame();
    }
}

function getRandomApplePosition() {
    let newApple;
    let isAppleOnSnake;
    
    do {
        newApple = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
        
        isAppleOnSnake = markovSnake.some(segment => 
            segment.x === newApple.x && segment.y === newApple.y
        );
    } while (isAppleOnSnake);
    
    return newApple;
}

function markovDecideDirection() {
    const head = markovSnake[0];
    const state = `${head.x},${head.y},${markovApple.x},${markovApple.y}`;

    // Инициализация модели для нового состояния
    if (!markovModel[state]) {
        markovModel[state] = {
            up: 0.25,
            down: 0.25,
            left: 0.25,
            right: 0.25
        };
    }

    // Возможные направления
    const directions = [
        { name: "up", x: 0, y: -1 },
        { name: "down", x: 0, y: 1 },
        { name: "left", x: -1, y: 0 },
        { name: "right", x: 1, y: 0 }
    ];

    // Исключаем разворот на 180°
    const currentDir = getDirectionKey(markovDirection);
    const oppositeDir = {
        up: "down",
        down: "up",
        left: "right",
        right: "left"
    };

    // Фильтруем безопасные направления
    const safeDirections = directions.filter(dir => {
        // Пропускаем противоположное текущему направление
        if (dir.name === oppositeDir[currentDir]) return false;
        
        // Проверяем границы поля
        const newX = head.x + dir.x;
        const newY = head.y + dir.y;
        if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) return false;
        
        // Проверяем столкновение с телом
        return !markovSnake.some(segment => segment.x === newX && segment.y === newY);
    });

    // Если нет безопасных направлений - конец игры
    if (safeDirections.length === 0) {
        markovGameOver = true;
        return;
    }

    // Взвешиваем направления с учетом модели и положения яблока
    const dx = markovApple.x - head.x;
    const dy = markovApple.y - head.y;
    
    const weightedDirections = safeDirections.map(dir => {
        let weight = markovModel[state][dir.name];
        
        // Увеличиваем вес направлений к яблоку
        if ((dx > 0 && dir.name === "right") || (dx < 0 && dir.name === "left") ||
            (dy > 0 && dir.name === "down") || (dy < 0 && dir.name === "up")) {
            weight *= 2;
        }
        
        return { ...dir, weight };
    });

    // Нормализуем веса
    const totalWeight = weightedDirections.reduce((sum, dir) => sum + dir.weight, 0);
    const normalizedDirections = weightedDirections.map(dir => ({
        ...dir,
        probability: dir.weight / totalWeight
    }));

    // Выбираем направление на основе вероятностей
    const rand = Math.random();
    let cumulativeProb = 0;
    let selectedDir = normalizedDirections[0];

    for (const dir of normalizedDirections) {
        cumulativeProb += dir.probability;
        if (rand <= cumulativeProb) {
            selectedDir = dir;
            break;
        }
    }

    // Устанавливаем новое направление
    markovDirection = { x: selectedDir.x, y: selectedDir.y };
}

function moveMarkovSnake() {
    const head = {
        x: markovSnake[0].x + markovDirection.x,
        y: markovSnake[0].y + markovDirection.y
    };
    
    markovSnake.unshift(head);
    
    if (head.x === markovApple.x && head.y === markovApple.y) {
        markovApple = getRandomApplePosition();
        markovScore += 10;
        updateMarkovModel(true);
    } else {
        markovSnake.pop();
        updateMarkovModel(false);
    }
}

function updateMarkovModel(reward) {
    const head = markovSnake[0];
    const state = `${head.x},${head.y},${markovApple.x},${markovApple.y}`;
    const directionKey = getDirectionKey(markovDirection);

    if (markovModel[state]) {
        if (reward) {
            // Увеличиваем вероятность успешного действия
            markovModel[state][directionKey] = Math.min(0.9, markovModel[state][directionKey] + 0.1);
            
            // Дополнительно увеличиваем вероятность движения к яблоку
            const dx = markovApple.x - head.x;
            const dy = markovApple.y - head.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) markovModel[state].right = Math.min(0.9, markovModel[state].right + 0.05);
                if (dx < 0) markovModel[state].left = Math.min(0.9, markovModel[state].left + 0.05);
            } else {
                if (dy > 0) markovModel[state].down = Math.min(0.9, markovModel[state].down + 0.05);
                if (dy < 0) markovModel[state].up = Math.min(0.9, markovModel[state].up + 0.05);
            }
        } else {
            // Уменьшаем вероятность неудачного действия
            markovModel[state][directionKey] = Math.max(0.1, markovModel[state][directionKey] - 0.05);
        }
        
        // Нормализуем вероятности
        normalizeProbabilities(state);
    }
}

function normalizeProbabilities(state) {
    const probs = markovModel[state];
    const sum = Object.values(probs).reduce((a, b) => a + b, 0);
    for (const key in probs) {
        probs[key] = probs[key] / sum;
    }
}

function getDirectionKey(dir) {
    if (dir.x === 0 && dir.y === -1) return "up";
    if (dir.x === 0 && dir.y === 1) return "down";
    if (dir.x === -1 && dir.y === 0) return "left";
    if (dir.x === 1 && dir.y === 0) return "right";
    return "up"; // fallback
}

function checkMarkovCollision() {
    const head = markovSnake[0];
    
    // Проверка столкновения со стенами
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
        markovGameOver = true;
        return;
    }
    
    // Проверка столкновения с телом (начинаем с 1, чтобы не проверять голову)
    for (let i = 1; i < markovSnake.length; i++) {
        if (head.x === markovSnake[i].x && head.y === markovSnake[i].y) {
            markovGameOver = true;
            return;
        }
    }
}

function drawMarkovGame() {
    // Очистка canvas
    markovCtx.fillStyle = "#000";
    markovCtx.fillRect(0, 0, markovCanvas.width, markovCanvas.height);
    
    // Рисуем сетку
    markovCtx.strokeStyle = "rgba(0, 255, 0, 0.1)";
    markovCtx.lineWidth = 0.5;
    
    for (let x = 0; x <= cols; x++) {
        markovCtx.beginPath();
        markovCtx.moveTo(x * gridSize, 0);
        markovCtx.lineTo(x * gridSize, rows * gridSize);
        markovCtx.stroke();
    }
    
    for (let y = 0; y <= rows; y++) {
        markovCtx.beginPath();
        markovCtx.moveTo(0, y * gridSize);
        markovCtx.lineTo(cols * gridSize, y * gridSize);
        markovCtx.stroke();
    }
    
    // Рисуем змейку
    // Рисуем змейку (обновленный стиль как в классической змейке)
markovSnake.forEach((segment, index) => {
    const x = segment.x * gridSize;
    const y = segment.y * gridSize;
    
    if (index === 0) {
        // Голова
        markovCtx.fillStyle = '#00FF00';
        markovCtx.beginPath();
        markovCtx.arc(
            x + gridSize/2,
            y + gridSize/2,
            gridSize/2,
            0,
            Math.PI * 2
        );
        markovCtx.fill();
        
        // Глаза (как в классической змейке)
        markovCtx.fillStyle = '#000';
        if (markovDirection.x === 1) { // Вправо
            markovCtx.beginPath();
            markovCtx.arc(
                x + gridSize/2 + 5,
                y + gridSize/2 - 5,
                2,
                0,
                Math.PI * 2
            );
            markovCtx.fill();
            markovCtx.beginPath();
            markovCtx.arc(
                x + gridSize/2 + 5,
                y + gridSize/2 + 5,
                2,
                0,
                Math.PI * 2
            );
            markovCtx.fill();
        } else if (markovDirection.x === -1) { // Влево
            markovCtx.beginPath();
            markovCtx.arc(
                x + gridSize/2 - 5,
                y + gridSize/2 - 5,
                2,
                0,
                Math.PI * 2
            );
            markovCtx.fill();
            markovCtx.beginPath();
            markovCtx.arc(
                x + gridSize/2 - 5,
                y + gridSize/2 + 5,
                2,
                0,
                Math.PI * 2
            );
            markovCtx.fill();
        } else if (markovDirection.y === -1) { // Вверх
            markovCtx.beginPath();
            markovCtx.arc(
                x + gridSize/2 - 5,
                y + gridSize/2 - 5,
                2,
                0,
                Math.PI * 2
            );
            markovCtx.fill();
            markovCtx.beginPath();
            markovCtx.arc(
                x + gridSize/2 + 5,
                y + gridSize/2 - 5,
                2,
                0,
                Math.PI * 2
            );
            markovCtx.fill();
        } else { // Вниз
            markovCtx.beginPath();
            markovCtx.arc(
                x + gridSize/2 - 5,
                y + gridSize/2 + 5,
                2,
                0,
                Math.PI * 2
            );
            markovCtx.fill();
            markovCtx.beginPath();
            markovCtx.arc(
                x + gridSize/2 + 5,
                y + gridSize/2 + 5,
                2,
                0,
                Math.PI * 2
            );
            markovCtx.fill();
        }
    } else {
        // Тело с градиентными цветами как в классической змейке
        const hue = 120 + (index % 20) * 5;
        markovCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        markovCtx.beginPath();
        markovCtx.arc(
            x + gridSize/2,
            y + gridSize/2,
            gridSize/2,
            0,
            Math.PI * 2
        );
        markovCtx.fill();
    }
});
    
    // Рисуем яблоко
    markovCtx.fillStyle = "#FF0000";
    markovCtx.beginPath();
    markovCtx.arc(
        markovApple.x * gridSize + gridSize/2,
        markovApple.y * gridSize + gridSize/2,
        gridSize/2,
        0,
        Math.PI * 2
    );
    markovCtx.fill();   
    markovCtx.stroke();
    
    // Рисуем счет
    markovCtx.fillStyle = "#FFF";
    markovCtx.font = "20px Arial";
    markovCtx.textAlign = "left";
    markovCtx.fillText(`Счет: ${markovScore}`, 10, 25);
    
    // Если игра окончена, показываем сообщение
    if (markovGameOver) {
        markovCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
        markovCtx.fillRect(0, 0, markovCanvas.width, markovCanvas.height);
        
        markovCtx.fillStyle = "#FF0000";
        markovCtx.font = "30px Arial";
        markovCtx.textAlign = "center";
        markovCtx.fillText("ИГРА ОКОНЧЕНА", markovCanvas.width/2, markovCanvas.height/2 - 20);
        
        markovCtx.fillStyle = "#FFF";
        markovCtx.font = "16px Arial";
        markovCtx.fillText(`Финальный счет: ${markovScore}`, markovCanvas.width/2, markovCanvas.height/2 + 20);
        markovCtx.fillText("Нажмите 'Старт' для новой игры", markovCanvas.width/2, markovCanvas.height/2 + 50);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    drawMarkovGame();
});

// Экспортируем функции для использования в HTML
window.startMarkovSnake = startMarkovSnake;
window.resetMarkovSnake = resetMarkovSnake;