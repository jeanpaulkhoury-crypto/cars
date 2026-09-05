# DriveVault

A complete car marketplace frontend built from scratch.

## Run
Open `index.html` in a modern browser. No server is required.

## Included
- Local browser database using `localStorage`
- Seed car inventory
- Search
- Make/fuel/transmission filters
- Sorting
- Car detail modal
- Two-car comparison
- Responsive design
- Theme toggle
- Startup data verification
- Render verification and fallback renderer

## Database
The browser database key is `drivevault_cars_v1`. Replace the local-storage functions in `app.js` with API calls when connecting a production SQL/Supabase/Firebase backend.

## Verification philosophy
Every core UI render checks its required mount point and data. If rendering fails, a fallback renderer presents a retry state instead of silently leaving a broken interface.
