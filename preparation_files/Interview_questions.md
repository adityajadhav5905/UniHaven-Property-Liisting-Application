# Interview Questions: Nestly Real Estate Platform

This comprehensive manual provides potential interview questions regarding this specific application structure and its technical stack. Use this document to prepare for technical deep-dives into your project.

---

## 1. Project Motivation & Scope
**Q: Why did you build this project? What problem does it solve?**
**A:** This platform solves the heavy friction students face when finding temporary, verified accommodation (PGs and shared flats). By removing heavy signup flows for students (using OTP) and supplying a sleek, transparent rental grid, students can connect with landlords in seconds instead of navigating cluttered social media pages.

**Q: Who are the primary user personas for this application?**
**A:** There are two distinct users:
1. **Landlords/Sellers:** Professional individuals securing authenticated connections via JWTs, maintaining a performance dashboard, and updating property listings.
2. **Students:** Consumers relying on a lightweight, friction-free OTP login pattern targeting high-speed browsing and shortlisting.

---

## 2. Technical Stack Choices
**Q: You used the MERN stack mostly, but replaced MongoDB with MySQL. Why?**
**A:** Real estate platforms fundamentally deal with heavily structured, relational data. A user owns a listing, a listing holds multiple parameters, users save specific listings (bookmarks). These join operations (e.g., retrieving all details of multiple bookmarked properties based on user phone numbers) execute profoundly faster and with stricter schema compliance in a SQL/Relational database compared to a Document-based database like MongoDB.

**Q: Why TailwindCSS instead of traditional CSS or SCSS?**
**A:** TailwindCSS allows rapid UI prototyping through utility classes. Utilizing its configurations across `.jsx` components meant that I did not need massive separate external style sheets. I optimized it further by constructing custom root variables and variants in `index.css` to enable smooth Glassmorphism and modern Dark/Light mode theme switches.

---

## 3. Authentication & Security
**Q: Explain how the Dual-Authentication system works in this codebase.**
**A:** Landlords have standard accounts protected by bcrypt password hashing and JWT sessions. Students avoid passwords entirely. The system validates them via an OTP sequence. I constructed a distinct database table specifically for `student_otps` with an `expires_at` column to ensure temporary security scopes against brute-forcing and replay attacks. 

**Q: What steps did you take to prevent SQL Injection in your backend API?**
**A:** Every single query hitting the database utilizes parameterized inputs via `mysql2`'s `[?, ?, ?]` array insertions (`pool.query("SELECT * FROM users WHERE email = ?", [email])`). This instructs the MySQL driver to treat external strings strictly as literal inputs, effectively nullifying SQL injection attacks.

---

## 4. Frontend & React Details
**Q: How are you managing state across the application?**
**A:** Core component rendering leverages React's `useState` and `useEffect` APIs. Application-wide persistent state (like whether the dark mode is currently active, or if a user is securely logged in) utilizes standard `localStorage`.

**Q: Does your platform optimize the process for listing heavy image loads?**
**A:** In the UI components, mapping maps efficiently utilize the `key` attribute based directly on the dataset's unique primary keys (`_id || id`) preventing full-tree DOM re-renders. Furthermore, backend uploads actively block overloaded requests by slicing image gallery arrays (`slice(0, 8)`).

---

## 5. Architectural Deep Dives
**Q: How does the application track metric performance for the landlord?**
**A:** The platform tracks 'Impressions'. Every time the `GET /api/listings/:id` detail route is hit (when a tenant clicks a specific property), an `UPDATE listings SET impressions = impressions + 1 WHERE id = ?` execution runs concurrently. This allows landlords to see quantitative engagement metrics directly in their dashboard via the `/api/seller/performance` aggregate route.

**Q: Explain how your soft-deletion pattern works when a landlord deletes a listing?**
**A:** In modern commercial systems, pure deletion causes data-loss issues regarding history. Before running the `DELETE` query, the API mandates a string `reason` from the client interface, pushing it into a `listing_deletion_logs` table (tracking `seller_id`, `listing_id`, and `reason`). This maintains business intelligence on why properties are leaving the platform.
