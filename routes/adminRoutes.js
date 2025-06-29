const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ Hardcoded admin key (same as used in frontend)
const ADMIN_KEY = "my_super_secret_key"; // 🔒 Replace with your actual key

// ✅ Admin Middleware with Debug Logging
const adminAuth = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];

  if (adminKey === ADMIN_KEY) {
    console.log("✅ Admin key matched.");
    return next();
  }

  console.warn("❌ Admin key mismatch", {
    received: adminKey,
    expected: ADMIN_KEY,
  });

  return res.status(403).json({
    success: false,
    message: "Forbidden: Invalid or missing admin key",
    received: adminKey || null,
  });
};

// ✅ GET /api/admin/users
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error("❌ Error fetching users:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ GET /api/admin/users/:id
router.get("/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Error fetching user:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ PUT /api/admin/users/:id
router.put("/users/:id", adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password");

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Error updating user:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ DELETE /api/admin/users/:id
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("❌ Error deleting user:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
