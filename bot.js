const TelegramBot = require("node-telegram-bot-api");
const token = process.env.TELEGRAM_BOT_TOKEN;

// ✅ Webhook mode (Render-friendly)
const bot = new TelegramBot(token, { webHook: true });

// ✅ Replace with your deployed backend URL
const URL = "https://nakabozoz.onrender.com";

// ✅ Setup webhook endpoint
bot.setWebHook(`${URL}/bot${token}`);

// ✅ Handle /start with optional referral param
bot.onText(/\/start(?: (.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const referrer = match[1] || ""; // Optional referral code

  const miniAppUrl = `https://t.me/Djangotestxr_bot/SpinTPE?start=${referrer}`;

  const welcomeText = referrer
    ? `👋 Welcome! You were referred by ${referrer}.`
    : `👋 Welcome to Spin & Earn!`;

  bot.sendPhoto(chatId, "https://tpe-plutoxs-projects-1800c7ee.vercel.app/image.jpg", {
    caption: welcomeText,
    reply_markup: {
      inline_keyboard: [[
        {
          text: "🚀 Launch Mini App",
          url: miniAppUrl,
        }
      ]]
    }
  });
});

// ✅ Export for use in server.js
module.exports = bot;
