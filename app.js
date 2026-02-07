// Заглушка для локального тестирования
if (typeof Telegram === 'undefined') {
    Telegram = { WebApp: { ready: () => {}, expand: () => {}, initDataUnsafe: {} } };
}

// Данные
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let goals = JSON.parse(localStorage.getItem('goals')) || [];

// Текущая дата
let currentDate = new Date();

function getCurrentDateStr() {
    return currentDate.toISOString().slice(0, 10);
}

function saveData() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('goals', JSON.stringify(goals));
}

// DOM элементы
const themeToggle = document.getElementById('theme-toggle');
const userAvatar = document.getElementById('user-avatar');
const currentDateDisplay = document.getElementById('current-date-display');
const prevDayBtn = document.getElementById('prev-day');
const nextDayBtn = document.getElementById('next-day');

// Тема
function applyTheme() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark', isDark);
    themeToggle.textContent = isDark ? '☀️' : '🌙';
}
themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
    themeToggle.textContent = isDark ? '☀️' : '🌙';
});
applyTheme();

// Аватар
function setupAvatar() {
    const user = Telegram.WebApp.initDataUnsafe.user;
    if (user && user.photo_url) {
        userAvatar.src = user.photo_url;
    }
}

// Дата
function updateDateDisplay() {
    const today = new Date();
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    let text = currentDate.toLocaleDateString('ru-RU', options);
    text = text.charAt(0).toUpperCase() + text.slice(1).replace('.', '');

    if (currentDate.toDateString() === today.toDateString()) {
        currentDateDisplay.innerText = 'Сегодня ' + text;
    } else {
        currentDateDisplay.innerText = text;
    }
}

prevDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    renderCurrentSection();
});

nextDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    renderCurrentSection();
});

// === Рендер Задач ===
function renderTasks() {
    const list = document.getElementById('tasks-list');
    const emptyMsg = document.getElementById('tasks-empty');
    const todayStr = getCurrentDateStr();

    const completed = tasks.filter(t => t.completions && t.completions.includes(todayStr)).length;
    const total = tasks.length;

    document.getElementById('tasks-progress-big').innerText = `${completed} / ${total}`;

    list.innerHTML = '';

    if (tasks.length === 0) {
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            const isCompleted = task.completions && task.completions.includes(todayStr);

            const checkbox = document.createElement('div');
            checkbox.className = 'task-checkbox' + (isCompleted ? ' checked' : '');

            const text = document.createElement('div');
            text.className = 'item-text';
            text.textContent = task.name;

            const del = document.createElement('button');
            del.className = 'delete-btn';
            del.innerHTML = '🗑';

            checkbox.addEventListener('click', (e) => { e.stopPropagation(); toggleTask(index); });
            text.addEventListener('click', () => editTask(index));
            del.addEventListener('click', (e) => { e.stopPropagation(); deleteTask(index); });

            li.append(checkbox, text, del);
            list.appendChild(li);
        });
    }
}

// === Рендер Привычек ===
function renderHabits() {
    const list = document.getElementById('habits-list');
    const emptyMsg = document.getElementById('habits-empty');
    const todayStr = getCurrentDateStr();

    const completed = habits.filter(h => h.completions && h.completions.includes(todayStr)).length;
    const total = habits.length;

    document.getElementById('habits-progress-big').innerText = `${completed} / ${total}`;

    list.innerHTML = '';

    if (habits.length === 0) {
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';

        habits.forEach((habit, index) => {
            const li = document.createElement('li');
            const isCompleted = habit.completions && habit.completions.includes(todayStr);

            const checkbox = document.createElement('div');
            checkbox.className = 'habit-checkbox' + (isCompleted ? ' checked' : '');

            const text = document.createElement('div');
            text.className = 'item-text';
            text.textContent = habit.name;

            const del = document.createElement('button');
            del.className = 'delete-btn';
            del.innerHTML = '🗑';

            checkbox.addEventListener('click', (e) => { e.stopPropagation(); toggleHabit(index); });
            text.addEventListener('click', () => editHabit(index));
            del.addEventListener('click', (e) => { e.stopPropagation(); deleteHabit(index); });

            li.append(checkbox, text, del);
            list.appendChild(li);
        });
    }
}

// === Рендер Целей ===
function renderGoals() {
    const list = document.getElementById('goals-list');
    const emptyMsg = document.getElementById('goals-empty');
    list.innerHTML = '';

    if (goals.length === 0) {
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';

        goals.forEach((goal, index) => {
            const li = document.createElement('li');

            const text = document.createElement('div');
            text.className = 'item-text';
            text.textContent = goal.name;

            const del = document.createElement('button');
            del.className = 'delete-btn';
            del.innerHTML = '🗑';

            text.addEventListener('click', () => editGoal(index));
            del.addEventListener('click', (e) => { e.stopPropagation(); deleteGoal(index); });

            li.append(text, del);
            list.appendChild(li);
        });
    }
}

// === Добавление ===
const addTaskBtn = document.getElementById('add-task-btn');
if (addTaskBtn) addTaskBtn.addEventListener('click', () => {
    const name = prompt('Название задачи');
    if (name && name.trim()) {
        tasks.push({ name: name.trim(), completions: [] });
        saveData();
        renderTasks();
        renderCurrentSection();
    }
});

const addHabitBtn = document.getElementById('add-habit-btn');
if (addHabitBtn) addHabitBtn.addEventListener('click', () => {
    const name = prompt('Название привычки');
    if (name && name.trim()) {
        habits.push({ name: name.trim(), completions: [] });
        saveData();
        renderHabits();
        renderCurrentSection();
    }
});

const addGoalBtn = document.getElementById('add-goal-btn');
if (addGoalBtn) addGoalBtn.addEventListener('click', () => {
    const name = prompt('Название цели');
    if (name && name.trim()) {
        goals.push({ name: name.trim() });
        saveData();
        renderGoals();
        renderCurrentSection();
    }
});

// === Toggle, Edit, Delete ===
function toggleTask(index) {
    const todayStr = getCurrentDateStr();
    if (!tasks[index].completions) tasks[index].completions = [];
    const pos = tasks[index].completions.indexOf(todayStr);
    if (pos > -1) tasks[index].completions.splice(pos, 1);
    else tasks[index].completions.push(todayStr);
    saveData();
    renderTasks();
    renderCurrentSection();
}

function toggleHabit(index) {
    const todayStr = getCurrentDateStr();
    if (!habits[index].completions) habits[index].completions = [];
    const pos = habits[index].completions.indexOf(todayStr);
    if (pos > -1) habits[index].completions.splice(pos, 1);
    else habits[index].completions.push(todayStr);
    saveData();
    renderHabits();
    renderCurrentSection();
}

function editTask(index) {
    const newName = prompt('Новое название', tasks[index].name);
    if (newName && newName.trim()) {
        tasks[index].name = newName.trim();
        saveData();
        renderTasks();
        renderCurrentSection();
    }
}

function deleteTask(index) {
    if (confirm('Удалить?')) {
        tasks.splice(index, 1);
        saveData();
        renderTasks();
        renderCurrentSection();
    }
}

function editHabit(index) {
    const newName = prompt('Новое название', habits[index].name);
    if (newName && newName.trim()) {
        habits[index].name = newName.trim();
        saveData();
        renderHabits();
        renderCurrentSection();
    }
}

function deleteHabit(index) {
    if (confirm('Удалить?')) {
        habits.splice(index, 1);
        saveData();
        renderHabits();
        renderCurrentSection();
    }
}

function editGoal(index) {
    const newName = prompt('Новое название', goals[index].name);
    if (newName && newName.trim()) {
        goals[index].name = newName.trim();
        saveData();
        renderGoals();
        renderCurrentSection();
    }
}

function deleteGoal(index) {
    if (confirm('Удалить?')) {
        goals.splice(index, 1);
        saveData();
        renderGoals();
        renderCurrentSection();
    }
}

// === Переключение вкладок (исправлено для надёжной работы) ===
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Клик по нижнему табу:', tab.dataset.section); // для дебага

        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

        tab.classList.add('active');
        const section = document.getElementById(tab.dataset.section + '-section');
        if (section) section.classList.add('active');

        renderCurrentSection();
    });
});

function renderCurrentSection() {
    const activeTab = document.querySelector('.tab.active');
    if (!activeTab) return;
    const active = activeTab.dataset.section;

    if (active === 'tasks') renderTasks();
    else if (active === 'habits') renderHabits();
    else if (active === 'goals') renderGoals();
    else if (active === 'stats') renderStats();
}

// === Аналитика ===
let habitsChart, tasksChart, pieChart;
let currentPeriod = 'day';

function getDatesInPeriod(period) {
    const dates = [];
    const end = new Date();
    let start = new Date();

    if (period === 'day') start.setDate(end.getDate() - 6);
    else if (period === 'week') start.setDate(end.getDate() - 28);
    else if (period === 'month') start.setMonth(end.getMonth() - 5);
    else if (period === 'year') start.setFullYear(end.getFullYear() - 1);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().slice(0, 10));
    }
    return dates;
}

function renderStats() {
    const dates = getDatesInPeriod(currentPeriod);
    const summary = document.getElementById('stats-summary');

    if (habits.length === 0 && tasks.length === 0) {
        summary.innerHTML = 'Нет данных для отображения.<br>Добавьте привычки или задачи.';
        if (habitsChart) habitsChart.destroy();
        if (tasksChart) tasksChart.destroy();
        if (pieChart) pieChart.destroy();
        return;
    }

    const completedHabits = dates.map(date => habits.filter(h => h.completions?.includes(date)).length);
    const missedHabits = completedHabits.map(c => habits.length - c);

    const completedTasks = dates.map(date => tasks.filter(t => t.completions?.includes(date)).length);
    const missedTasks = completedTasks.map(c => tasks.length - c);

    const labels = dates.map(d => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }));

    const totalHabits = habits.length * dates.length;
    const doneHabits = completedHabits.reduce((a, b) => a + b, 0);
    const habitPct = totalHabits ? Math.round(doneHabits / totalHabits * 100) : 0;

    const totalTasks = tasks.length * dates.length;
    const doneTasks = completedTasks.reduce((a, b) => a + b, 0);
    const taskPct = totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0;

    summary.innerHTML = `
        <strong>Привычки:</strong> ${doneHabits} / ${totalHabits} (${habitPct}%)<br>
        <strong>Задачи:</strong> ${doneTasks} / ${totalTasks} (${taskPct}%)
    `;

    // Привычки — stacked bar
    if (habitsChart) habitsChart.destroy();
    habitsChart = new Chart(document.getElementById('habits-bar-chart'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Выполнено', data: completedHabits, backgroundColor: '#4285f4' },
                { label: 'Пропущено', data: missedHabits, backgroundColor: '#ea4335' }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } },
            scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
        }
    });

    // Задачи — stacked bar
    if (tasksChart) tasksChart.destroy();
    tasksChart = new Chart(document.getElementById('tasks-bar-chart'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Выполнено', data: completedTasks, backgroundColor: '#34a853' },
                { label: 'Пропущено', data: missedTasks, backgroundColor: '#ea4335' }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } },
            scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
        }
    });

    // Круговая диаграмма привычек
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(document.getElementById('habits-pie-chart'), {
        type: 'doughnut',
        data: {
            labels: ['Выполнено', 'Пропущено'],
            datasets: [{
                data: [doneHabits, totalHabits - doneHabits],
                backgroundColor: ['#4285f4', '#ea4335']
            }]
        },
        options: { responsive: true }
    });
}

// Переключение периода в аналитике
document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPeriod = btn.dataset.period;
        renderStats();
    });
});

// Инициализация
setupAvatar();
updateDateDisplay();
renderCurrentSection();

Telegram.WebApp.ready();
Telegram.WebApp.expand();