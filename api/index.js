const express = require("express");
const router = express.Router();
const initializeDatabase = require("../db");
let db;

(async () => {
  try {
    db = await initializeDatabase;
  } catch (err) {
    console.error("Error initializing database:", err.message);
  }
})();

// TODO: Import the unsealEventsResponse function from the fingerprintjs-pro-server-api package

router.post("/process-order", async (req, res) => {
  // TODO: Get Fingerprint sealed result
  const { items, coupon, total } = req.body;
  const orderNum = Math.floor(Math.random() * 1000000);

  // TODO: Get visitorId from the sealed result

  // TODO: Check for bot detection

  // TODO: Check for high suspect score

  // TODO: Check for past fraudulent orders

  // TODO: Include visitorId in the order
  await db.run(
    "INSERT INTO orders (orderNum, items, total, coupon) VALUES (?, ?, ?, ?)",
    [orderNum, JSON.stringify(items), total, coupon]
  );

  res.cookie("orderNum", orderNum, { httpOnly: true });
  return res.send({ success: true });
});

router.post("/validate-coupon", async (req, res) => {
  // TODO: Get Fingerprint sealed result
  const { coupon } = req.body;

  // TODO: Get visitorId from the sealed result

  // TODO: Check if coupon has already been used

  const validCoupon = await db.get(
    `SELECT percent FROM coupons WHERE code = ?`,
    [coupon]
  );
  if (!validCoupon) return res.send({ error: "Invalid coupon!" });

  return res.send({ success: true, percent: validCoupon.percent });
});

// TODO: Implement a function to unsealed the fingerprint sealed result

// TODO: Implement a function to check for past fraudulent orders

module.exports = router;
