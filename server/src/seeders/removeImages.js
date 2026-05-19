import { db, initializeDatabase } from '../config/database.js';

// تهيئة قاعدة البيانات
initializeDatabase();

console.log('🗑️  جاري حذف الصور من الفئات...');

try {
  // حذف الصور من جدول الفئات
  const result1 = db.prepare("UPDATE categories SET image = '' WHERE image IS NOT NULL AND image != ''").run();
  console.log(`✅ تم حذف صور ${result1.changes} فئة`);

  // حذف الصور من جدول المنتجات
  const result2 = db.prepare("UPDATE products SET image = '' WHERE image IS NOT NULL AND image != ''").run();
  console.log(`✅ تم حذف صور ${result2.changes} منتج`);

  console.log('\n✨ اكتمل الحذف بنجاح!');
  process.exit(0);
} catch (error) {
  console.error('❌ خطأ:', error.message);
  process.exit(1);
}
