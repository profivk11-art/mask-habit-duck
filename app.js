// Данные
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

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
    return percent;
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
    habits.forEach(habit => {
        const li = document.createElement('li');
        const text = document.createElement('div');
        text.className = 'habit-text';
        text.textContent = habit.name;
        text.onclick = () => {
            const newName = prompt('Новое название:', habit.name);
            if (newName && newName.trim()) {
                habit.name = newName.trim();
                saveHabits();
                renderHabits();
            }
        };

        const del = document.createElement('button');
        del.innerText = '🗑';
        del.style = 'background:none;border:none;color:#ff4444;font-size:24px;cursor:pointer;';
        del.onclick = () => {
            if (confirm(`Удалить "${habit.name}"?`)) {
                habits = habits.filter(h => h !== habit);
                saveHabits();
                renderHabits();
            }
        };

        const checkbox = document.createElement('div');
        checkbox.className = 'habit-checkbox';
        if (habit.completions.includes(getToday())) checkbox.classList.add('checked');
        checkbox.onclick = () => {
            const today = getToday();
            const idx = habit.completions.indexOf(today);
            if (idx > -1) habit.completions.splice(idx, 1);
            else habit.completions.push(today);
            saveHabits();
            renderHabits();
        };

        li.append(text, del, checkbox);
        list.appendChild(li);
    });
    updateHabitsProgress();
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
    tasks.forEach(task => {
        const li = document.createElement('li');
        const text = document.createElement('div');
        text.className = 'task-text';
        text.textContent = task.name;
        text.onclick = () => {
            const newName = prompt('Новое название:', task.name);
            if (newName && newName.trim()) {
                task.name = newName.trim();
                saveTasks();
                renderTasks();
            }
        };

        const del = document.createElement('button');
        del.innerText = '🗑';
        del.style = 'background:none;border:none;color:#ff4444;font-size:24px;cursor:pointer;';
        del.onclick = () => {
            if (confirm(`Удалить задачу "${task.name}"?`)) {
                tasks = tasks.filter(t => t !== task);
                saveTasks();
                renderTasks();
            }
        };

        const checkbox = document.createElement('div');
        checkbox.className = 'task-checkbox';
        if (task.completed) checkbox.classList.add('checked');
        checkbox.onclick = () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        };

        li.append(text, del, checkbox);
        list.appendChild(li);
    });
    updateTasksProgress();
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

// Инициализация
Telegram.WebApp.ready();
Telegram.WebApp.expand();
document.getElementById('today-date').innerText = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
renderCurrentSection();