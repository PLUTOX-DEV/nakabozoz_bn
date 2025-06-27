const express = require("express");
const router = express.Router();
const User = require("../models/User");

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

module.exports = router;
