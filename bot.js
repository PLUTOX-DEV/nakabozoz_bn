const TelegramBot = require("node-telegram-bot-api");

// Directly assign the token (or use process.env if preferred)
const token = process.env.TELEGRAM_BOT_TOKEN || "YOUR_BOT_TOKEN"; // Replace for dev/testing

// Webhook mode (Render-friendly)
const bot = new TelegramBot(token, { webHook: true });

// Your deployed backend URL
const BASE_URL = "https://nakabozoz.onrender.com";

// Set webhook for Telegram to forward updates
bot.setWebHook(`${BASE_URL}/bot${token}`);

// Default image and Mini App link
const IMAGE_URL = "https://tpe-plutoxs-projects-1800c7ee.vercel.app/image.jpg";
const MINI_APP_URL = "https://t.me/Nakabozobot/SpinTPE";

// ✅ Handle /start (with or without referral code)
bot.onText(/\/start(?: (.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const referrer = match[1] || null;

  // Compose welcome message
  const welcomeMessage = referrer
    ? `👋 Welcome to *Nakabozoz*!\n\n🎉 You were referred by *${referrer}*.\nGet ready to spin, tap, and earn!`
    : `👋 Welcome to *Nakabozoz* – the ultimate tap & spin Web3 mini game!\n\n🎁 Start earning rewards and invite friends to boost your gains.`;

  // Build full mini app URL with referral
  const launchUrl = referrer
    ? `${MINI_APP_URL}?start=${referrer}`
    : MINI_APP_URL;

  // Send a welcome image with button
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

// You can handle other commands here later like /help, /leaderboard, etc.

// Export the bot for use in your server.js
module.exports = bot;
