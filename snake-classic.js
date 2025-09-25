document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    const gridSize = 20; // Размер одной клетки
    let tileCountX, tileCountY; // Количество клеток по X и Y
    let speed = 7;
    let level = 1;
    let score = 0;
    
    let snake = [];
    let dx = 0;
    let dy = 0;
    
    let food = {
        x: 0,
        y: 0
    };
    
    // Состояние игры
    let isPaused = false;
    let gameInterval;
    let isGameRunning = false;

    function initGame() {
        // Рассчитываем количество клеток на основе размеров canvas
        tileCountX = Math.floor(canvas.width / gridSize);
        tileCountY = Math.floor(canvas.height / gridSize);
        
        // Начальная позиция змейки - по центру
        const startX = Math.floor(tileCountX / 2);
        const startY = Math.floor(tileCountY / 2);
        snake = [{x: startX, y: startY}];
        
        // Начальное направление
        dx = 0;
        dy = 0;
        
        // Генерируем первую еду
        generateFood();
        
        // Отрисовываем начальное состояние
        clearCanvas();
        drawFood();
        drawSnake();
    }

    function drawSnake() {
        snake.forEach((segment, index) => {
            // Голова змейки
            if (index === 0) {
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(
                    segment.x * gridSize + gridSize / 2,
                    segment.y * gridSize + gridSize / 2,
                    gridSize / 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Глаза
                ctx.fillStyle = '#000';
                if (dx === 1) { // Вправо
                    ctx.beginPath();
                    ctx.arc(
                        segment.x * gridSize + gridSize / 2 + 5,
                        segment.y * gridSize + gridSize / 2 - 5,
                        2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(
                        segment.x * gridSize + gridSize / 2 + 5,
                        segment.y * gridSize + gridSize / 2 + 5,
                        2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                } else if (dx === -1) { // Влево
                    ctx.beginPath();
                    ctx.arc(
                        segment.x * gridSize + gridSize / 2 - 5,
                        segment.y * gridSize + gridSize / 2 - 5,
                        2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(
                        segment.x * gridSize + gridSize / 2 - 5,
                        segment.y * gridSize + gridSize / 2 + 5,
                        2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                } else if (dy === -1) { // Вверх
                    ctx.beginPath();
                    ctx.arc(
                        segment.x * gridSize + gridSize / 2 - 5,
                        segment.y * gridSize + gridSize / 2 - 5,
                        2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(
                        segment.x * gridSize + gridSize / 2 + 5,
                        segment.y * gridSize + gridSize / 2 - 5,
                        2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                } else { // Вниз
                    ctx.beginPath();
                    ctx.arc(
                        segment.x * gridSize + gridSize / 2 - 5,
                        segment.y * gridSize + gridSize / 2 + 5,
                        2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(
                        segment.x * gridSize + gridSize / 2 + 5,
                        segment.y * gridSize + gridSize / 2 + 5,
                        2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
            } else {
                // Тело змейки
                ctx.fillStyle = `hsl(${120 + index * 2}, 100%, 50%)`;
                ctx.beginPath();
                ctx.arc(
                    segment.x * gridSize + gridSize / 2,
                    segment.y * gridSize + gridSize / 2,
                    gridSize / 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        });
    }
    
    function drawFood() {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(
            food.x * gridSize + gridSize / 2,
            food.y * gridSize + gridSize / 2,
            gridSize / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    function clearCanvas() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Сетка
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < tileCountX; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < tileCountY; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }
    }
    
    function gameLoop() {
        if (isPaused) return;
        
        // Перемещаем змейку
        const head = {x: snake[0].x + dx, y: snake[0].y + dy};
        snake.unshift(head);
        
        // Проверяем, съела ли змейка еду
        if (head.x === food.x && head.y === food.y) {
            // Генерируем новую еду
            generateFood();
            score += 10 * level;
            scoreElement.textContent = score;
            
            // Повышаем уровень каждые 50 очков
            if (score >= level * 50) {
                level++;
                levelElement.textContent = level;
                speed += 2;
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, 1000 / speed);
            }
        } else {
            // Удаляем хвост, если еда не съедена
            snake.pop();
        }
        
        // Проверяем столкновения
        if (
            head.x < 0 || head.x >= tileCountX ||
            head.y < 0 || head.y >= tileCountY ||
            checkCollision()
        ) {
            gameOver();
            return;
        }
        
        // Отрисовываем игру
        clearCanvas();
        drawFood();
        drawSnake();
    }
    
    function generateFood() {
        let newFood;
        let isFoodOnSnake;
        
        do {
            newFood = {
                x: Math.floor(Math.random() * tileCountX),
                y: Math.floor(Math.random() * tileCountY)
            };
            
            isFoodOnSnake = snake.some(segment => 
                segment.x === newFood.x && segment.y === newFood.y
            );
        } while (isFoodOnSnake);
        
        food = newFood;
    }
    
    // Проверяем столкновение с собой
    function checkCollision() {
        const head = snake[0];
        return snake.slice(1).some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }
    
    // Конец игры
    function gameOver() {
        clearInterval(gameInterval);
        isGameRunning = false;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ff0000';
        ctx.font = '30px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('ИГРА ОКОНЧЕНА', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Press Start 2P"';
        ctx.fillText(`Очки: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText(`Уровень: ${level}`, canvas.width / 2, canvas.height / 2 + 40);
        
        startBtn.textContent = 'Играть снова';
    }
    
    function startGame() {
        if (isGameRunning && !isPaused) return;
        // Сброс параметров
        score = 0;
        level = 1;
        speed = 7;
        
        scoreElement.textContent = score;
        levelElement.textContent = level;
        
        initGame();
        isPaused = false;
        isGameRunning = true;
        
        startBtn.textContent = 'Старт';
        
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, 1000 / speed);
    }
    
    // Пауза
    function togglePause() {
        if (!isGameRunning) return;
        
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? 'Продолжить' : 'Пауза';
        
        if (!isPaused) {
            clearCanvas();
            drawFood();
            drawSnake();
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '30px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('ПАУЗА', canvas.width / 2, canvas.height / 2);
        }
    }
    
    // Обработчики событий
    document.addEventListener('keydown', e => {
        if (!isGameRunning || isPaused) return;
        
        // Изменяем направление с учетом запрета на разворот на 180 градусов
        switch (e.key) {
            case 'ArrowUp':
                if (dy === 0) {
                    dx = 0;
                    dy = -1;
                }
                break;
            case 'ArrowDown':
                if (dy === 0) {
                    dx = 0;
                    dy = 1;
                }
                break;
            case 'ArrowLeft':
                if (dx === 0) {
                    dx = -1;
                    dy = 0;
                }
                break;
            case 'ArrowRight':
                if (dx === 0) {
                    dx = 1;
                    dy = 0;
                }
                break;
        }
    });
    
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
     
    // Первоначальная инициализация
    initGame();

    // Обработчик изменения размеров окна
    window.addEventListener('resize', () => {
        // Сохраняем состояние игры
        const wasRunning = isGameRunning;
        const wasPaused = isPaused;
        
        if (wasRunning) {
            clearInterval(gameInterval);
            isGameRunning = false;
        }
        
        // Переинициализируем игру
        initGame();
        
        // Восстанавливаем состояние игры
        if (wasRunning) {
            isGameRunning = true;
            isPaused = wasPaused;
            gameInterval = setInterval(gameLoop, 1000 / speed);
            
            if (isPaused) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ffffff';
                ctx.font = '30px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.fillText('ПАУЗА', canvas.width / 2, canvas.height / 2);
            }
        }
    });
});