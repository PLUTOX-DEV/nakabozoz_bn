// bot.js
const TelegramBot = require("node-telegram-bot-api");
const token = process.env.TELEGRAM_BOT_TOKEN;

// Create bot instance in webhook mode (not polling)
const bot = new TelegramBot(token, { webHook: true });

// Set webhook URL (your Render backend)
const URL = "https://nakabozoz.onrender.com"; // 🔁 Change to your backend URL
bot.setWebHook(`${URL}/bot${token}`);

// Start handler
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
