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
const {
  unsealEventsResponse,
} = require("@fingerprintjs/fingerprintjs-pro-server-api");

router.post("/process-order", async (req, res) => {
  // TODO: Get Fingerprint sealed result
  const { items, coupon, total, sealedResult } = req.body;
  const orderNum = Math.floor(Math.random() * 1000000);

  // TODO: Get visitorId from the sealed result
  const event = await getFingerprintData(sealedResult);
  const visitorId = event.products.identification.data.visitorId;
  if (!visitorId) return res.send({ success: false, error: "Order failed!" });

  // TODO: Check for bot detection
  const botDetection = event.products.botd.data.bot.result;
  if (botDetection !== "notDetected")
    return res.send({ success: false, error: "Order failed!" });

  // TODO: Check for high suspect score
  const suspectScore = event.products.suspectScore.data.result;
  if (suspectScore > 12)
    return res.send({
      success: false,
      warning: "Please contact support to complete your order.",
    });

  // TODO: Check for past fraudulent orders
  const pastFraud = await checkForFraud(visitorId);
  if (pastFraud)
    return res.send({
      success: false,
      error: "Order failed!",
    });

  // TODO: Include visitorId in the order
  await db.run(
    "INSERT INTO orders (orderNum, items, total, coupon, visitorId) VALUES (?, ?, ?, ?, ?)",
    [orderNum, JSON.stringify(items), total, coupon, visitorId]
  );

  res.cookie("orderNum", orderNum, { httpOnly: true });
  return res.send({ success: true });
});

router.post("/validate-coupon", async (req, res) => {
  // TODO: Get Fingerprint sealed result
  const { coupon, sealedResult } = req.body;

  // TODO: Get visitorId from the sealed result
  const event = await getFingerprintData(sealedResult);
  const visitorId = event.products.identification.data.visitorId;
  if (!visitorId) return res.send({ success: false, error: "Invalid coupon!" });

  // TODO: Check if coupon has already been used
  const usedCoupon = await db.all(
    `SELECT COUNT(*) AS count
        FROM orders
        WHERE visitorId = ?
        AND coupon = ?`,
    [visitorId, coupon]
  );
  if (usedCoupon[0].count > 0)
    return res.send({ error: "Coupon already used!" });

  const validCoupon = await db.get(
    `SELECT percent FROM coupons WHERE code = ?`,
    [coupon]
  );
  if (!validCoupon) return res.send({ error: "Invalid coupon!" });

  return res.send({ success: true, percent: validCoupon.percent });
});

// TODO: Implement the getFingerprintData function
async function getFingerprintData(sealedResult) {
  const decryptionKey = process.env.FINGERPRINT_ENCRYPTION_KEY;

  const unsealedData = await unsealEventsResponse(
    Buffer.from(sealedResult, "base64"),
    [
      {
        key: Buffer.from(decryptionKey, "base64"),
        algorithm: "aes-256-gcm",
      },
    ]
  );
  return unsealedData;
}

// TODO: Implement the checkForFraud function
async function checkForFraud(visitorId) {
  const rows = await db.all(
    `SELECT COUNT(*) AS count
        FROM orders
        WHERE visitorId = ?
        AND fraudulent`,
    [visitorId]
  );

  if (rows[0].count > 0) return true;

  return false;
}

module.exports = router;
