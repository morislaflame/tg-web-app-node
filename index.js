const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '6885768026:AAFmLQqvI4uU_K33ptdbXdogtaIgmkrt3Yc';
const webAppUrl = 'https://illustrious-moonbeam-437601.netlify.app';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if(text === '/start') {
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
        reply_markup: {
            keyboard: [
                [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
            ]
        }
    })

    await bot.sendMessage(chatId, 'Наш маркетплейс теперь в сети!', {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Заполнить форму', web_app: {url: webAppUrl}}]
            ]
        }
    })
  }

  if(msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data)

      await bot.sendMessage(chatId, 'Мы скоро с вами свяжемся!');
      
      await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);

      setTimeout(async () => {
        await bot.sendAnimation(chatId, 'https://i.gifer.com/BBgA.gif');
      }, 3000)

    } catch (e) {
      console.log(e);
    }
    
  }
});

app.post('/web-data', async (req, res) => {
  const {queryId, products, totalPrice} = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Успешная покупка',
      input_message_content: {message_text: 'Поздравляю с покупкой, общая сумма: ' + totalPrice}
    })
    return res.status(200).json({});
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Не удалось приобрести товар',
      input_message_content: {message_text: 'Не удалось приобрести товар'}
    })
    return res.status(500).json({});
  }
})

const PORT = 8000;

app.listen(PORT, () => console.log('Server started on PORT ' + PORT))