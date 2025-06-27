const express = require("express");
const router = express.Router();
const User = require("../models/User");

// 📌 Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // just in case password exists
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get users" });
  }
});

// 📌 Create or fetch user with referral + welcome bonus logic
router.post("/login", async (req, res) => {
  try {
    const { telegramId, username, fullName, referrer, photo_url } = req.body;

    let user = await User.findOne({ telegramId });

    if (!user) {
      // 🎁 Create new user with welcome bonus
      user = await User.create({
        telegramId,
        username,
        fullName,
        balance: 10, // welcome bonus
        referredBy: referrer || null,
        photo_url: photo_url || "",
      });

      // 🎯 Reward the referrer
      if (referrer && referrer !== username) {
        const referrerUser = await User.findOne({ username: referrer });

        if (referrerUser) {
          referrerUser.referralCount = (referrerUser.referralCount || 0) + 1;
          referrerUser.referralEarnings = (referrerUser.referralEarnings || 0) + 20;
          referrerUser.balance = (referrerUser.balance || 0) + 20;

          referrerUser.referrals = referrerUser.referrals || [];
          referrerUser.referrals.push({
            username: username,
            joinedAt: new Date(),
          });

          await referrerUser.save();

          console.log(`🎉 ${referrer} earned 20 coins for referring ${username}`);
        }
      }
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Get top referrers for leaderboard
router.get("/referral-leaderboard", async (req, res) => {
  try {
    const topReferrers = await User.find({ referralCount: { $gt: 0 } })
      .sort({ referralCount: -1 })
      .limit(20)
      .select("username fullName photo_url referralCount");

    res.json(topReferrers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

// 📌 Get user by telegramId
router.get("/:telegramId", async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Update user info
router.post("/update", async (req, res) => {
  try {
    const { telegramId, ...updates } = req.body;

    const user = await User.findOneAndUpdate(
      { telegramId },
      updates,
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

module.exports = router;
