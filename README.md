# AREMS Building Naming Rights

Interactive building blueprint for the AREMS capital campaign. Leadership can assign naming rights donors to rooms in real time at fundraising events.

**Live at:** `building.arems.net`

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Realtime)
- Vercel hosting

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/zyngine/building-arems.git
cd building-arems
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Open the **SQL Editor** and run the contents of `supabase/migrations/001_initial_schema.sql`.
3. In **Project Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Enable Realtime

The migration enables Realtime on the `donations` table automatically. Verify in **Database → Replication** that the `donations` table is listed under `supabase_realtime`.

### 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PIN=545400
```

### 5. Add Blueprint Image

Place your building blueprint image at `public/blueprint.png`. The app will display it automatically.

### 6. Add Room Data

Insert rooms into the `rooms` table via the Supabase Table Editor or SQL Editor. See `supabase/seed.sql` for the expected format.

Room coordinates are **percentages** of the blueprint image dimensions:
```json
{ "x": 5, "y": 10, "width": 25, "height": 40 }
```

### 7. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 8. Deploy to Vercel

1. Push to GitHub: `git push origin master`
2. Import the repo in [Vercel](https://vercel.com).
3. Add environment variables in Vercel project settings.
4. Deploy.

### 9. DNS Setup (building.arems.net)

Add a CNAME record in your DNS provider:

| Type  | Name     | Value                          |
|-------|----------|--------------------------------|
| CNAME | building | cname.vercel-dns.com           |

Then add `building.arems.net` as a custom domain in Vercel project settings.

## Admin Access

Tap "Admin Login" in the top-right corner and enter the PIN on the numeric keypad. Admin mode allows assigning donors to rooms, updating payment details, and adding internal notes. All changes sync in real time across all connected devices.

## Campaign Settings

Update the campaign name and goal in the `campaign_settings` table in Supabase. The stats bar updates automatically.
