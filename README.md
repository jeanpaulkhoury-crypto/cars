# DriveVault V2

This version fixes the previously identified prototype faults.

## Included
- 6 real photo-based starter listings using remote automotive images
- Search, make/fuel/transmission/price filters and sorting
- Favorites for signed-in users
- Login/account UI
- Sell-a-car listing form
- Contact seller/inquiry flow
- Admin dashboard with listing deletion
- Three-car comparison
- Working light/dark theme
- Verification suite for DOM, data schema, search, comparison, persistence and theme
- API repository with graceful local fallback
- Production PostgreSQL/Supabase-ready `schema.sql`
- XSS-safe rendering for user-controlled text
- Image error fallback
- Mobile responsive layout

## Backend
Set `CONFIG.API_BASE` in `app.js` to your REST API. Until it is set, the repository uses localStorage so the demo remains functional offline.

For a real shared database, run `schema.sql` in PostgreSQL/Supabase and connect an API. Do not put database service-role secrets in browser JavaScript.

## Demo admin
Email: admin@drivevault.local
Password: admin123

Change/remove this demo credential before production.

## Verification
Open the browser console. On startup DriveVault runs a verification suite. Failed checks are reported and rendering uses a recovery renderer instead of silently failing.
