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

// DOM
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
themeToggle.onclick = () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
    themeToggle.textContent = isDark ? '☀️' : '🌙';
};
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

prevDayBtn.onclick = () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    renderCurrentSection();
};

nextDayBtn.onclick = () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    renderCurrentSection();
};

// Задачи
function renderTasks() {
    const list = document.getElementById('tasks-list');
    const emptyMsg = document.getElementById('tasks-empty');
    const todayStr = getCurrentDateStr();

    const completed = tasks.filter(t => t.completions.includes(todayStr)).length;
    const total = tasks.length;

    document.getElementById('tasks-progress-big').innerText = `${completed} / ${total}`;

    list.innerHTML = '';

    if (tasks.length === 0) {
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            const isCompleted = task.completions.includes(todayStr);
            if (isCompleted) li.classList.add('completed');

            const checkbox = document.createElement('div');
            checkbox.className = 'task-checkbox' + (isCompleted ? ' checked' : '');

            const text = document.createElement('div');
            text.className = 'item-text';
            text.textContent = task.name;

            const del = document.createElement('button');
            del.className = 'delete-btn';
            del.innerHTML = '🗑';

            checkbox.onclick = (e) => { e.stopPropagation(); toggleTask(index); };
            text.onclick = () => editTask(index);
            del.onclick = (e) => { e.stopPropagation(); deleteTask(index); };

            li.append(checkbox, text, del);
            list.appendChild(li);
        });
    }
}

function toggleTask(index) {
    const todayStr = getCurrentDateStr();
    const task = tasks[index];
    if (task.completions.includes(todayStr)) {
        task.completions = task.completions.filter(d => d !== todayStr);
    } else {
        task.completions.push(todayStr);
    }
    saveData();
    renderTasks();
}

function deleteTask(index) {
    if (confirm('Удалить задачу?')) {
        tasks.splice(index, 1);
        saveData();
        renderTasks();
    }
}

function editTask(index) {
    const newName = prompt('Новое название', tasks[index].name);
    if (newName) {
        tasks[index].name = newName;
        saveData();
        renderTasks();
    }
}

document.getElementById('add-task-btn').onclick = () => {
    const name = prompt('Название задачи');
    if (name) {
        tasks.push({ name, completions: [] });
        saveData();
        renderTasks();
    }
};

// Привычки
function renderHabits() {
    const list = document.getElementById('habits-list');
    const todayStr = getCurrentDateStr();
    list.innerHTML = '';
    habits.forEach((habit, index) => {
        const li = document.createElement('li');
        const isCompleted = habit.completions.includes(todayStr);
        if (isCompleted) li.classList.add('completed');

        const checkbox = document.createElement('div');
        checkbox.className = 'habit-checkbox' + (isCompleted ? ' checked' : '');

        const text = document.createElement('div');
        text.className = 'item-text';
        text.textContent = habit.name;

        const del = document.createElement('button');
        del.className = 'delete-btn';
        del.innerHTML = '🗑';

        checkbox.onclick = (e) => { e.stopPropagation(); toggleHabit(index); };
        text.onclick = () => editHabit(index);
        del.onclick = (e) => { e.stopPropagation(); deleteHabit(index); };

        li.append(checkbox, text, del);
        list.appendChild(li);
    });
    updateHabitsProgress();
}

function updateHabitsProgress() {
    const todayStr = getCurrentDateStr();
    const completed = habits.filter(h => h.completions.includes(todayStr)).length;
    const percent = habits.length > 0 ? (completed / habits.length) * 100 : 0;
    document.getElementById('habits-progress-text').innerText = `${completed} из ${habits.length} выполнено`;
    document.getElementById('habits-progress-fill').style.width = percent + '%';
}

function toggleHabit(index) {
    const todayStr = getCurrentDateStr();
    const habit = habits[index];
    if (habit.completions.includes(todayStr)) {
        habit.completions = habit.completions.filter(d => d !== todayStr);
    } else {
        habit.completions.push(todayStr);
    }
    saveData();
    renderHabits();
}

function deleteHabit(index) {
    if (confirm('Удалить привычку?')) {
        habits.splice(index, 1);
        saveData();
        renderHabits