import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository, BookmarkRepository } from './repositories.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_prod';
const MAX_GALLERY_IMAGES = 8;

/**
 * AuthService handles business logic for authentication.
 * Showcase OOP concept: Abstraction & Encapsulation of security protocols.
 */
export class AuthService {
  constructor() {
    this.userRepo = new UserRepository();
    this.bookmarkRepo = new BookmarkRepository();
  }

  async hashPassword(password) {
    // Network Security: Cryptographic hashing using Bcrypt
    return await bcrypt.hash(password, 10);
  }

  async comparePasswords(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  generateToken(user) {
    // Network Security: Signed JSON Web Tokens for stateless access validation
    return jwt.sign(
      { userId: user.id, role: user.role, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      throw new Error('Invalid token');
    }
  }

  generateOtpCode() {
    // Random 6 digit OTP code
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  async sendOtp(phone) {
    const otp = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    await this.bookmarkRepo.upsertStudentOtp(phone, otp, expiresAt);
    return otp;
  }

  async verifyOtp(phone, otp, name) {
    const record = await this.bookmarkRepo.getStudentOtp(phone);
    if (!record) {
      throw new Error('No OTP found for phone');
    }

    if (String(record.otp_code) !== String(otp)) {
      throw new Error('Invalid OTP');
    }

    if (new Date(record.expires_at).getTime() < Date.now()) {
      throw new Error('OTP expired');
    }

    // Upsert student profile (DBMS ON DUPLICATE KEY UPDATE logic encapsulation)
    await this.userRepo.upsertStudentProfile(name, phone);
    
    // Cleanup temporary OTP row (DBMS cleanliness)
    await this.bookmarkRepo.deleteStudentOtp(phone);

    return { name, phone };
  }
}

/**
 * ListingService handles sanitizing and validating listings metadata before database writes.
 * Showcase OOP concept: Encapsulation of metadata cleanup algorithms.
 */
export class ListingService {
  sanitizeMetadata(metadata = {}) {
    const gallery = Array.isArray(metadata.gallery)
      ? metadata.gallery
          .filter((x) => typeof x === 'string' && x.startsWith('data:image/'))
          .slice(0, MAX_GALLERY_IMAGES)
      : [];

    return {
      propertyType: metadata.propertyType || 'PG',
      deposit: metadata.deposit || '',
      maintenance: metadata.maintenance || '',
      occupancyType: metadata.occupancyType || 'single',
      contractDuration: metadata.contractDuration || '',
      electricityIncluded: Boolean(metadata.electricityIncluded),
      amenities: Array.isArray(metadata.amenities) ? metadata.amenities.slice(0, 20) : [],
      coverIndex: Number.isInteger(metadata.coverIndex) ? metadata.coverIndex : 0,
      gallery,
      city: metadata.city || '',
      pincode: metadata.pincode || '',
    };
  }

  validateListingPayload(payload) {
    const { title, description, price, location } = payload;
    if (!title || !description || !price || !location) {
      throw new Error('Missing required fields');
    }
  }
}
