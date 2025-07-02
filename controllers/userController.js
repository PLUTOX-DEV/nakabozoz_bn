const User = require("../models/User");

// ✅ Telegram login and referral
exports.loginUser = async (req, res) => {
  try {
    const { telegramId, username, fullName, photo_url, referrer } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: "telegramId required" });
    }

    let user = await User.findOne({ telegramId });

    if (!user) {
      user = new User({
        telegramId,
        username,
        fullName,
        photo_url,
        referredBy: referrer && referrer !== telegramId ? referrer : null,
        isNewUser: true,
      });

      await user.save();

      if (referrer && referrer !== telegramId) {
        const referrerUser = await User.findOne({ telegramId: referrer });
        if (referrerUser) {
          referrerUser.referralCount += 1;
          referrerUser.referrals.push({ username, joinedAt: new Date() });
          await referrerUser.save();
        }
      }
    } else {
      user.username = username || user.username;
      user.fullName = fullName || user.fullName;
      user.photo_url = photo_url || user.photo_url;

      if (!user.referredBy && referrer && referrer !== telegramId) {
        user.referredBy = referrer;

        const referrerUser = await User.findOne({ telegramId: referrer });
        if (referrerUser) {
          referrerUser.referralCount += 1;
          referrerUser.referrals.push({ username, joinedAt: new Date() });
          await referrerUser.save();
        }
      }

      if (user.isNewUser) user.isNewUser = false;

      await user.save();
    }

    return res.json(user);
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// ✅ Manual referral claim via username
exports.claimReferralReward = async (req, res) => {
  const { telegramId, referrerUsername } = req.body;

  if (!telegramId || !referrerUsername) {
    return res.status(400).json({ message: "Missing telegramId or referrerUsername" });
  }

  try {
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.referredBy) {
      return res.status(400).json({ message: "Referral already claimed" });
    }

    const referrer = await User.findOne({ username: referrerUsername });
    if (!referrer) return res.status(404).json({ message: "Referrer not found" });

    // ✅ Apply rewards
    user.referredBy = referrer.telegramId;
    user.balance += 500_000;
    await user.save();

    referrer.referralCount += 1;
    referrer.referralEarnings += 1_000_000;
    referrer.balance += 1_000_000;

    if (!referrer.referrals.some(r => r.username === user.username)) {
      referrer.referrals.push({ username: user.username, joinedAt: new Date() });
    }

    await referrer.save();

    return res.json({
      message: "Referral claimed successfully",
      userReward: 500_000,
      referrerReward: 1_000_000,
    });
  } catch (err) {
    console.error("Referral error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Wallet login
exports.getOrCreateUser = async (req, res) => {
  const { walletAddress } = req.body;
  if (!walletAddress) return res.status(400).json({ error: "walletAddress required" });

  try {
    let user = await User.findOne({ walletAddress });
    if (!user) {
      user = new User({ walletAddress, tapCoins: 0, isVIP: false, referrals: [] });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Spin and reward
exports.spinAndReward = async (req, res) => {
  const { walletAddress, reward } = req.body;

  if (!walletAddress || reward === undefined) {
    return res.status(400).json({ error: "walletAddress and reward required" });
  }

  try {
    const user = await User.findOne({ walletAddress });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.tapCoins += reward;
    await user.save();

    res.json({ message: "Reward added", tapCoins: user.tapCoins });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Activate VIP
exports.activateVIP = async (req, res) => {
  const { walletAddress } = req.body;
  if (!walletAddress) return res.status(400).json({ error: "walletAddress required" });

  try {
    const user = await User.findOne({ walletAddress });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isVIP = true;
    user.vipExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    res.json({ message: "VIP activated", expiresAt: user.vipExpiresAt });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
