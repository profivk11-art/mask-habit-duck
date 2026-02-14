import os
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Получение токена бота из переменных окружения
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not BOT_TOKEN:
    raise ValueError("TELEGRAM_BOT_TOKEN не найден в переменных окружения")

# URL веб-приложения (замените на ваш реальный URL)
WEB_APP_URL = os.getenv("WEB_APP_URL", "https://YOUR_DOMAIN_OR_IP/app")

# Инициализация бота и диспетчера
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Команда /start
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    """Обработчик команды /start"""
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
        [types.InlineKeyboardButton(text="📱 Открыть приложение", web_app=WebAppInfo(url=WEB_APP_URL))]
    ])
    await message.answer(
        "👋 Привет! Я бот для отслеживания привычек.\n\n"
        "Нажми кнопку ниже, чтобы открыть приложение:",
        reply_markup=keyboard
    )

# Команда /help
@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    """Обработчик команды /help"""
    help_text = (
        "📖 Справка по использованию бота:\n\n"
        "/start - Запустить приложение для отслеживания привычек\n"
        "/help - Показать эту справку\n\n"
        "Приложение открывается внутри Telegram, "
        "поэтому вам не нужно переключаться на другой экран."
    )
    await message.answer(help_text)

if __name__ == "__main__":
    # Запуск бота
    from aiogram import executor
    executor.start_polling(dp, skip_updates=True)
