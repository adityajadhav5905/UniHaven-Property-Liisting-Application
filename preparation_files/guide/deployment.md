# Deployment Guide

This guide explains how to deploy the Real Estate Platform (Frontend, Backend, and Database) for production using an easy and modern flow (e.g., Render, Vercel, and a managed MySQL database).

## 1. Deploying the MySQL Database

We recommend using a managed MySQL database provider such as **Aiven**, **PlanetScale**, **DigitalOcean**, or **AWS RDS**.

1. Create a MySQL database instance on your chosen platform.
2. Connect to the instance using a tool like MySQL Workbench and run the script in `db/schema.sql`.
3. Note your remote database credentials (Host, Port, User, Password, Database Name).

## 2. Deploying the Node.js Backend

You can easily deploy Node.js on **Render.com** or **Railway.app**.

### Render.com Deployment Workflow:
1. Push your code to a GitHub repository.
2. Log into Render and click **New -> Web Service**.
3. Connect your repository.
4. Set the **Root Directory** to `server`.
5. Set the **Environment** to `Node`.
6. Set the **Build Command** to `npm install`.
7. Set the **Start Command** to `node index.js`.
8. Under **Environment Variables**, add:
   - `DB_HOST`: Your managed MySQL Host
   - `DB_USER`: Your MySQL User
   - `DB_PASSWORD`: Your MySQL Password
   - `DB_NAME`: `realestate`
   - `DB_PORT`: Your MySQL Port (usually 3306 or provided by the platform)
   - `JWT_SECRET`: A strong, random string (e.g., `super_secret_production_key_123`)
9. Click **Create Web Service**. Wait until it is successfully deployed and note the deployment URL (e.g., `https://my-backend.onrender.com`).

## 3. Deploying the React Frontend

You can deploy the Vite React frontend using **Vercel** or **Render**. Vercel is highly recommended for Vite/React applications.

### Adjusting the Frontend for Production:
Before deploying the frontend, ensure the frontend makes API calls to your deployed backend URL, not `http://localhost:5000`. 
Currently, URLs like `http://localhost:5000/api/...` are hardcoded in `src/App.jsx` and other components. You should change these to an environment variable or a base URL configuration (e.g., `import.meta.env.VITE_API_URL`).

### Vercel Deployment Workflow:
1. Push your updated code to GitHub.
2. Log into Vercel and click **Add New -> Project**.
3. Import your repository.
4. The **Framework Preset** should automatically detect **Vite**.
5. Set the **Root Directory** to `./` (the root of the project).
6. Under **Environment Variables**, if you refactored the hardcoded URLs, add your backend URL (e.g., `VITE_API_URL=https://my-backend.onrender.com`).
7. Click **Deploy**. Vercel will run `npm run build` and publish your site.

## 4. Final Verification
1. Open your deployed Vercel frontend URL.
2. Test User Registration, Login, and creating a Property Listing.
3. Ensure images upload successfully and the app communicates perfectly with the backend.
