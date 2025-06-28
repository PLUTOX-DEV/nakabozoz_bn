const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// 📌 /start command with optional referral param
bot.onText(/\/start(?: (.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const referrer = match[1] || "";

const miniAppUrl = `https://t.me/Djangotestxr_bot/webapp?start=${referrer}`;

  const welcomeText = referrer
    ? `👋 Welcome! You were referred by *${referrer}*.\n\nTap the button below to launch the app 👇`
    : `👋 Welcome! Tap the button below to launch the app 👇`;

  bot.sendPhoto(
    chatId,
    "https://tpe-plutoxs-projects-1800c7ee.vercel.app/bg.jpg", // ✅ Make sure this image exists
    {
      caption: welcomeText,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[
          {
            text: "🚀 Launch Mini App",
            web_app: {
              url: appUrl,
            },
          },
        ]],
      },
    }
  );
});

module.exports = bot;
