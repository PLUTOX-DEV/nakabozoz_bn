// controllers/userController.js
const User = require("../models/User");

// Get or create a user by wallet address
exports.getOrCreateUser = async (req, res) => {
  const { walletAddress } = req.body;
  if (!walletAddress) return res.status(400).json({ error: "walletAddress required" });

  try {
    let user = await User.findOne({ walletAddress });
    if (!user) {
      user = new User({ walletAddress });
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
