function openTab(tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    const tabButtons = document.getElementsByClassName("tab-button");
    
    // Скрываем все вкладки и удаляем активный класс у кнопок
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
        tabButtons[i].classList.remove("active");
    }
    
    // Показываем выбранную вкладку и делаем кнопку активной
    document.getElementById(tabName).style.display = "block";
    document.querySelector(`.tab-button[onclick="openTab('${tabName}')"]`).classList.add("active");
}

// Инициализация: открываем первую вкладку при загрузке
document.addEventListener('DOMContentLoaded', () => {
    openTab('snake-classic');
});

// Интерактивная модель изменения вероятностей
function simulateSuccess() {
    // Увеличиваем вероятность выбранного направления
    const upProb = document.getElementById('up-prob');
    const rightProb = document.getElementById('right-prob');
    const downProb = document.getElementById('down-prob');
    const leftProb = document.getElementById('left-prob');
    
    // Выбираем случайное направление для "успеха"
    const directions = [upProb, rightProb, downProb, leftProb];
    const randomIndex = Math.floor(Math.random() * directions.length);
    const successDir = directions[randomIndex];
    
    // Получаем текущие вероятности
    let probs = {
        up: parseInt(upProb.style.getPropertyValue('--prob')),
        right: parseInt(rightProb.style.getPropertyValue('--prob')),
        down: parseInt(downProb.style.getPropertyValue('--prob')),
        left: parseInt(leftProb.style.getPropertyValue('--prob'))
    };
    
    // Увеличиваем вероятность успешного направления
    probs[successDir.id.split('-')[0]] += 10;
    
    // Уменьшаем другие вероятности
    for (const dir in probs) {
        if (dir !== successDir.id.split('-')[0]) {
            probs[dir] = Math.max(5, probs[dir] - 3);
        }
    }
    
    // Нормализуем вероятности
    const total = Object.values(probs).reduce((a, b) => a + b, 0);
    for (const dir in probs) {
        probs[dir] = Math.round((probs[dir] / total) * 100);
    }
    
    // Корректируем, чтобы сумма была 100%
    const diff = 100 - Object.values(probs).reduce((a, b) => a + b, 0);
    if (diff !== 0) {
        probs[successDir.id.split('-')[0]] += diff;
    }
    
    // Обновляем отображение
    upProb.style.setProperty('--prob', probs.up);
    upProb.textContent = `↑ ${probs.up}%`;
    
    rightProb.style.setProperty('--prob', probs.right);
    rightProb.textContent = `→ ${probs.right}%`;
    
    downProb.style.setProperty('--prob', probs.down);
    downProb.textContent = `↓ ${probs.down}%`;
    
    leftProb.style.setProperty('--prob', probs.left);
    leftProb.textContent = `← ${probs.left}%`;
    
    // Обновляем состояние
    document.querySelector('.state-value').textContent = `успешный ход (${successDir.textContent.trim()})`;
}

function simulateFailure() {
    // Уменьшаем вероятность выбранного направления
    const upProb = document.getElementById('up-prob');
    const rightProb = document.getElementById('right-prob');
    const downProb = document.getElementById('down-prob');
    const leftProb = document.getElementById('left-prob');
    
    // Выбираем случайное направление для "ошибки"
    const directions = [upProb, rightProb, downProb, leftProb];
    const randomIndex = Math.floor(Math.random() * directions.length);
    const failureDir = directions[randomIndex];
    
    // Получаем текущие вероятности
    let probs = {
        up: parseInt(upProb.style.getPropertyValue('--prob')),
        right: parseInt(rightProb.style.getPropertyValue('--prob')),
        down: parseInt(downProb.style.getPropertyValue('--prob')),
        left: parseInt(leftProb.style.getPropertyValue('--prob'))
    };
    
    // Уменьшаем вероятность ошибочного направления
    probs[failureDir.id.split('-')[0]] = Math.max(5, probs[failureDir.id.split('-')[0]] - 10);
    
    // Увеличиваем другие вероятности
    for (const dir in probs) {
        if (dir !== failureDir.id.split('-')[0]) {
            probs[dir] += 3;
        }
    }
    
    // Нормализуем вероятности
    const total = Object.values(probs).reduce((a, b) => a + b, 0);
    for (const dir in probs) {
        probs[dir] = Math.round((probs[dir] / total) * 100);
    }
    
    // Корректируем, чтобы сумма была 100%
    const diff = 100 - Object.values(probs).reduce((a, b) => a + b, 0);
    if (diff !== 0) {
        const otherDirs = Object.keys(probs).filter(d => d !== failureDir.id.split('-')[0]);
        const randomOtherDir = otherDirs[Math.floor(Math.random() * otherDirs.length)];
        probs[randomOtherDir] += diff;
    }
    
    // Обновляем отображение
    upProb.style.setProperty('--prob', probs.up);
    upProb.textContent = `↑ ${probs.up}%`;
    
    rightProb.style.setProperty('--prob', probs.right);
    rightProb.textContent = `→ ${probs.right}%`;
    
    downProb.style.setProperty('--prob', probs.down);
    downProb.textContent = `↓ ${probs.down}%`;
    
    leftProb.style.setProperty('--prob', probs.left);
    leftProb.textContent = `← ${probs.left}%`;
    
    // Обновляем состояние
    document.querySelector('.state-value').textContent = `неудачный ход (${failureDir.textContent.trim()})`;
}

function resetModel() {
    const upProb = document.getElementById('up-prob');
    const rightProb = document.getElementById('right-prob');
    const downProb = document.getElementById('down-prob');
    const leftProb = document.getElementById('left-prob');
    
    upProb.style.setProperty('--prob', 25);
    upProb.textContent = '↑ 25%';
    
    rightProb.style.setProperty('--prob', 25);
    rightProb.textContent = '→ 25%';
    
    downProb.style.setProperty('--prob', 25);
    downProb.textContent = '↓ 25%';
    
    leftProb.style.setProperty('--prob', 25);
    leftProb.textContent = '← 25%';
    
    document.querySelector('.state-value').textContent = 'начальное';
}