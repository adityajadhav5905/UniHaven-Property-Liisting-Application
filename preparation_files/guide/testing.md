# Testing Guide

This guide provides instructions on how to test the real estate platform locally.

## 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended).
- [MySQL](https://dev.mysql.com/downloads/installer/) installed and running.

## 2. Database Setup
1. Open your MySQL client (e.g., MySQL Workbench, DBeaver, or via terminal `mysql -u root -p`).
2. Run the SQL script located in `db/schema.sql` to create the `realestate` database and the required tables (`users`, `listings`, `bookmarks`).
3. If your MySQL credentials are not `root` with no password, edit `server/.env` to reflect your true MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=realestate
   DB_PORT=3306
   ```

## 3. Running the Backend
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Start the Node.js backend server:
   ```bash
   npm start
   ```
   *The backend should default to `http://localhost:5000`.*

## 4. Running the Frontend
1. Open a new terminal and navigate to the root directory (where `vite.config.js` is located).
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The frontend should run on `http://localhost:5173` (or similar, depending on availability).*

## 5. End-to-End Testing Workflows

### User Registration and Login Flow
1. Open the frontend in your browser.
2. Click **Login/Register** (or go to Register page).
3. Create a new account with the "Seller" role to test listing creation, or "User" to test general features.
4. After successful registration, log in with the new credentials.

### Creating a Listing (Seller Only)
1. Ensure you are logged in as a "Seller".
2. Navigate to your **Seller Dashboard**.
3. Fill out the "Add New Property" form with a Title, Description, Price, Location, and an Image.
4. Submit the form and verify the new property appears in the list and on the Home Page.

### Bookmarks (All Users)
1. Navigate to the Home Page.
2. Click the "Bookmark" icon on any listing.
3. Verify the listing shows up in your **My Bookmarks** page.

### Enquiries
1. Click the "Enquire" or "Contact" button on a property.
2. A popup or form should appear. (Note: The `toemail` logic handles contact form submissions. Integration with EmailJS is part of the dependencies, but you can verify the popup triggers correctly).

## 6. Troubleshooting
- **CORS Errors**: If the frontend cannot communicate with the backend, ensure the backend is running on port 5000 and the CORS middleware in `server/index.js` is accepting traffic from the frontend.
- **Database Connection Refused**: Verify that your MySQL server is running and the credentials in `server/.env` exactly match your MySQL user/password.
