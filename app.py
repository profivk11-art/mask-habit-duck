import os
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

# Инициализация Flask приложения
app = Flask(__name__)
# Включение CORS для поддержки запросов из Telegram Web Apps
CORS(app)

# Простое хранилище данных в памяти (для демонстрации)
# В реальном приложении используйте базу данных
habits_db = {}

@app.route('/')
def index():
    """Главная страница"""
    return render_template('index.html')

@app.route('/app')
def web_app():
    """Страница для Telegram Web App"""
    return render_template('index.html')

@app.route('/api/habits', methods=['GET'])
def get_habits():
    """Получить список привычек пользователя"""
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    # Если у пользователя еще нет привычек, создаем пустой список
    if user_id not in habits_db:
        habits_db[user_id] = []

    return jsonify({'habits': habits_db[user_id]})

@app.route('/api/add-habit', methods=['POST'])
def add_habit():
    """Добавить новую привычку"""
    data = request.json
    user_id = data.get('user_id')
    habit_name = data.get('habit_name')

    if not user_id or not habit_name:
        return jsonify({'error': 'user_id and habit_name are required'}), 400

    # Если у пользователя еще нет привычек, создаем пустой список
    if user_id not in habits_db:
        habits_db[user_id] = []

    # Добавляем новую привычку
    new_habit = {
        'id': len(habits_db[user_id]) + 1,
        'name': habit_name,
        'completed': False,
        'created_at': str(datetime.now())
    }
    habits_db[user_id].append(new_habit)

    return jsonify({'success': True, 'habit': new_habit})

@app.route('/api/mark-completed', methods=['POST'])
def mark_completed():
    """Отметить привычку как выполненную"""
    data = request.json
    user_id = data.get('user_id')
    habit_id = data.get('habit_id')

    if not user_id or habit_id is None:
        return jsonify({'error': 'user_id and habit_id are required'}), 400

    # Находим привычку и отмечаем её как выполненную
    if user_id in habits_db:
        for habit in habits_db[user_id]:
            if habit['id'] == habit_id:
                habit['completed'] = not habit['completed']
                return jsonify({'success': True, 'habit': habit})

    return jsonify({'error': 'Habit not found'}), 404

@app.route('/api/delete-habit', methods=['POST'])
def delete_habit():
    """Удалить привычку"""
    data = request.json
    user_id = data.get('user_id')
    habit_id = data.get('habit_id')

    if not user_id or habit_id is None:
        return jsonify({'error': 'user_id and habit_id are required'}), 400

    # Удаляем привычку из списка
    if user_id in habits_db:
        habits_db[user_id] = [h for h in habits_db[user_id] if h['id'] != habit_id]
        return jsonify({'success': True})

    return jsonify({'error': 'Habit not found'}), 404

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Получить статистику по привычкам"""
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    if user_id not in habits_db:
        habits_db[user_id] = []

    total_habits = len(habits_db[user_id])
    completed_habits = sum(1 for h in habits_db[user_id] if h['completed'])

    return jsonify({
        'total': total_habits,
        'completed': completed_habits,
        'percentage': round((completed_habits / total_habits * 100) if total_habits > 0 else 0, 2)
    })

if __name__ == '__main__':
    # Запуск Flask приложения
    app.run(host='0.0.0.0', port=5000, debug=True)
