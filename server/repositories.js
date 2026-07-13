import pool from './db.js';

/**
 * Base Repository class representing Abstraction & Encapsulation of DB pool queries.
 * Showcase OOP concept: encapsulation of database interactions and private pool queries.
 */
export class Repository {
  constructor() {
    this.pool = pool;
  }

  /**
   * Encapsulated prepared query execution method.
   * Prevents SQL Injection (Network Security / DBMS security).
   */
  async query(sql, params = []) {
    const [results] = await this.pool.query(sql, params);
    return results;
  }

  /**
   * Runs queries within an active client transaction.
   */
  async getTransactionConnection() {
    return await this.pool.getConnection();
  }
}

/**
 * UserRepository handles database interactions with the 'users' table.
 * Showcase OOP concept: Inheritance (extends Repository)
 */
export class UserRepository extends Repository {
  async createUser(name, email, passwordHash, role, phone = null) {
    const sql = 'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)';
    return await this.query(sql, [name, email, passwordHash, role, phone]);
  }

  async findUserByEmail(email) {
    const sql = 'SELECT id, name, email, role, phone, password_hash, created_at FROM users WHERE email = ?';
    const rows = await this.query(sql, [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  async findUserById(id) {
    const sql = 'SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?';
    const rows = await this.query(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async upsertStudentProfile(name, phone) {
    const sql = `
      INSERT INTO student_profiles (name, phone)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE name = VALUES(name), verified_at = CURRENT_TIMESTAMP
    `;
    return await this.query(sql, [name, phone]);
  }

  async findStudentProfileByPhone(phone) {
    const sql = 'SELECT name, phone, verified_at FROM student_profiles WHERE phone = ? LIMIT 1';
    const rows = await this.query(sql, [phone]);
    return rows.length > 0 ? rows[0] : null;
  }
}

/**
 * ListingRepository handles listings schema manipulations.
 * Showcase OOP concept: Inheritance (extends Repository) and Polymorphic updates.
 */
export class ListingRepository extends Repository {
  async getAllListings() {
    const sql = 'SELECT id, title, description, image, price, location, toemail, contact_name, contact_phone, metadata_json, impressions, seller_id FROM listings ORDER BY id DESC';
    return await this.query(sql);
  }

  async getListingById(id) {
    const sql = 'SELECT id, title, description, image, price, location, toemail, contact_name, contact_phone, metadata_json, impressions, seller_id FROM listings WHERE id = ?';
    const rows = await this.query(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async incrementImpressions(id) {
    const sql = 'UPDATE listings SET impressions = impressions + 1 WHERE id = ?';
    return await this.query(sql, [id]);
  }

  async createListing({ title, description, image, price, location, toemail, name, phone, sellerId, metadataJson }) {
    const sql = `
      INSERT INTO listings (title, description, image, price, location, toemail, contact_name, contact_phone, seller_id, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return await this.query(sql, [
      title,
      description,
      image,
      price,
      location,
      toemail,
      name,
      phone,
      sellerId,
      metadataJson,
    ]);
  }

  async getSellerListings(sellerId) {
    const sql = 'SELECT id, title, description, image, price, location, toemail, contact_name, contact_phone, metadata_json, impressions, seller_id FROM listings WHERE seller_id = ? ORDER BY id DESC';
    return await this.query(sql, [sellerId]);
  }

  async getSellerPerformance(sellerId) {
    const sql = 'SELECT id, title, impressions FROM listings WHERE seller_id = ? ORDER BY impressions DESC';
    return await this.query(sql, [sellerId]);
  }

  async updateListing(id, sellerId, updates, params) {
    const sql = `UPDATE listings SET ${updates.join(', ')} WHERE id = ? AND seller_id = ?`;
    return await this.query(sql, [...params, id, sellerId]);
  }

  /**
   * DBMS Concept: Transactions (ACID properties).
   * Ensures either the listing is successfully deleted and log is inserted, or neither happen.
   */
  async deleteListingWithLog(listingId, sellerId, reason, note) {
    const conn = await this.getTransactionConnection();
    try {
      await conn.beginTransaction();

      // Step A: Insert Deletion Log
      const logSql = 'INSERT INTO listing_deletion_logs (listing_id, seller_id, reason, note) VALUES (?, ?, ?, ?)';
      await conn.query(logSql, [listingId, sellerId, reason, note]);

      // Step B: Delete the actual property listing
      const deleteSql = 'DELETE FROM listings WHERE id = ? AND seller_id = ?';
      const [result] = await conn.query(deleteSql, [listingId, sellerId]);

      if (result.affectedRows === 0) {
        throw new Error('Listing not found or not owned by landlord');
      }

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async clearAllListings() {
    const sql = 'DELETE FROM listings';
    return await this.query(sql);
  }
}

/**
 * BookmarkRepository handles listing saving mechanisms.
 * Showcase OOP concept: Inheritance
 */
export class BookmarkRepository extends Repository {
  async getBookmarksByUserId(userId) {
    const sql = `
      SELECT l.id, l.title, l.description, l.image, l.price, l.location, l.toemail, l.contact_name, l.contact_phone, l.metadata_json, l.impressions, l.seller_id
      FROM bookmarks b
      JOIN listings l ON l.id = b.listing_id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `;
    return await this.query(sql, [userId]);
  }

  async addBookmark(userId, listingId) {
    const sql = 'INSERT IGNORE INTO bookmarks (user_id, listing_id) VALUES (?, ?)';
    return await this.query(sql, [userId, listingId]);
  }

  async deleteBookmark(userId, listingId) {
    const sql = 'DELETE FROM bookmarks WHERE user_id = ? AND listing_id = ?';
    return await this.query(sql, [userId, listingId]);
  }

  async getStudentBookmarksByPhone(phone) {
    const sql = `
      SELECT l.id, l.title, l.description, l.image, l.price, l.location, l.toemail, l.contact_name, l.contact_phone, l.metadata_json, l.impressions, l.seller_id
      FROM student_bookmarks b
      JOIN listings l ON l.id = b.listing_id
      WHERE b.student_phone = ?
      ORDER BY b.created_at DESC
    `;
    return await this.query(sql, [phone]);
  }

  async addStudentBookmark(phone, listingId) {
    const sql = 'INSERT IGNORE INTO student_bookmarks (student_phone, listing_id) VALUES (?, ?)';
    return await this.query(sql, [phone, listingId]);
  }

  async deleteStudentBookmark(phone, listingId) {
    const sql = 'DELETE FROM student_bookmarks WHERE student_phone = ? AND listing_id = ?';
    return await this.query(sql, [phone, listingId]);
  }

  async upsertStudentOtp(phone, otp, expiresAt) {
    const sql = `
      INSERT INTO student_otps (phone, otp_code, expires_at)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE otp_code = VALUES(otp_code), expires_at = VALUES(expires_at), created_at = CURRENT_TIMESTAMP
    `;
    return await this.query(sql, [phone, otp, expiresAt]);
  }

  async getStudentOtp(phone) {
    const sql = 'SELECT otp_code, expires_at FROM student_otps WHERE phone = ?';
    const rows = await this.query(sql, [phone]);
    return rows.length > 0 ? rows[0] : null;
  }

  async deleteStudentOtp(phone) {
    const sql = 'DELETE FROM student_otps WHERE phone = ?';
    return await this.query(sql, [phone]);
  }
}
