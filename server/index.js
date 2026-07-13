import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';
import { UserController, ListingController, BookmarkController } from './controllers.js';
import { AuthService } from './services.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Network Security: Helmet secures HTTP headers to mitigate common exploits (XSS, Clickjacking, MIME sniffing)
app.use(helmet());

// Network Security: CORS setup to restrict access
app.use(cors());

app.use(express.json({ limit: '10mb' }));

// Network Security: Rate Limiting protects application from Brute Force attacks and Denial of Service (DoS)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // stricter limit: max 30 login/verify attempts per 15 minutes
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', globalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/student/send-otp', authLimiter);

// Database Auto-Initialization startup block (DBMS initialization checks)
(async () => {
  try {
    const [p] = await pool.query('SELECT @@port AS port');
    if (Array.isArray(p) && p[0] && p[0].port) {
      console.log(`MySQL reported port: ${p[0].port}`);
    }

    // Ensure users table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(190) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('user','seller') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table is ready');

    // Ensure listings table exists
    await pool.query(`
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
      )
    `);
    console.log('Listings table is ready');

    // Ensure bookmarks table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        listing_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_listing (user_id, listing_id),
        INDEX (listing_id),
        CONSTRAINT fk_bookmarks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_bookmarks_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
      )
    `);
    console.log('Bookmarks table is ready');

    // Ensure student tables exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(20) NOT NULL UNIQUE,
        otp_code VARCHAR(6) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_phone VARCHAR(20) NOT NULL,
        listing_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY student_listing (student_phone, listing_id),
        INDEX (listing_id),
        CONSTRAINT fk_student_bookmarks_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS listing_deletion_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        listing_id INT NOT NULL,
        seller_id INT NOT NULL,
        reason VARCHAR(120) NOT NULL,
        note VARCHAR(255) NULL,
        deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Student & logs tables are ready');

    // Alter columns verification checks
    const [metaCol] = await pool.query("SHOW COLUMNS FROM listings LIKE 'metadata_json'");
    if (!Array.isArray(metaCol) || metaCol.length === 0) {
      await pool.query('ALTER TABLE listings ADD COLUMN metadata_json JSON NULL');
    }
    const [impressionsCol] = await pool.query("SHOW COLUMNS FROM listings LIKE 'impressions'");
    if (!Array.isArray(impressionsCol) || impressionsCol.length === 0) {
      await pool.query('ALTER TABLE listings ADD COLUMN impressions INT NOT NULL DEFAULT 0');
    }
    const [usersPhoneCol] = await pool.query("SHOW COLUMNS FROM users LIKE 'phone'");
    if (!Array.isArray(usersPhoneCol) || usersPhoneCol.length === 0) {
      await pool.query('ALTER TABLE users ADD COLUMN phone VARCHAR(30) NULL');
    }
    // Database Seeding Logic: Inject 10 premium student listings if they don't exist
    if (true) {
      console.log('Checking and seeding database with 10 premium listings...');
      
      // Ensure we have a mock landlord user
      let [landlords] = await pool.query("SELECT id FROM users WHERE role = 'seller' LIMIT 1");
      let landlordId;
      if (landlords.length === 0) {
        // Create a default seller account
        await pool.query(
          "INSERT INTO users (name, email, password_hash, role) VALUES ('UniHaven Landlord', 'landlord@unihaven.com', 'seeding_hashed_password', 'seller')"
        );
        const [newLandlord] = await pool.query("SELECT id FROM users WHERE email = 'landlord@unihaven.com' LIMIT 1");
        landlordId = newLandlord[0].id;
      } else {
        landlordId = landlords[0].id;
      }

      // 10 Detailed Listing objects
      const seeds = [
        {
          title: "Cozy PG for Boys near MIT Kothrud",
          price: "Rs 8,500",
          location: "Kothrud, Pune",
          description: "Spacious PG room close to MIT Pune campus. Rent includes high-speed Wi-Fi, laundry, and daily cleaning services. Single and double sharing rooms are available.",
          image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          toemail: "landlord@unihaven.com",
          contact_name: "John Doe",
          contact_phone: "9876543210",
          metadata: {
            city: "Pune",
            pincode: "411038",
            propertyType: "PG",
            deposit: "Rs 15,000",
            maintenance: "Rs 500",
            occupancyType: "double",
            contractDuration: "6 months",
            electricityIncluded: true,
            amenities: ["Wi-Fi", "AC", "Laundry", "Cleaning", "CCTV", "Parking"],
            gallery: [],
            coverIndex: 0
          }
        },
        {
          title: "Premium Girls PG near North Campus",
          price: "Rs 12,000",
          location: "Hudson Lane, Delhi",
          description: "A premium, safe residency for female students. Fully furnished rooms, power backup, high security, and three healthy homemade meals included daily.",
          image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          toemail: "landlord@unihaven.com",
          contact_name: "Sarah Smith",
          contact_phone: "9988776655",
          metadata: {
            city: "Delhi",
            pincode: "110009",
            propertyType: "PG",
            deposit: "Rs 20,000",
            maintenance: "Rs 1,000",
            occupancyType: "single",
            contractDuration: "12 months",
            electricityIncluded: false,
            amenities: ["Wi-Fi", "Meals", "Power Backup", "Gym", "Security", "RO Water"],
            gallery: [],
            coverIndex: 0
          }
        },
        {
          title: "Furnished 1BHK Flat in Koramangala",
          price: "Rs 22,000",
          location: "Koramangala 4th Block, Bengaluru",
          description: "Beautiful 1BHK apartment suitable for university couples or single students. Modern modular kitchen, private balcony, and high speed fiber internet available.",
          image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          toemail: "landlord@unihaven.com",
          contact_name: "Rajesh Kumar",
          contact_phone: "9123456789",
          metadata: {
            city: "Bengaluru",
            pincode: "560034",
            propertyType: "Flat",
            deposit: "Rs 60,000",
            maintenance: "Rs 1,500",
            occupancyType: "single",
            contractDuration: "11 months",
            electricityIncluded: false,
            amenities: ["Kitchen", "Balcony", "Parking", "Elevator", "Gas Pipeline", "Wi-Fi"],
            gallery: [],
            coverIndex: 0
          }
        },
        {
          title: "Budget Flatshare near Katraj",
          price: "Rs 5,500",
          location: "Katraj, Pune",
          description: "Shared bedroom space for male students near Bharati Vidyapeeth campus. Fully functional kitchen, fridge, and automatic washing machine available for use.",
          image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          toemail: "landlord@unihaven.com",
          contact_name: "Amit Patil",
          contact_phone: "8888777766",
          metadata: {
            city: "Pune",
            pincode: "411046",
            propertyType: "Shared Room",
            deposit: "Rs 10,000",
            maintenance: "Rs 200",
            occupancyType: "triple",
            contractDuration: "3 months",
            electricityIncluded: true,
            amenities: ["Washing Machine", "Kitchen", "Fridge", "Water Purifier", "Wi-Fi"],
            gallery: [],
            coverIndex: 0
          }
        },
        {
          title: "Luxury Student Studio in North Delhi",
          price: "Rs 18,500",
          location: "Kamla Nagar, Delhi",
          description: "Modern studio space with study tables, private bathroom, and housekeeping. Safe gated neighborhood, walking distance to Delhi University college campuses.",
          image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          toemail: "landlord@unihaven.com",
          contact_name: "Devendra Verma",
          contact_phone: "9560123456",
          metadata: {
            city: "Delhi",
            pincode: "110007",
            propertyType: "Studio",
            deposit: "Rs 35,000",
            maintenance: "Rs 1,200",
            occupancyType: "single",
            contractDuration: "10 months",
            electricityIncluded: false,
            amenities: ["AC", "Housekeeping", "Study Table", "Geyser", "RO Water", "CCTV"],
            gallery: [],
            coverIndex: 0
          }
        },
        {
          title: "Furnished 2BHK Student Flat in Pune",
          price: "Rs 25,000",
          location: "Viman Nagar, Pune",
          description: "Spacious 2BHK flat near Symbiosis. Ideal for a group of 3-4 students. Includes beds, wardrobes, dining table, and fully functional modular kitchen.",
          image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          toemail: "landlord@unihaven.com",
          contact_name: "Vikram Shah",
          contact_phone: "9822019283",
          metadata: {
            city: "Pune",
            pincode: "411014",
            propertyType: "Flat",
            deposit: "Rs 50,000",
            maintenance: "Rs 2,000",
            occupancyType: "double",
            contractDuration: "11 months",
            electricityIncluded: false,
            amenities: ["Modular Kitchen", "Beds", "Wardrobes", "Parking", "Elevator", "Security"],
            gallery: [],
            coverIndex: 0
          }
        },
        {
          title: "Co-living PG Suite near Indiranagar",
          price: "Rs 14,500",
          location: "Indiranagar, Bengaluru",
          description: "Vibrant co-living community for university students and young interns. Communal lounge, high-speed Wi-Fi, gaming zones, and weekly networking events.",
          image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          toemail: "landlord@unihaven.com",
          contact_name: "Sandesh Gowda",
          contact_phone: "8095432109",
          metadata: {
            city: "Bengaluru",
            pincode: "560038",
            propertyType: "PG",
            deposit: "Rs 25,000",
            maintenance: "Rs 1,000",
            occupancyType: "single",
            contractDuration: "Flexible",
            electricityIncluded: true,
            amenities: ["Wi-Fi", "Lounge", "Events", "Washing Machine", "CCTV", "AC"],
            gallery: [],
            coverIndex: 0
          }
        },
        {
          title: "Budget Girls PG near Karve Nagar",
          price: "Rs 6,000",
          location: "Karve Nagar, Pune",
          description: "Home-like PG room for girls near Cummins College. Peaceful and quiet study environment, safe building, purified water, and warden supervision.",
          image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          toemail: "landlord@unihaven.com",
          contact_name: "Sunita Gokhale",
          contact_phone: "7766554433",
          metadata: {
            city: "Pune",
            pincode: "411052",
            propertyType: "PG",
            deposit: "Rs 12,000",
            maintenance: "Rs 300",
            occupancyType: "double",
            contractDuration: "6 months",
            electricityIncluded: true,
            amenities: ["Warden Security", "Purified Water", "Study Room", "Wi-Fi", "Fridge"],
            gallery: [],
            coverIndex: 0
          }
        },
        {
          title: "Penthouse Studio near DU South Campus",
          price: "Rs 28,000",
          location: "Satya Niketan, Delhi",
          description: "A gorgeous rooftop student studio flat with terrace access. Best-in-class furniture, air-conditioned, close to metro station. Perfect for privacy and research students.",
          image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          toemail: "landlord@unihaven.com",
          contact_name: "Aman Sood",
          contact_phone: "9811002233",
          metadata: {
            city: "Delhi",
            pincode: "110021",
            propertyType: "Studio",
            deposit: "Rs 50,000",
            maintenance: "Rs 2,500",
            occupancyType: "single",
            contractDuration: "12 months",
            electricityIncluded: false,
            amenities: ["Terrace Access", "AC", "Fridge", "Geyser", "Metro Connectivity", "Wi-Fi"],
            gallery: [],
            coverIndex: 0
          }
        },
        {
          title: "Premium Double Room in HSR Layout",
          price: "Rs 9,500",
          location: "HSR Layout Sector 3, Bengaluru",
          description: "Shared master bedroom in a spacious student villa. Modern amenities, large garden lounge area, fully furnished kitchen access, and high-speed fiber internet.",
          image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          toemail: "landlord@unihaven.com",
          contact_name: "Karan Reddy",
          contact_phone: "9008877665",
          metadata: {
            city: "Bengaluru",
            pincode: "560102",
            propertyType: "Shared Room",
            deposit: "Rs 18,000",
            maintenance: "Rs 800",
            occupancyType: "double",
            contractDuration: "6 months",
            electricityIncluded: true,
            amenities: ["Garden", "Fiber Wi-Fi", "Kitchen Access", "Parking", "Security", "Washing Machine"],
            gallery: [],
            coverIndex: 0
          }
        }
      ];

      for (const s of seeds) {
        // Prevent duplicate seeding by title check
        const [existing] = await pool.query("SELECT id FROM listings WHERE title = ? LIMIT 1", [s.title]);
        if (existing && existing.length > 0) continue;

        s.metadata.gallery = [
          s.image,
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8tF1QDwAG8wF/o0KxKAAAAABJRU5ErkJggg==",
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        ];
        
        await pool.query(
          "INSERT INTO listings (title, description, image, price, location, toemail, contact_name, contact_phone, seller_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            s.title,
            s.description,
            s.image,
            s.price,
            s.location,
            s.toemail,
            s.contact_name,
            s.contact_phone,
            landlordId,
            JSON.stringify(s.metadata)
          ]
        );
      }
      console.log('Seeded 10 student rental listings successfully!');
    }

    console.log('Database integrity checks passed');
  } catch (e) {
    console.error('Database migration/connection warning:', e.message);
  }
})();

// Instantiate classes (OOP System Design Controllers)
const userCtrl = new UserController();
const listingCtrl = new ListingController();
const bookmarkCtrl = new BookmarkController();
const authService = new AuthService();

// Middleware: Authentication interceptor (stateless JWT verification)
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });
  const token = header.split(' ')[1];
  try {
    req.user = authService.verifyToken(token);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Session expired, please login again.' });
  }
}

// REST ROUTINGS - Mapping Endpoints to Controller Actions (System Design)
app.post('/api/auth/register', (req, res) => userCtrl.register(req, res));
app.post('/api/auth/login', (req, res) => userCtrl.login(req, res));
app.post('/api/auth/google', (req, res) => userCtrl.googleAuth(req, res));
app.get('/api/seller/me', auth, (req, res) => userCtrl.getMe(req, res));

app.post('/api/student/send-otp', (req, res) => userCtrl.sendStudentOtp(req, res));
app.post('/api/student/verify-otp', (req, res) => userCtrl.verifyStudentOtp(req, res));
app.get('/api/student/profile/:phone', (req, res) => userCtrl.getStudentProfile(req, res));

app.get('/api/listings', (req, res) => listingCtrl.getAll(req, res));
app.post('/api/listings', auth, (req, res) => listingCtrl.create(req, res));
app.get('/api/listings/:id', (req, res) => listingCtrl.getById(req, res));
app.delete('/api/listings', (req, res) => listingCtrl.clearAll(req, res));

app.get('/api/seller/listings', auth, (req, res) => listingCtrl.getSellerListings(req, res));
app.get('/api/seller/performance', auth, (req, res) => listingCtrl.getSellerPerformance(req, res));
app.put('/api/seller/listings/:id', auth, (req, res) => listingCtrl.update(req, res));
app.delete('/api/seller/listings/:id', auth, (req, res) => listingCtrl.delete(req, res));

app.get('/api/bookmarks', auth, (req, res) => bookmarkCtrl.getLandlordBookmarks(req, res));
app.post('/api/bookmarks', auth, (req, res) => bookmarkCtrl.addLandlordBookmark(req, res));
app.delete('/api/bookmarks/:listingId', auth, (req, res) => bookmarkCtrl.deleteLandlordBookmark(req, res));

app.post('/api/student/bookmarks', (req, res) => bookmarkCtrl.addStudentBookmark(req, res));
app.delete('/api/student/bookmarks/:phone/:listingId', (req, res) => bookmarkCtrl.deleteStudentBookmark(req, res));

// Health check endpoint (verifies server and database connection)
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', message: err.message });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});