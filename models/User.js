const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      required: true,
      unique: true,
    },
    username: String,
    fullName: String,
    photo_url: String,

    // Coins earned
    balance: {
      type: Number,
      default: 0,
    },

    // VIP and expiry
    isVIP: {
      type: Boolean,
      default: false,
    },
    vipExpiresAt: Date,

    // Tap multiplier
    multiplier: {
      type: Number,
      default: 1,
    },

    // Auto tap bot
    hasTapBot: {
      type: Boolean,
      default: false,
    },

    // ✅ Tap bot active toggle (user-controlled)
    isTapBotActive: {
      type: Boolean,
      default: false,
    },

    // ✅ Daily tap bot toggle limit tracking
    tapBotToggleHistory: {
      date: {
        type: String, // e.g. '2025-07-02'
        default: null,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    // ✅ Stamina system
    currentStamina: {
      type: Number,
      default: 100,
    },
    staminaRefillsToday: {
      type: Number,
      default: 0,
    },
    lastStaminaRefillDate: {
      type: Date,
    },
    staminaRegenSpeed: {
      type: Number,
      default: 10000,
    },

    // ✅ Referrals
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

    // ✅ New user status
    isNewUser: {
      type: Boolean,
      default: true,
    },

    // ✅ Tasks claimed by this user
    claimedTasks: {
      type: Map,
      of: Boolean,
      default: {},
    },

    // ✅ Spin packages
    packageType: {
      type: String,
      enum: ["free", "bronze", "silver", "gold"],
      default: "free",
    },
    packageExpiresAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
