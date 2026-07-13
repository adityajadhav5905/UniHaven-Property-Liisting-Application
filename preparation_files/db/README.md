Database Setup (MySQL)

1) Run the SQL in `db/schema.sql` on your MySQL server.
2) Create `server/.env` with:
   - PORT=5000
   - JWT_SECRET=please_change_me
   - DB_HOST=localhost
   - DB_PORT=3306
   - DB_USER=root
   - DB_PASSWORD=32323
   - DB_NAME=realestate
3) From `server/`: run `npm install` then `npm start`.
4) API: http://localhost:5000

Notes:
- Images are stored as Base64 (LONGTEXT).
- Public can submit listings; sellers see/manage theirs when logged in.

