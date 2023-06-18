from aiogram import Bot, Dispatcher, executor, types
from aiogram.types.message import ContentType
from aiogram.types.web_app_info import WebAppInfo
import config

bot = Bot(token=config.TG_TOKEN)  # telegram bot token from bot_father
dp = Dispatcher(bot)


@dp.message_handler(commands=['site'])
async def start(message: types.Message):
    await bot.send_message(message.chat.id, text="https://kirichhh.github.io/tg_bot/")


@dp.message_handler(commands=['start'])
async def start(message: types.Message):
    markup = types.ReplyKeyboardMarkup()
    markup.add(types.KeyboardButton('Перейти в магазин',
                                    web_app=WebAppInfo(url='https://kirichhh.github.io/tg_bot/')))  # store url
    await message.answer('Добро пожаловать в PCStore, для его открытия нажмите на кнопку ниже', reply_markup=markup)


@dp.message_handler(content_types="web_app_data")
async def answer(webAppMes):
    order_cost = int(webAppMes.web_app_data.data)  # info from website. look for window.Telegram.WebApp for JS on site
    PRICE = types.LabeledPrice(label="Заказ на сумму", amount=int(order_cost) * 100)
    await bot.send_invoice(webAppMes.chat.id,
                           title="PCStore",
                           description="Оформление и оплата заказа",
                           provider_token=config.PAYMENTS_TOKEN,
                           currency="rub",
                           need_name=True,
                           need_phone_number=True,
                           need_email=True,
                           is_flexible=False,
                           prices=[PRICE],
                           start_parameter="one-month-subscription",
                           payload="test-invoice-payload")


# pre checkout
@dp.pre_checkout_query_handler(lambda query: True)
async def pre_checkout_query(pre_checkout_q: types.PreCheckoutQuery):
    await bot.answer_pre_checkout_query(pre_checkout_q.id, ok=True)


# successful payment
@dp.message_handler(content_types=ContentType.SUCCESSFUL_PAYMENT)
async def successful_payment(message: types.Message):
    await bot.send_message(message.chat.id,
                           f"Платеж на сумму {message.successful_payment.total_amount // 100} {message.successful_payment.currency} прошел успешно.\n"
                           f"Благодарим за покупку!")


if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
