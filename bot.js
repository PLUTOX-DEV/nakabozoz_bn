const TelegramBot = require("node-telegram-bot-api");

// Use your real bot token in env or replace here for local dev
const token = process.env.TELEGRAM_BOT_TOKEN || "YOUR_BOT_TOKEN";

// Webhook mode (good for hosting on Render or similar)
const bot = new TelegramBot(token, { webHook: true });

const BASE_URL = "https://nakabozoz.onrender.com";

bot.setWebHook(`${BASE_URL}/bot${token}`);

const IMAGE_URL = "https://tpe-plutoxs-projects-1800c7ee.vercel.app/image.jpg";
const MINI_APP_URL = "https://t.me/Nakabozoz_bot/SpinTPE";

bot.onText(/\/start(?: (.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const referrer = match[1] || null;

  const welcomeMessage = referrer
    ? `👋 Welcome to *Nakabozoz*!\n\n🎉 You were referred by *${referrer}*.\nGet ready to spin, tap, and earn!`
    : `👋 Welcome to *Nakabozoz* – the ultimate tap & spin Web3 mini game!\n\n🎁 Start earning rewards and invite friends to boost your gains.`;

  // Append referral param if present
  const launchUrl = referrer
    ? `${MINI_APP_URL}?start=${encodeURIComponent(referrer)}`
    : MINI_APP_URL;

  bot.sendPhoto(chatId, IMAGE_URL, {
    caption: welcomeMessage,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[
        {
          text: "🚀 Launch Nakabozoz Mini App",
          url: launchUrl,
        }
      ]]
    }
  });
});

module.exports = bot;
