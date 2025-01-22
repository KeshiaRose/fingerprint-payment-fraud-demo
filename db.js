const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

async function initializeDatabase() {
  const db = await sqlite.open({
    filename: "database.db",
    driver: sqlite3.Database,
  });

  await createTables(db);
  return db;
}

async function createTables(db) {
  const ordersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitorId TEXT NOT NULL DEFAULT "",
      orderNum TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      coupon TEXT DEFAULT "",
      fraudulent INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const couponsTable = `
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      percent REAL NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const insertCoupons = `
    INSERT OR IGNORE INTO coupons (code, percent) VALUES
    ('SAVE10', 0.1),
    ('25OFF', 0.25),
    ('KESHIA', 0.5)
  `;

  await db.exec(ordersTable);
  await db.exec(couponsTable);
  await db.exec(insertCoupons);
}

module.exports = initializeDatabase();
