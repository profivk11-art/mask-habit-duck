// Основные переменные
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let currentPeriod = 'day';

const periodDays = {
    day: 1,
    week: 7,
    month: 30,
    year: 365
};

const periodNames = {
    day: 'сегодня',
    week: 'неделю',
    month: 'месяц',
    year: 'год'
};

const mascots = {
    empty: '😴🦆',
    sad: '😢🦆',
    neutral: '😐🦆',
    good: '😊🦆',
    perfect: '🎉🦆'
};

// Полезные функции
function getToday() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

function getCompletedCountInPeriod(daysBack) {
    const today = new Date();
    let count = 0;
    habits.forEach(habit => {
        habit.completions.forEach(date => {
            try {
                const d = new Date(date);
                const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays < daysBack) count++;
            } catch (e) {}
        });
    });
    return count;
}

function getCurrentStreak() {
    if (habits.length === 0) return 0;
    let streak = 0;
    let date = new Date();
    while (true) {
        const dateStr = date.toISOString().slice(0, 10);
        const completedToday = habits.filter(h => h.completions.includes(dateStr)).length;
        if (completedToday === habits.length) {
            streak++;
            date.setDate(date.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

function updateProgress() {
    const days = periodDays[currentPeriod];
    const possible = habits.length * days;
    const actual = getCompletedCountInPeriod(days);
    const percent = possible > 0 ? (actual / possible) * 100 : 0;

    let text = '';
    if (habits.length === 0) {
        text = 'Привычек пока нет. Добавьте первую!';
    } else if (currentPeriod === 'day') {
        const completedToday = habits.filter(h => h.completions.includes(getToday())).length;
        text = `${completedToday} из ${habits.length} выполнено`;
        if (percent > 0) text += ` (${Math.round(percent)}%)`;
    } else {
        text = `${Math.round(percent)}% за ${periodNames[currentPeriod]}`;
    }

    const streak = getCurrentStreak();
    if (streak > 1) text += ` • Цепочка: ${streak} дней`;

    document.getElementById('progress-text').innerText = text;
    document.getElementById('progress-fill').style.width = percent + '%';
    
    return percent;
}

function updateMascot(percent) {
    const mascotEl = document.getElementById('mascot-happy');
    if (habits.length === 0) {
        mascotEl.innerText = mascots.empty;
        mascotEl.style.fontSize = '150px';
        document.querySelector('.progress-bar').style.display = 'none';
    } else {
        document.querySelector('.progress-bar').style.display = 'block';
        mascotEl.style.fontSize = '100px';
        if (percent >= 100) {
            mascotEl.innerText = mascots.perfect;
        } else if (percent > 70) {
            mascotEl.innerText = mascots.good;
        } else if (percent > 30) {
            mascotEl.innerText = mascots.neutral;
        } else {
            mascotEl.innerText = mascots.sad;
        }
    }
}

function renderHabits() {
    const list = document.getElementById('habits-list');
    list.innerHTML = '';

    if (habits.length === 0) {
        document.getElementById('habits-list').style.display = 'none';
        updateProgress();
        updateMascot(0);
        return;
    }

    document.getElementById('habits-list').style.display = 'block';

    habits.forEach(habit => {
        const li = document.createElement('li');

        // Название (кликабельно для редактирования)
        const textDiv = document.createElement('div');
        textDiv.className = 'habit-text';
        textDiv.textContent = habit.name;
        textDiv.style.flex = '1';
        textDiv.onclick = () => {
            const newName = prompt('Новое название привычки:', habit.name);
            if (newName && newName.trim()) {
                habit.name = newName.trim();
                saveHabits();
                render();
            }
        };

        // Кнопка удаления
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = '🗑';
        deleteBtn.style.background = 'none';
        deleteBtn.style.border = 'none';
        deleteBtn.style.color = '#ff4444';
        deleteBtn.style.fontSize = '24px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.padding = '0 10px';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Удалить привычку "${habit.name}"?`)) {
                habits = habits.filter(h => h !== habit);
                saveHabits();
                render();
            }
        };

        // Чекбокс
        const checkbox = document.createElement('div');
        checkbox.className = 'habit-checkbox';
        if (habit.completions.includes(getToday())) {
            checkbox.classList.add('checked');
        }
        checkbox.onclick = (e) => {
            e.stopPropagation();
            const today = getToday();
            const index = habit.completions.indexOf(today);
            if (index > -1) {
                habit.completions.splice(index, 1);
            } else {
                habit.completions.push(today);
            }
            saveHabits();
            render();
        };

        li.appendChild(textDiv);
        li.appendChild(deleteBtn);
        li.appendChild(checkbox);
        list.appendChild(li);
    });
}

function render() {
    document.getElementById('today-date').innerText = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    renderHabits();
    const percent = updateProgress();
    updateMascot(percent);
}

// Обработчики
document.getElementById('add-habit-btn').onclick = () => {
    const name = prompt('Название новой привычки:');
    if (name && name.trim()) {
        habits.push({ name: name.trim(), completions: [] });
        saveHabits();
        render();
    }
};

document.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = () => {
        document.querySelector('.tab.active').classList.remove('active');
        tab.classList.add('active');
        currentPeriod = tab.dataset.period;
        const percent = updateProgress();
        updateMascot(percent);
    };
});

// Запуск
Telegram.WebApp.ready();
Telegram.WebApp.expand();
render();