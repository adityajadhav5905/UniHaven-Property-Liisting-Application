
CREATE DATABASE IF NOT EXISTS realestate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE realestate;


CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','seller') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image LONGTEXT NULL,
  price VARCHAR(60) NOT NULL,
  location VARCHAR(160) NOT NULL,
  toemail VARCHAR(190) NULL,
  contact_name VARCHAR(120) NULL,
  contact_phone VARCHAR(40) NULL,
  metadata_json JSON NULL,
  impressions INT NOT NULL DEFAULT 0,
  seller_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (seller_id),
  CONSTRAINT fk_listings_users FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL
);


 CREATE TABLE IF NOT EXISTS bookmarks (
   id INT AUTO_INCREMENT PRIMARY KEY,
   user_id INT NOT NULL,
   listing_id INT NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   UNIQUE KEY user_listing (user_id, listing_id),
   INDEX (listing_id),
   CONSTRAINT fk_bookmarks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
   CONSTRAINT fk_bookmarks_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
 );

CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  otp_code VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_bookmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_phone VARCHAR(20) NOT NULL,
  listing_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY student_listing (student_phone, listing_id),
  INDEX (listing_id),
  CONSTRAINT fk_student_bookmarks_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS listing_deletion_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  seller_id INT NOT NULL,
  reason VARCHAR(120) NOT NULL,
  note VARCHAR(255) NULL,
  deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


