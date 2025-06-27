const express = require("express");
const router = express.Router();
const User = require("../models/User");

// 📌 Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password if exists
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to get users" });
  }
});

// 📌 Create or fetch user with referral reward logic
router.post("/login", async (req, res) => {
  try {
    const { telegramId, username, fullName, referrer } = req.body;

    let user = await User.findOne({ telegramId });

    if (!user) {
      // ✅ Create new user
      user = await User.create({
        telegramId,
        username,
        fullName,
        referrer: referrer || null, // store who referred this user
      });

      // ✅ Handle referral reward logic
      if (referrer && referrer !== username) {
        const referrerUser = await User.findOne({ username: referrer });

        if (referrerUser) {
          // Increment referralCount
          referrerUser.referralCount = (referrerUser.referralCount || 0) + 1;

          // Add referral earnings and balance
          referrerUser.referralEarnings += 20;
          referrerUser.balance += 20;

          // Add referral info to array
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
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Update user info (coins, VIP, etc.)
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
