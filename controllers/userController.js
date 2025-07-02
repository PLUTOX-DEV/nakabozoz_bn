// controllers/userController.js
// controllers/userController.js
const User = require("../models/User");

exports.loginUser = async (req, res) => {
  try {
    const { telegramId, username, fullName, photo_url, referrer } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: "telegramId required" });
    }

    let user = await User.findOne({ telegramId });

    if (!user) {
      // New user sign-up
      user = new User({
        telegramId,
        username,
        fullName,
        photo_url,
        referredBy: referrer && referrer !== telegramId ? referrer : null,
        isNewUser: true,
      });

      // Save new user
      await user.save();

      // If referred, update the referrer user
      if (referrer && referrer !== telegramId) {
        const referrerUser = await User.findOne({ telegramId: referrer });
        if (referrerUser) {
          // Increment referral count and add to referrals list
          referrerUser.referralCount = (referrerUser.referralCount || 0) + 1;
          referrerUser.referrals = referrerUser.referrals || [];

          // Add the new user to referrals array if not already there
          if (!referrerUser.referrals.some(r => r.username === username)) {
            referrerUser.referrals.push({ username, joinedAt: new Date() });
          }

          await referrerUser.save();
        }
      }
    } else {
      // Existing user - update info
      user.username = username || user.username;
      user.fullName = fullName || user.fullName;
      user.photo_url = photo_url || user.photo_url;

      // If user had no referrer but now has one, set it
      if (!user.referredBy && referrer && referrer !== telegramId) {
        user.referredBy = referrer;

        // Update the referrer info as well
        const referrerUser = await User.findOne({ telegramId: referrer });
        if (referrerUser) {
          referrerUser.referralCount = (referrerUser.referralCount || 0) + 1;
          referrerUser.referrals = referrerUser.referrals || [];
          if (!referrerUser.referrals.some(r => r.username === username)) {
            referrerUser.referrals.push({ username, joinedAt: new Date() });
          }
          await referrerUser.save();
        }
      }

      // Mark not new user anymore
      if (user.isNewUser) user.isNewUser = false;

      await user.save();
    }

    return res.json(user);
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


// Get or create user by wallet address
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

// Spin and reward user
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

// Activate VIP
exports.activateVIP = async (req, res) => {
  const { walletAddress } = req.body;
  if (!walletAddress) return res.status(400).json({ error: "walletAddress required" });

  try {
    const user = await User.findOne({ walletAddress });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isVIP = true;
    user.vipExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    await user.save();

    res.json({ message: "VIP activated", expiresAt: user.vipExpiresAt });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
