const express = require("express");
const router = express.Router();

// Make sure to import the User model
const User = require("../models/User"); // Adjust path as needed

router.get("/leaderboard", async (req, res) => {
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

// Missing export caused the "argument handler must be a function" error
module.exports = router;
