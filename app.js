// Данные
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let goals = JSON.parse(localStorage.getItem('goals')) || [];

// DOM
const mascotEl = document.getElementById('mascot');
const themeToggle = document.getElementById('theme-toggle');

// Тема
function applyTheme() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark', isDark);
    themeToggle.textContent = isDark ? '☀️' : '🌙';
}
themeToggle.onclick = () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
    themeToggle.textContent = isDark ? '☀️' : '🌙';
};
applyTheme();

// Переключение разделов
document.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = () => {
        document.querySelector('.tab.active').classList.remove('active');
        tab.classList.add('active');
        document.querySelector('.section.active').classList.remove('active');
        document.getElementById(tab.dataset.section + '-section').classList.add('active');
        renderCurrentSection();
    };
});

function renderCurrentSection() {
    const active = document.querySelector('.tab.active').dataset.section;
    if (active === 'habits') renderHabits();
    if (active === 'tasks') renderTasks();
    if (active === 'goals') renderGoals();
    if (active === 'stats') renderStats();
}

// === Привычки ===
function getToday() {
    return new Date().toISOString().slice(0, 10);
}

function updateHabitsProgress() {
    const completed = habits.filter(h => h.completions.includes(getToday())).length;
    const percent = habits.length > 0 ? (completed / habits.length) * 100 : 0;
    document.getElementById('habits-progress-text').innerText = `${completed} из ${habits.length} выполнено`;
    document.getElementById('habits-progress-fill').style.width = percent + '%';
    updateMascot(percent);
}

function updateMascot(percent) {
    if (habits.length === 0) mascotEl.innerText = '😴🦆';
    else if (percent >= 100) mascotEl.innerText = '🎉🦆';
    else if (percent > 70) mascotEl.innerText = '😊🦆';
    else if (percent > 30) mascotEl.innerText = '😐🦆';
    else mascotEl.innerText = '😢🦆';
}

function renderHabits() {
    const list = document.getElementById('habits-list');
    list.innerHTML = '';
    habits.forEach((habit, index) => {
        const li = document.createElement('li');
        const text = document.createElement('div');
        text.className = 'habit-text';
        text.textContent = habit.name;
        text.onclick = () => editHabit(index);

        const del = document.createElement('button');
        del.innerText = '🗑';
        del.style = 'background:none;border:none;color:#ff4444;font-size:24px;cursor:pointer;';
        del.onclick = () => deleteHabit(index);

        const checkbox = document.createElement('div');
        checkbox.className = 'habit-checkbox';
        if (habit.completions.includes(getToday())) checkbox.classList.add('checked');
        checkbox.onclick = () => toggleHabit(index);

        li.append(text, del, checkbox);
        list.appendChild(li);
    });
    updateHabitsProgress();
}

function editHabit(index) {
    const newName = prompt('Новое название:', habits[index].name);
    if (newName && newName.trim()) {
        habits[index].name = newName.trim();
        saveHabits();
        renderHabits();
    }
}

function deleteHabit(index) {
    if (confirm(`Удалить "${habits[index].name}"?`)) {
        habits.splice(index, 1);
        saveHabits();
        renderHabits();
    }
}

function toggleHabit(index) {
    const today = getToday();
    const idx = habits[index].completions.indexOf(today);
    if (idx > -1) habits[index].completions.splice(idx, 1);
    else habits[index].completions.push(today);
    saveHabits();
    renderHabits();
}

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

document.getElementById('add-habit-btn').onclick = () => {
    const name = prompt('Название привычки:');
    if (name && name.trim()) {
        habits.push({ name: name.trim(), completions: [] });
        saveHabits();
        renderHabits();
    }
};

// === Задачи ===
function updateTasksProgress() {
    const completed = tasks.filter(t => t.completed).length;
    const percent = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
    document.getElementById('tasks-progress-text').innerText = `${completed} из ${tasks.length} выполнено`;
    document.getElementById('tasks-progress-fill').style.width = percent + '%';
}

function renderTasks() {
    const list = document.getElementById('tasks-list');
    list.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        const text = document.createElement('div');
        text.className = 'task-text';
        text.textContent = task.name;
        text.onclick = () => editTask(index);

        const del = document.createElement('button');
        del.innerText = '🗑';
        del.style = 'background:none;border:none;color:#ff4444;font-size:24px;cursor:pointer;';
        del.onclick = () => deleteTask(index);

        const checkbox = document.createElement('div');
        checkbox.className = 'task-checkbox';
        if (task.completed) checkbox.classList.add('checked');
        checkbox.onclick = () => toggleTask(index);

        li.append(text, del, checkbox);
        list.appendChild(li);
    });
    updateTasksProgress();
}

function editTask(index) {
    const newName = prompt('Новое название:', tasks[index].name);
    if (newName && newName.trim()) {
        tasks[index].name = newName.trim();
        saveTasks();
        renderTasks();
    }
}

function deleteTask(index) {
    if (confirm(`Удалить задачу "${tasks[index].name}"?`)) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

document.getElementById('add-task-btn').onclick = () => {
    const name = prompt('Название задачи:');
    if (name && name.trim()) {
        tasks.push({ name: name.trim(), completed: false });
        saveTasks();
        renderTasks();
    }
};

// === Цели на год ===
function renderGoals() {
    const list = document.getElementById('goals-list');
    list.innerHTML = '';
    goals.forEach((goal, index) => {
        const li = document.createElement('li');
        li.className = 'goal-item';

        const name = document.createElement('div');
        name.className = 'goal-name';
        name.textContent = `${goal.name} (${goal.progress}%)`;
        name.onclick = () => editGoalName(index);

        const progressBar = document.createElement('div');
        progressBar.className = 'goal-progress-bar';
        const fill = document.createElement('div');
        fill.className = 'goal-progress-fill';
        fill.style.width = goal.progress + '%';
        progressBar.appendChild(fill);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 100;
        slider.value = goal.progress;
        slider.className = 'goal-slider';
        slider.oninput = () => updateGoalProgress(index, slider.value, fill);

        const del = document.createElement('button');
        del.innerText = '🗑';
        del.style = 'align-self: flex-end; background:none; border:none; color:#ff4444; font-size:24px; cursor:pointer; margin-top:10px;';
        del.onclick = () => deleteGoal(index);

        li.append(name, progressBar, slider, del);
        list.appendChild(li);
    });
}

function editGoalName(index) {
    const newName = prompt('Новое название цели:', goals[index].name);
    if (newName && newName.trim()) {
        goals[index].name = newName.trim();
        saveGoals();
        renderGoals();
    }
}

function updateGoalProgress(index, value, fill) {
    goals[index].progress = parseInt(value);
    fill.style.width = value + '%';
    saveGoals();
    renderGoals(); // обновляем текст %
}

function deleteGoal(index) {
    if (confirm(`Удалить цель "${goals[index].name}"?`)) {
        goals.splice(index, 1);
        saveGoals();
        renderGoals();
    }
}

function saveGoals() {
    localStorage.setItem('goals', JSON.stringify(goals));
}

document.getElementById('add-goal-btn').onclick = () => {
    const name = prompt('Название цели:');
    if (name && name.trim()) {
        goals.push({ name: name.trim(), progress: 0 });
        saveGoals();
        renderGoals();
    }
};

// === Аналитика ===
let pieChart, lineChart;

function renderStats() {
    document.getElementById('stats-summary').innerText = `Привычек: ${habits.length}, Задач выполнено: ${tasks.filter(t => t.completed).length}/${tasks.length}, Целей: ${goals.length}`;

    // Круговой: сегодня
    const todayCompleted = habits.filter(h => h.completions.includes(getToday())).length;
    const todayData = {
        labels: ['Выполнено', 'Осталось'],
        datasets: [{ data: [todayCompleted, habits.length - todayCompleted], backgroundColor: ['#4caf50', '#e0e0e0'] }]
    };
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(document.getElementById('habits-pie-chart'), { type: 'doughnut', data: todayData, options: { responsive: true } });

    // Линейный: последние 30 дней
    const labels = [];
    const data = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().slice(0, 10);
        labels.push(dateStr.slice(5));
        const completed = habits.filter(h => h.completions.includes(dateStr)).length;
        data.push(habits.length > 0 ? (completed / habits.length) * 100 : 0);
    }
    const lineData = { labels, datasets: [{ label: 'Выполнение %', data, borderColor: '#4caf50', fill: false }] };
    if (lineChart) lineChart.destroy();
    lineChart = new Chart(document.getElementById('habits-line-chart'), { type: 'line', data: lineData, options: { responsive: true } });
}

// Инициализация
Telegram.WebApp.ready();
Telegram.WebApp.expand();
document.getElementById('today-date').innerText = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
renderCurrentSection();