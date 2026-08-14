# Warehouse Inventory

A mobile-friendly, multi-warehouse inventory tracker built with Next.js (App Router), MUI, MongoDB/Mongoose, and NextAuth. Designed to deploy straight to Vercel — the only thing you *need* to change is your MongoDB connection string.

## Features

- **Multiple warehouses per account**, each with its own inventory, categories and members
- **Per-warehouse roles**: Owner / Admin / Editor / Viewer, managed from the Members page
- **Custom categories & subcategories**
- **CSV import** with automatic column-mapping guesses, a preview step, and create-or-update ("upsert") matching by SKU/barcode — works with exports from most other inventory tools
- **Customizable dashboard** — drag, resize, add and remove widgets (low stock, quick update, recent activity, inventory value, category breakdown). Saved per user, per warehouse.
- **Camera barcode/QR scanning** for instant lookup + one-tap quantity updates, with a manual-entry fallback
- **Big-target quantity stepper** used everywhere stock is adjusted — built for fast, one-thumb warehouse-floor use
- **Full audit trail** of every stock change (who, when, how much)
- **Mobile-first**: bottom navigation + large tap targets on phones, a full drawer + drag-and-drop dashboard on desktop

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, JavaScript) |
| UI | MUI v5, custom theme |
| Charts | @mui/x-charts |
| Auth | NextAuth.js (Credentials + Google OAuth), JWT sessions |
| Database | MongoDB Atlas via Mongoose |
| CSV parsing | PapaParse |
| Barcode scanning | html5-qrcode (browser camera, no native app needed) |
| Dashboard grid | react-grid-layout |
| Data fetching | SWR |

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```bash
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster-ghila.zrsoj.mongodb.net/warehouse_inventory?appName=Cluster-Ghila
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

**MongoDB Atlas checklist:**
1. Database Access → make sure your database user's password is in the connection string above (URL-encode any special characters).
2. Network Access → add `0.0.0.0/0` (or Vercel's IP ranges) so the app can connect from serverless functions.
3. The app will create its collections automatically on first use — no manual schema setup needed.

Google sign-in is optional. Leave `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` blank to only show email/password, or fill them in (see `.env.example` for where to create credentials) to enable the "Continue with Google" button.

Run it:

```bash
npm run dev
```

Visit `http://localhost:3000`, create an account, and create your first warehouse.

## 2. Deploy to Vercel

1. Push this project to a GitHub/GitLab/Bitbucket repo.
2. Import it in Vercel.
3. Add the same environment variables as above in **Project Settings → Environment Variables**:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → your production URL, e.g. `https://your-app.vercel.app`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (optional)
4. If using Google sign-in, add `https://your-app.vercel.app/api/auth/callback/google` as an authorized redirect URI in the Google Cloud Console.
5. Deploy. That's it — no build configuration changes needed.

## How the pieces fit together

- **Warehouses** are the top-level tenant boundary. Each product, category, and stock movement belongs to exactly one warehouse.
- **Memberships** join a user to a warehouse with a role (`owner` / `admin` / `editor` / `viewer`). A user can belong to any number of warehouses with different roles in each. The role hierarchy and what each level can do is in `lib/permissions.js`, enforced on every API route via `lib/apiAuth.js`.
- **Adding teammates**: since there's no email service configured, invites work by searching for an *existing* account by name/email on the Members page. Ask your teammate to sign up first, then add them.
- **Every quantity change** — from the stepper, the scanner, a manual edit, or a CSV import — writes a `StockMovement` record, which powers the audit trail and the Recent Activity widget.
- **Dashboard widgets** are stored per-user, per-warehouse in the `DashboardLayout` collection, so each teammate can arrange their own view.

## Known limitations / good next steps

- The inventory list loads up to 200 items at once (no infinite scroll/pagination UI yet) — fine for most small-to-mid warehouses, but worth adding a "load more" control for catalogs larger than that.
- Product photos accept a pasted image URL only; there's no built-in image upload/storage (would need an object storage provider like Vercel Blob or Cloudinary).
- Invites are account-to-account only (no "invite by email" flow for people without an account yet) — adding that later just needs an email provider like Resend plus a pending-invite collection.
- No stock *transfers between warehouses* yet — today, moving stock means adjusting the quantity in each warehouse separately.

## Project structure

```
app/
  (app)/warehouses/         warehouse picker + create
  (app)/w/[warehouseId]/    everything scoped to one warehouse (dashboard, inventory, scan, categories, import, members, settings)
  api/                      route handlers (all permission-checked server-side)
  login/, register/         auth pages
lib/
  models/                   Mongoose schemas
  authOptions.js            NextAuth config
  apiAuth.js                session + role-check helper for API routes
  permissions.js            role hierarchy
  mongodb.js                serverless-safe connection caching
components/
  dashboard/                widget grid, widget registry, individual widgets
  import/                   CSV import wizard
  QuantityStepper.js         the core fast quantity-update control
  BarcodeScanner.js         camera scanning component
```
