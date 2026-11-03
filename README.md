# AID3S 2027 Conference Website (MERN + MongoDB Atlas)

Restyled to match https://scmrglobal.org/AID3S. React (Vite) frontend, Node/Express backend, MongoDB Atlas.

## Public pages (same as the reference site)
Home · Conference Committee (`/conference-committee`) · Paper Submission (`/paper-submission`) · Contact Us (`/contact`)

Home has: banner, About (with scrolling topic strip and date badge), Conference Objectives, Tracks and Topics,
Publication Opportunities, Important Dates, Who Should Participate.

## Admin panel (`/admin`)
Site settings (all home page text), important dates (leave the date empty to show "To be announced"), tracks,
committee, paper submissions (PDF download, status) and contact messages.

## Images
The logos, banner and "who" photo are loaded from scmrglobal.org (see `IMG` in `client/src/components/Layout.jsx`).
Copy them to `client/public/images/` and change the paths there to host them yourself.

## Setup

1. **MongoDB Atlas**: create a free cluster, add a database user, allow your IP under Network Access, and copy the
   connection string (Connect → Drivers).
2. **Backend**
   ```bash
   cd server
   cp .env.example .env      # fill in MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
   npm install
   npm run seed              # creates the admin user and placeholder content
   npm run dev               # http://localhost:5001 (PORT in server/.env)
   ```
3. **Frontend** (new terminal)
   ```bash
   cd client
   npm install
   npm run dev               # http://localhost:5173 (proxies /api to port 5001)
   ```
4. Open http://localhost:5173/admin and sign in with the admin email and password from your `.env`.
   Change the password afterwards from the Overview tab.

`npm run seed:reset` wipes the content collections and re-seeds them (the admin user is kept).

## Troubleshooting
- If Vite logs `http proxy error` with `ECONNREFUSED` for `/api` requests, the backend is not listening. The backend starts only after it connects to MongoDB.
- If the backend reports that it cannot connect to MongoDB Atlas, add your current public IP under **Atlas → Network Access → IP Access List**, confirm `MONGODB_URI` in `server/.env`, then restart the backend.
- The default backend port is `5000`; this project’s `server/.env` sets it to `5001`, which is also the Vite proxy target. If you change `PORT`, update the proxy target in `client/vite.config.js` to match.

## Production
```bash
cd client && npm run build
cd ../server && npm start     # Express also serves client/dist
```
Set `NODE_ENV=production`, a strong `JWT_SECRET`, and (if the frontend is hosted separately) `CLIENT_ORIGIN` on the
server and `VITE_API_URL` on the client build.

## Notes
- Uploaded papers are stored on the server disk in `server/uploads`. On hosts with temporary disks (Render free,
  Heroku) they are lost on restart; use persistent storage or move uploads to S3/GridFS before going live.
- Only admins can download papers. Submission, registration and contact forms are rate limited.
- No emails are sent automatically; add Nodemailer in `server/routes/forms.js` if you want confirmations.
