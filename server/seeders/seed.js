const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");

const db = new Database(path.join(__dirname, "store.db"));

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT,
    price       REAL    NOT NULL,
    stock       INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT    NOT NULL UNIQUE,
    password   TEXT    NOT NULL,
    role       TEXT    NOT NULL DEFAULT 'user',
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// ── Categories ────────────────────────────────────────────────────────────────
const insertCategory = db.prepare(
  "INSERT OR IGNORE INTO categories (name) VALUES (?)"
);

const categories = ["مواد غذائية وفواكه", "مستلزمات منزلية"]; // Groceries & Fruits, Home Supplies
categories.forEach((c) => insertCategory.run(c));

const catRows = db
  .prepare("SELECT id, name FROM categories")
  .all()
  .reduce((acc, r) => ({ ...acc, [r.name]: r.id }), {});

const GROCERY = catRows["مواد غذائية وفواكه"];
const HOME    = catRows["مستلزمات منزلية"];

// ── Products (16 Arabic) ──────────────────────────────────────────────────────
const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (name, description, price, stock, category_id)
  VALUES (@name, @description, @price, @stock, @category_id)
`);

const products = [
  // Groceries & Fruits (8)
  { name: "تفاح أحمر",    description: "تفاح طازج مستورد، كيلو واحد",              price: 3.50,  stock: 200, category_id: GROCERY },
  { name: "موز",          description: "موز طازج ناضج، كيلو واحد",                price: 2.75,  stock: 150, category_id: GROCERY },
  { name: "طماطم",        description: "طماطم طازجة محلية، كيلو واحد",            price: 1.99,  stock: 300, category_id: GROCERY },
  { name: "زيت زيتون",    description: "زيت زيتون بكر ممتاز، 750 مل",            price: 12.00, stock: 80,  category_id: GROCERY },
  { name: "أرز بسمتي",    description: "أرز بسمتي طويل الحبة، كيس 2 كيلو",       price: 8.50,  stock: 120, category_id: GROCERY },
  { name: "عدس أحمر",     description: "عدس أحمر مقشور، كيس 1 كيلو",             price: 4.25,  stock: 100, category_id: GROCERY },
  { name: "برتقال",       description: "برتقال طازج حلو، شبكة 3 كيلو",           price: 5.99,  stock: 180, category_id: GROCERY },
  { name: "خبز عربي",     description: "خبز عربي طازج، كيس 10 أرغفة",           price: 1.50,  stock: 250, category_id: GROCERY },

  // Home Supplies (8)
  { name: "منظف أطباق",   description: "سائل غسيل أطباق برائحة الليمون، 1 لتر",  price: 3.00,  stock: 90,  category_id: HOME },
  { name: "مسحوق غسيل",   description: "مسحوق غسيل ملابس فعّال، 3 كيلو",         price: 9.99,  stock: 70,  category_id: HOME },
  { name: "إسفنجة مطبخ",  description: "إسفنجة تنظيف مزدوجة الوجه، 3 قطع",       price: 2.25,  stock: 200, category_id: HOME },
  { name: "مناشف ورقية",  description: "مناشف ورقية ماصة، رول كبير 6 قطع",       price: 4.75,  stock: 160, category_id: HOME },
  { name: "أكياس قمامة",  description: "أكياس قمامة سوداء متينة، 30 كيس",        price: 3.50,  stock: 140, category_id: HOME },
  { name: "معطر هواء",    description: "معطر هواء بخاخ برائحة الياسمين، 300 مل", price: 5.50,  stock: 110, category_id: HOME },
  { name: "لمبة LED",     description: "لمبة LED موفرة للطاقة 12 واط",           price: 4.00,  stock: 300, category_id: HOME },
  { name: "مكنسة يدوية",  description: "مكنسة يدوية خفيفة مع مجموعة فرش",        price: 15.00, stock: 50,  category_id: HOME },
];

const insertMany = db.transaction((items) => {
  for (const item of items) insertProduct.run(item);
});
insertMany(products);

// ── Users ─────────────────────────────────────────────────────────────────────
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (email, password, role)
  VALUES (@email, @password, @role)
`);

const salt = bcrypt.genSaltSync(10);

const users = [
  { email: "admin@store.com", password: bcrypt.hashSync("admin123", salt), role: "admin" },
  { email: "test@user.com",   password: bcrypt.hashSync("user123",  salt), role: "user"  },
];

db.transaction((items) => {
  for (const u of items) insertUser.run(u);
})(users);

// ── Summary ───────────────────────────────────────────────────────────────────
const counts = {
  categories: db.prepare("SELECT COUNT(*) AS n FROM categories").get().n,
  products:   db.prepare("SELECT COUNT(*) AS n FROM products").get().n,
  users:      db.prepare("SELECT COUNT(*) AS n FROM users").get().n,
};

console.log("✅ Database seeded successfully!");
console.log(`   📦 Categories : ${counts.categories}`);
console.log(`   🛒 Products   : ${counts.products}`);
console.log(`   👤 Users      : ${counts.users}`);

db.close();
