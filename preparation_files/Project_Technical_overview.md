# Project Technical Overview: Nestly (Deep Dive)

This document is the architectural source of truth for the platform, outlining exactly how logic flows between the frontend user interface, the API layer, and the relational database.

## 1. System Architecture & Tech Stack

### Frontend (User Interface)
- **Framework:** React.js 19 deployed over a Vite development server.
- **Routing Engine:** `react-router-dom` utilizing `BrowserRouter` `<Routes>` context mapped cleanly inside `App.jsx`.
- **CSS Preprocessor/Engine:** TailwindCSS v4 with extended custom design systems inside `index.css`. The `html:not(.dark)` class forces root modifications to achieve a highly professional 'Apple/Vercel' Light Mode aesthetic using extremely low-capacity box shadows, solid contrast font structures, and exact hex alignment `#f8fafc`.
- **Design Methodology:** Components utilize Glassmorphism (`backdrop-filter: blur(16px)` on semi-transparent background colors) overlaying subtle radial gradients to project depth.

### Backend (The API Engine)
- **Environment:** Node.js with `express`. Uses native ES Modules (`"type": "module"`).
- **Core Middlewares:** `cors()` for cross-origin tracking, `express.json({ limit: "10mb" })` is uniquely used heavily here specifically because of Base64 image payload handling.
- **Relational Database:** MySQL (`mysql2/promise`). The backend spins up a 10-connection limited `mysql.createPool` block ensuring the single Node thread does not halt during heavy simultaneous SQL queries.

---

## 2. Feature Algorithms (How It Works)

### 2.1 The Authentication Structure
The application employs two completely separate authentication routines:

**A. Landlords (`auth/login`) -> JSON Web Tokens**
- Landlords register via `/api/auth/register`. The Express backend utilizes `bcrypt.hash(password, 10)` securely storing salt iterations in the database.
- Upon hitting `/api/auth/login`, `bcrypt.compare` executes. If successful, `jsonwebtoken` signs a 1-day payload (`{ userId: user.id, role: user.role }`). This string is preserved in browser `localStorage`.
- All landlord-protected routes (like `.post('/api/listings')`) are veiled behind a custom `function auth(req, res, next)` Express middleware which validates the bearer token via `jwt.verify`.

**B. Students -> Ephemeral OTP Logging**
- **Trigger**: `POST /api/student/send-otp` normalizes phone inputs (Regex `/\D/g`) and computationally generates a 6-digit random number `Math.floor(100000 + Math.random() * 900000)`.
- **SQL UPSERT**: Uses SQL native temporal constraints storing logic via `ON DUPLICATE KEY UPDATE` pushing expiration bounds `Date.now() + 10 mins`.
- **Validation**: On submission checking `POST /api/student/verify-otp`, backend compares timestamp to DB row. It returns a pure JSON object `studentProfile` appended natively to local browser storage to persist the user identification uniquely per phone number.

### 2.2 Direct Listing Implementation (Create & Edit)
**Frontend Routing:**
`ListingPage` inside `src/listingpage.jsx` operates redundantly as **both the create and edit** interface.
- It parses parameters via `const searchParams = new URLSearchParams(location.search);`. If `edit=15` fires, an internal `fetchEditData()` trigger fires hooking to `GET /api/listings/15`.
- **Image Conversion Algorithm:** The browser invokes the generic `FileReader()` native API mapping raw File Blobs to enormous Data URIs (Base64). A `Promise.all()` queue resolves all async images identically converting them to simple array string structures. 
- **Metadata Bundling:** Base SQL structure mandates rigid data points mapping to columns (`location`, `price`). However, varied fields like `amenities, occupancyType, deposit, maintenance` are collated and bundled manually into a strictly parsed JSON object and sent into the SQL natively supported `metadata_json JSON NULL` column type dynamically without disrupting table formats.

**Backend Receiving (PUT / POST):**
- **POST**: Stores standard columns via massive array injections map `[title, desc, image, price, ..., sellerId, JSON.stringify(cleanMetadata)]`. Returns the newly generated schema mapping utilizing `result.insertId`.
- **PUT (Edit)**: Deconstructs the JSON payload constructing dynamic updating SQL scripts specifically mapping only to provided changes parsing string additions (ex: `UPDATE listings SET title=?, metadata_json=? WHERE id=? AND seller_id=?`).

### 2.3 The Complex Bookmarking Logic
When a specific user clicks a Favorite button inside `Card.jsx`, the network logic diverges:

1. **Student Execution (`studentProfile` defined):** Fires network fetch targeting `POST /api/student/bookmarks`. Backend grabs stringified phone identity executing pure schema constraint logic `INSERT IGNORE INTO student_bookmarks (student_phone, listing_id) VALUES (?, ?)`. 
2. **Landlord Execution (`token` defined):** Fires network fetch targeting `POST /api/bookmarks`. Standard User integer mappings logic utilizes Express middleware parsing JWT to identify actual User internal ID performing exact sequence mapping on distinct table `bookmarks`. 

**In UI (Bookmark Data Rendering):**
`src/App.jsx` dynamically shifts views between `StudentProfile` and `SellerProfile`. Both dynamically remap array structures utilizing the standardized pure `<Card>` component framework guaranteeing uniform representation across the entire spectrum. Students see their favorites through a single `JOIN` execution mapping `SELECT l.id, l.title ... FROM student_bookmarks b JOIN listings l ON l.id = b.listing_id WHERE b.student_phone IN (?)`.

### 2.4 Internal Analytics Layer
- **Read Metrics (Traffic Insights)**: Standard listings detail view `[/listing/:id]` forcefully fires `UPDATE listings SET impressions = impressions + 1 WHERE id = ?`.
- **SQL Aggregation (Landlord Board):** `SellerDashboard` parses `GET /api/seller/performance` processing a native descending list limit query `ORDER BY impressions DESC`. The front-end React arrays slice native JavaScript loops tracking exact metric bar progress elements via inline CSS calculation (`width: ${Math.round((item.impressions / max) * 100)}%`).

---

## 3. Advanced Configuration Constraints 
- Max Base64 image limit via Node `express.json()` prevents stack overflow over `10mb`.
- Maximum 8 image slices (`slice(0, 8)`) permitted directly inside server sanitization routines ensuring the database doesn't choke processing string dumps. 
- Single connection pooling restricted to exactly `10` simultaneous asynchronous limits maintaining system stability even on extremely low-tier cloud processing layers structure mappings (e.g. Free Tier Render deployments).
