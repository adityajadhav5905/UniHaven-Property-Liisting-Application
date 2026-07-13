# Deployment Strategy: Nestly Real Estate Platform

This guide outlines exactly how to take this project from a local development environment to a fully deployed, highly-available production server setup. 

## 1. Prerequisites Check
Before deploying, make certain that you have:
- Production-ready `JWT_SECRET` key.
- Production Cloud database URL (e.g., Aiven MySQL or AWS RDS).
- Registered domain name (optional but highly recommended for a commercial platform).
- Accounts on deployment platforms: Vercel/Netlify for the Frontend, and Render/Railway/Heroku for the Backend.

## 2. Database Deployment (MySQL)

This platform pairs with a MySQL database.
**Steps Using Railway or Aiven:**
1. Create an account on [Railway.app](https://railway.app/).
2. Click "New Project" -> "Provision MySQL".
3. Wait a few seconds for it to provision. 
4. Click on the MySQL database, go to the "Connect" tab, and easily copy the `MYSQL_URL` connection strings: `host`, `user`, `password`, `database`, `port`.
5. Keep these credentials handy for the backend environment variables.
6. The backend automatically creates necessary tables (`student_profiles`, `bookmarks`, `listings`, `users`, etc) on first launch, so no manual schema creation is necessary.

## 3. Backend Deployment (Render or Railway)

Deploying the Express Server securely.
**Steps Using Render:**
1. Upload your code to a GitHub Repository.
2. Log into [Render.com](https://render.com/).
3. Create a **New Web Service**.
4. Connect the GitHub repository containing the backend code (`server/`).
5. Configure the Build Settings:
   - **Root Directory:** `server`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (or `node index.js`)
6. Open **Environment Variables** and add:
   - `DB_HOST`: Your remote MySQL Host name
   - `DB_USER`: Your remote MySQL User name
   - `DB_PASSWORD`: Your remote MySQL Password
   - `DB_NAME`: Your remote MySQL Database name
   - `DB_PORT`: `3306` (or provided port)
   - `JWT_SECRET`: A secure randomly generated hash string.
   - `PORT`: `5000` (Render will automatically assign a port as well).
7. Deploy the service. Once it spins up successfully, Render will provide a URL like `https://nestly-api.onrender.com`.

## 4. Frontend Deployment (Vercel)

Vercel is the ultimate path for a React Vite application.
1. Return to your local repository. Open `/src` (or wherever your API endpoint constants exist).
2. Change the API endpoints from `http://localhost:5000` to the new Production Backend URL (`https://nestly-api.onrender.com`).
   *Note: In professional projects, this is typically handled by creating a `.env` in the root (like `VITE_API_BASE_URL`) but inline changes work too as long as they are pushed.*
3. Push these URL updates to your GitHub repository.
4. Log into [Vercel.com](https://vercel.com/) and click **Add New Project**.
5. Import your GitHub repository.
6. Configure the Project:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install`
   - **Output Directory:** `dist`
7. Click Deploy. Vercel will automatically fetch the code, run Vite build strategies, and expose the super-fast static site.

## 5. Final Configuration & Verification
- Check your domain URL deployed by Vercel and confirm that CORS headers on the backend allow traffic from the Vercel domain.
- Create a test Landlord Account.
- List a dummy property to test Database writes.
- Verify OTP student flow (Phone verification limits via MySQL works correctly in production).
- Set up automated backups on your MySQL database service for commercial stability.
