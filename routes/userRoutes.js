const express = require("express");
const router = express.Router();
const User = require("../models/User");
const dayjs = require("dayjs");

// 📌 Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to get users" });
  }
});

// 📌 Login or create user
router.post("/login", async (req, res) => {
  const { telegramId, username, fullName, referrer, photo_url } = req.body;

  try {
    let user = await User.findOne({ telegramId });

    if (!user) {
      user = await User.create({
        telegramId,
        username,
        fullName,
        balance: 10,
        referredBy: referrer || null,
        photo_url: photo_url || "",
      });

      if (referrer && referrer !== username) {
        const referrerUser = await User.findOne({ username: referrer });
        if (referrerUser) {
          referrerUser.referralCount += 1;
          referrerUser.referralEarnings += 20;
          referrerUser.balance += 20;
          referrerUser.referrals.push({ username, joinedAt: new Date() });
          await referrerUser.save();
        }
      }
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Referral leaderboard
router.get("/referral-leaderboard", async (req, res) => {
  try {
    const topReferrers = await User.find({ referralCount: { $gt: 0 } })
      .sort({ referralCount: -1 })
      .limit(20)
      .select("username fullName photo_url referralCount");

    res.json(topReferrers);
  } catch (err) {
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

// 📌 Buy Tap Bot
router.post("/buy-tap-bot", async (req, res) => {
  const { telegramId } = req.body;

  try {
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.hasTapBot) return res.status(400).json({ message: "Tap Bot already owned" });
    if (user.balance < 100) return res.status(400).json({ message: "Not enough coins" });

    user.balance -= 100;
    user.hasTapBot = true;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Error buying Tap Bot", error: err.message });
  }
});

// ✅ Refill Stamina
router.post("/refill-stamina", async (req, res) => {
  const { telegramId } = req.body;

  try {
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const today = dayjs().format("YYYY-MM-DD");
    const lastRefill = user.lastStaminaRefillDate ? dayjs(user.lastStaminaRefillDate).format("YYYY-MM-DD") : null;

    if (user.balance < 20) {
      return res.status(400).json({ message: "Not enough coins to refill" });
    }

    if (lastRefill !== today) {
      user.staminaRefillsToday = 0;
    }

    if (user.staminaRefillsToday >= 4) {
      return res.status(400).json({ message: "Daily refill limit reached" });
    }

    user.currentStamina = 100;
    user.balance -= 20;
    user.staminaRefillsToday += 1;
    user.lastStaminaRefillDate = new Date();
    await user.save();

    res.json({
      message: "Stamina refilled",
      currentStamina: user.currentStamina,
      refillsLeft: 4 - user.staminaRefillsToday,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to refill stamina", error: err.message });
  }
});

// ✅ Toggle Tap Bot (Activate/Deactivate)
router.post("/toggle-tap-bot", async (req, res) => {
  const { telegramId } = req.body;

  try {
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.hasTapBot) {
      return res.status(403).json({ message: "User does not own Tap Bot" });
    }

    const today = dayjs().format("YYYY-MM-DD");

    if (user.tapBotToggleHistory?.date !== today) {
      user.tapBotToggleHistory = { date: today, count: 0 };
    }

    if (user.tapBotToggleHistory.count >= 4) {
      return res.status(400).json({ message: "Daily toggle limit reached" });
    }

    user.isTapBotActive = !user.isTapBotActive;
    user.tapBotToggleHistory.count += 1;

    await user.save();

    res.json({
      message: `Tap Bot ${user.isTapBotActive ? "activated" : "deactivated"}`,
      isTapBotActive: user.isTapBotActive,
      togglesLeft: 4 - user.tapBotToggleHistory.count,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle tap bot", error: err.message });
  }
});

// 📌 Get user by telegramId
router.get("/:telegramId", async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Update user info
router.post("/update", async (req, res) => {
  try {
    const { telegramId, ...updates } = req.body;

    if (updates.multiplier !== undefined) {
      updates.multiplier = Math.min(20, updates.multiplier);
    }
    if (updates.staminaRegenSpeed !== undefined) {
      updates.staminaRegenSpeed = Math.max(2000, updates.staminaRegenSpeed);
    }

    const user = await User.findOneAndUpdate({ telegramId }, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

module.exports = router;
