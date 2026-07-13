import { UserRepository, ListingRepository, BookmarkRepository } from './repositories.js';
import { AuthService, ListingService } from './services.js';

const authService = new AuthService();
const listingService = new ListingService();
const userRepo = new UserRepository();
const listingRepo = new ListingRepository();
const bookmarkRepo = new BookmarkRepository();

/**
 * Helper to transform DB listing row to public structure.
 */
function toPublicListing(row) {
  let metadata = null;
  if (row.metadata_json) {
    try {
      metadata = typeof row.metadata_json === 'string' ? JSON.parse(row.metadata_json) : row.metadata_json;
    } catch {
      metadata = null;
    }
  }
  return {
    _id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    price: row.price,
    location: row.location,
    toemail: row.toemail,
    name: row.contact_name,
    phone: row.contact_phone,
    impressions: row.impressions || 0,
    metadata,
    sellerId: row.seller_id,
  };
}

/**
 * UserController handles authentication and profiling operations.
 */
export class UserController {
  async register(req, res) {
    const { name, email, password, role, phone } = req.body;
    try {
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      // Check if user already exists (DBMS uniqueness assertion)
      const existing = await userRepo.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password and store user record
      const hashedPassword = await authService.hashPassword(password);
      await userRepo.createUser(name, email, hashedPassword, role, phone || null);
      res.status(201).json({ message: 'Registered successfully' });
    } catch (err) {
      console.error('Registration controller error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    try {
      const user = await userRepo.findUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const isMatch = await authService.comparePasswords(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate signed web token
      const token = authService.generateToken(user);
      res.json({ token, role: user.role, name: user.name });
    } catch (err) {
      console.error('Login controller error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async googleAuth(req, res) {
    const { email, name } = req.body;
    try {
      if (!email || !name) {
        return res.status(400).json({ error: 'Google login requires email and name' });
      }

      let user = await userRepo.findUserByEmail(email);
      if (!user) {
        // Create standard user account ('user' by default, or 'seller' if email contains landlord/seller)
        const isLandlordEmail = email.toLowerCase().includes('landlord') || email.toLowerCase().includes('seller');
        const role = isLandlordEmail ? 'seller' : 'user';
        const passwordHash = await authService.hashPassword('GoogleOAuthMockedPassword' + Math.random());
        await userRepo.createUser(name, email, passwordHash, role);
        user = await userRepo.findUserByEmail(email);
      }

      const token = authService.generateToken(user);
      res.json({ token, role: user.role, name: user.name });
    } catch (err) {
      console.error('Google login controller error:', err);
      res.status(500).json({ error: 'Google login failed' });
    }
  }

  async getMe(req, res) {
    try {
      const user = await userRepo.findUserById(req.user.userId);
      if (!user) return res.status(404).json({ error: 'Profile not found' });
      res.json(user);
    } catch (err) {
      console.error('Get profile error:', err);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  async sendStudentOtp(req, res) {
    const { phone } = req.body;
    try {
      const sanitizedPhone = String(phone || '').replace(/\D/g, '');
      if (!sanitizedPhone || sanitizedPhone.length < 10) {
        return res.status(400).json({ error: 'Valid 10-digit phone is required' });
      }
      
      const otp = await authService.sendOtp(sanitizedPhone);
      res.json({ message: 'OTP sent successfully', devOtp: otp });
    } catch (err) {
      console.error('Send OTP error:', err);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }

  async verifyStudentOtp(req, res) {
    const { phone, otp, name } = req.body;
    try {
      const sanitizedPhone = String(phone || '').replace(/\D/g, '');
      if (!sanitizedPhone || !otp || !name) {
        return res.status(400).json({ error: 'Phone, name and OTP are required' });
      }

      const profile = await authService.verifyOtp(sanitizedPhone, otp, name);
      res.json({ message: 'Phone verified successfully', profile });
    } catch (err) {
      console.error('Verify OTP error:', err);
      res.status(400).json({ error: err.message || 'Failed to verify OTP' });
    }
  }

  async getStudentProfile(req, res) {
    try {
      const rawPhone = String(req.params.phone || '');
      const sanitizedPhone = rawPhone.replace(/\D/g, '');

      // Load profile info
      let profile = await userRepo.findStudentProfileByPhone(sanitizedPhone);
      if (!profile && rawPhone) {
        profile = await userRepo.findStudentProfileByPhone(rawPhone);
      }
      if (!profile) {
        return res.status(404).json({ error: 'Student profile not verified yet.' });
      }

      // Load student bookmarks
      const bookmarkRows = await bookmarkRepo.getStudentBookmarksByPhone(sanitizedPhone);
      res.json({ 
        profile, 
        bookmarks: bookmarkRows.map(toPublicListing) 
      });
    } catch (err) {
      console.error('Fetch student profile error:', err);
      res.status(500).json({ error: 'Failed to load profile' });
    }
  }
}

/**
 * ListingController coordinates queries/commands on properties.
 */
export class ListingController {
  async getAll(req, res) {
    try {
      const rows = await listingRepo.getAllListings();
      res.json(rows.map(toPublicListing));
    } catch (err) {
      console.error('Get listings error:', err);
      res.status(500).json({ error: 'Failed to fetch listings' });
    }
  }

  async getById(req, res) {
    const { id } = req.params;
    try {
      // Increment views metrics (impressions tracker)
      await listingRepo.incrementImpressions(id);
      
      const listing = await listingRepo.getListingById(id);
      if (!listing) return res.status(404).json({ error: 'Listing not found' });
      
      res.json(toPublicListing(listing));
    } catch (err) {
      console.error('Get listing detail error:', err);
      res.status(500).json({ error: 'Failed to fetch listing details' });
    }
  }

  async create(req, res) {
    try {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ error: 'Forbidden: Only landlords can create property listings.' });
      }

      const sellerId = req.user.userId;
      const user = await userRepo.findUserById(sellerId);
      if (!user) {
        return res.status(404).json({ error: 'Landlord account not found.' });
      }

      const { title, description, image, price, location, metadata } = req.body;

      listingService.validateListingPayload(req.body);

      const cleanMetadata = listingService.sanitizeMetadata(metadata);
      const coverFromGallery = cleanMetadata.gallery[cleanMetadata.coverIndex] || cleanMetadata.gallery[0] || null;
      const selectedCover = image || coverFromGallery;
      
      if (!selectedCover) {
        return res.status(400).json({ error: 'At least one property image is required' });
      }

      const result = await listingRepo.createListing({
        title,
        description,
        image: selectedCover,
        price,
        location,
        toemail: user.email,
        name: user.name,
        phone: user.phone || '',
        sellerId,
        metadataJson: JSON.stringify(cleanMetadata)
      });

      const newListing = await listingRepo.getListingById(result.insertId);
      res.status(201).json(toPublicListing(newListing));
    } catch (err) {
      console.error('Create listing error:', err);
      res.status(400).json({ error: err.message || 'Failed to add listing' });
    }
  }

  async getSellerListings(req, res) {
    try {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ error: 'Only landlords can view dashboard listings.' });
      }
      const rows = await listingRepo.getSellerListings(req.user.userId);
      res.json(rows.map(toPublicListing));
    } catch (err) {
      console.error('Get seller listings error:', err);
      res.status(500).json({ error: 'Failed to load seller properties' });
    }
  }

  async getSellerPerformance(req, res) {
    try {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ error: 'Only landlords can view performance analytics.' });
      }
      const rows = await listingRepo.getSellerPerformance(req.user.userId);
      const totalListings = rows.length;
      const totalImpressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
      
      res.json({ totalListings, totalImpressions, listings: rows });
    } catch (err) {
      console.error('Performance analytics error:', err);
      res.status(500).json({ error: 'Failed to fetch performance data' });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const sellerId = req.user.userId;
    try {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ error: 'Forbidden: Only landlords can update property listings.' });
      }

      const fieldMapping = {
        title: 'title',
        description: 'description',
        price: 'price',
        location: 'location',
        toemail: 'toemail',
        name: 'contact_name',
        phone: 'contact_phone'
      };

      const updates = [];
      const params = [];

      for (const [bodyKey, colName] of Object.entries(fieldMapping)) {
        if (req.body[bodyKey] !== undefined) {
          updates.push(`${colName} = ?`);
          params.push(req.body[bodyKey]);
        }
      }

      if (req.body.metadata !== undefined) {
        updates.push('metadata_json = ?');
        const cleanMetadata = listingService.sanitizeMetadata(req.body.metadata);
        params.push(JSON.stringify(cleanMetadata));
        if (cleanMetadata.gallery.length > 0) {
          updates.push('image = ?');
          params.push(cleanMetadata.gallery[cleanMetadata.coverIndex] || cleanMetadata.gallery[0]);
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      await listingRepo.updateListing(id, sellerId, updates, params);
      const updated = await listingRepo.getListingById(id);
      res.json(toPublicListing(updated));
    } catch (err) {
      console.error('Update listing error:', err);
      res.status(500).json({ error: 'Failed to update property listing' });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    const sellerId = req.user.userId;
    const { reason, note } = req.body;
    try {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ error: 'Forbidden: Only landlords can delete property listings.' });
      }

      if (!reason) {
        return res.status(400).json({ error: 'Deletion reason is required.' });
      }

      // Triggers relational transaction under the hood
      await listingRepo.deleteListingWithLog(id, sellerId, reason, note);
      res.status(204).send();
    } catch (err) {
      console.error('Delete listing error:', err);
      res.status(500).json({ error: err.message || 'Failed to delete listing' });
    }
  }

  async clearAll(req, res) {
    try {
      await listingRepo.clearAllListings();
      res.status(204).send();
    } catch (err) {
      console.error('Clear listings error:', err);
      res.status(500).json({ error: 'Failed to clear database' });
    }
  }
}

/**
 * BookmarkController directs shortlist selections.
 */
export class BookmarkController {
  async getLandlordBookmarks(req, res) {
    try {
      const rows = await bookmarkRepo.getBookmarksByUserId(req.user.userId);
      res.json(rows.map(toPublicListing));
    } catch (err) {
      console.error('Get landlord bookmarks error:', err);
      res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
  }

  async addLandlordBookmark(req, res) {
    const { listingId } = req.body;
    try {
      if (!listingId) return res.status(400).json({ error: 'listingId is required' });
      await bookmarkRepo.addBookmark(req.user.userId, listingId);
      res.status(201).json({ message: 'Bookmarked successfully' });
    } catch (err) {
      console.error('Add landlord bookmark error:', err);
      res.status(500).json({ error: 'Failed to save bookmark' });
    }
  }

  async deleteLandlordBookmark(req, res) {
    const { listingId } = req.params;
    try {
      await bookmarkRepo.deleteBookmark(req.user.userId, listingId);
      res.status(204).send();
    } catch (err) {
      console.error('Remove landlord bookmark error:', err);
      res.status(500).json({ error: 'Failed to remove bookmark' });
    }
  }

  async addStudentBookmark(req, res) {
    const { phone, listingId } = req.body;
    try {
      const sanitizedPhone = String(phone || '').replace(/\D/g, '');
      if (!sanitizedPhone || !listingId) {
        return res.status(400).json({ error: 'Phone and listingId are required' });
      }
      await bookmarkRepo.addStudentBookmark(sanitizedPhone, listingId);
      res.status(201).json({ message: 'Student bookmarked successfully' });
    } catch (err) {
      console.error('Add student bookmark error:', err);
      res.status(500).json({ error: 'Failed to save student bookmark' });
    }
  }

  async deleteStudentBookmark(req, res) {
    const { phone, listingId } = req.params;
    try {
      const sanitizedPhone = String(phone || '').replace(/\D/g, '');
      await bookmarkRepo.deleteStudentBookmark(sanitizedPhone, listingId);
      res.status(204).send();
    } catch (err) {
      console.error('Remove student bookmark error:', err);
      res.status(500).json({ error: 'Failed to remove student bookmark' });
    }
  }
}
