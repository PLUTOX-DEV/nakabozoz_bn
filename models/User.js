const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
  },
  username: String,
  fullName: String,
  photo_url: String,

  balance: {
    type: Number,
    default: 0,
  },
  isVIP: {
    type: Boolean,
    default: false,
  },
  vipExpiresAt: Date,

  multiplier: {
    type: Number,
    default: 1,
  },
  hasTapBot: {
    type: Boolean,
    default: false,
  },
  staminaRegenSpeed: {
    type: Number,
    default: 10000,
  },

  // ✅ Referral tracking
  referredBy: String,
  referralCount: {
    type: Number,
    default: 0,
  },
  referralEarnings: {
    type: Number,
    default: 0,
  },
  referrals: [
    {
      username: String,
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // ✅ New user welcome tracking
  isNewUser: {
    type: Boolean,
    default: true,
  },

  // ✅ Task claiming tracking
  claimedTasks: {
    type: Map,
    of: Boolean,
    default: {},
  },

  // ✅ Package system for Spin
  packageType: {
    type: String,
    enum: ["free", "bronze", "silver", "gold"],
    default: "free",
  },
  packageExpiresAt: Date,

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema); 