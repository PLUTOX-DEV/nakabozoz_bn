// bot.js
const TelegramBot = require("node-telegram-bot-api");

// Your Telegram bot token (store securely in .env)
const token = process.env.TELEGRAM_BOT_TOKEN;

// Create bot, enable polling for dev (you can change for production)
const bot = new TelegramBot(token, { polling: true });

// /start command with optional referrer param
bot.onText(/\/start(?: (.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const referrer = match[1] || "";

  const miniAppUrl = `https://t.me/Djangotestxr_bot?start=${referrer}`;

  const welcomeText = referrer
    ? `👋 Welcome! You were referred by ${referrer}.`
    : `👋 Welcome!`;

  bot.sendPhoto(chatId, "https://tpe-plutoxs-projects-1800c7ee.vercel.app/image.jpg", {
    caption: welcomeText,
    reply_markup: {
      inline_keyboard: [[
        { text: "🚀 Launch Mini App", url: miniAppUrl }
      ]],
    },
  });
});
 

module.exports = bot;
