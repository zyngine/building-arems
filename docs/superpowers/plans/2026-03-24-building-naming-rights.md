# EMS Building Naming Rights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready interactive blueprint app where EMS leadership can assign naming rights donors to rooms in real time at fundraising events.

**Architecture:** Next.js 14 App Router with Tailwind CSS, backed by Supabase PostgreSQL with Realtime subscriptions. PIN-based admin auth via signed HTTP-only cookies. Blueprint rendered as a static image with CSS percentage-positioned room overlays. Single-page app — all interaction happens on the main page via modals.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (PostgreSQL + Realtime), jose (JWT signing), Vercel

**Spec:** `docs/superpowers/specs/2026-03-24-building-naming-rights-design.md`

---

## File Map

```
building-arems/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
├── vercel.json
├── .env.local.example
├── .gitignore
├── README.md
├── public/                          # Blueprint image goes here (user-provided)
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql   # Full schema, RLS, indexes, realtime
│   └── seed.sql                     # Empty with format comments
└── src/
    ├── app/
    │   ├── layout.tsx               # Root layout: fonts, metadata, dark theme
    │   ├── page.tsx                 # Main page: assembles stats, filters, canvas, modal
    │   └── api/
    │       ├── auth/
    │       │   ├── verify/route.ts  # POST: check PIN, set JWT cookie
    │       │   ├── check/route.ts   # GET: verify existing session cookie
    │       │   └── logout/route.ts  # POST: clear cookie
    │       └── donations/
    │           └── route.ts         # POST/PUT/DELETE: admin writes via service_role
    ├── components/
    │   ├── BlueprintCanvas.tsx      # Relative container + image + RoomOverlay children
    │   ├── RoomOverlay.tsx          # Absolutely-positioned clickable room rectangle
    │   ├── RoomModal.tsx            # Modal shell: backdrop blur, slide-up animation
    │   ├── RoomForm.tsx             # Admin form: donor info, payment, notes, save/clear
    │   ├── RoomInfoDisplay.tsx      # Public read-only: price, donor name, dedication
    │   ├── CampaignStats.tsx        # Top bar: totals, progress bar, room counts
    │   ├── StatusFilter.tsx         # Filter toggle buttons: All/Available/Pledged/Sold
    │   ├── StatusBadge.tsx          # Color-coded pill component
    │   ├── PinLoginDialog.tsx       # Numeric keypad overlay with PIN dot indicators
    │   └── Toast.tsx                # Simple toast notification component
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts            # createBrowserSupabaseClient (anon key)
    │   │   └── server.ts            # createServerSupabaseClient (service_role key)
    │   ├── types.ts                 # Room, Donation, CampaignSettings, RoomType, Status types
    │   └── utils.ts                 # formatCurrency, getRoomColor, getStatusColor
    ├── hooks/
    │   ├── useRooms.ts              # Fetch rooms + donations, subscribe to realtime
    │   ├── useAdmin.ts              # Check admin cookie, login/logout functions
    │   └── useCampaignStats.ts      # Derive totals from rooms + donations data
    └── styles/
        └── globals.css              # Tailwind directives + custom CSS vars + animations
```

---

## Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.js`, `vercel.json`, `.env.local.example`, `.gitignore`, `src/styles/globals.css`, `src/app/layout.tsx`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /c/tmp/building-arems
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

Note: `--no-git` because git is already initialized. If `create-next-app` complains about existing files, answer yes to proceed.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js jose
```

`@supabase/supabase-js` for database + realtime. `jose` for JWT signing/verification (lightweight, edge-compatible).

- [ ] **Step 3: Configure Tailwind with custom theme**

Update `tailwind.config.ts` to include the design system colors and fonts:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0f1a",
        surface: "#111827",
        border: "#1f2937",
        gold: {
          DEFAULT: "#d4a44a",
          dark: "#7d5a0b",
        },
        room: {
          bay: "#1a5276",
          office: "#2c3e7a",
          common: "#6c3483",
          utility: "#5d4e60",
          bedroom: "#1a5c5c",
          corridor: "#3a3a3a",
        },
        status: {
          available: "#1a5276",
          pledged: "#7d5a0b",
          sold: "#0e6b3a",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Set up globals.css**

Replace `src/styles/globals.css` contents:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');

:root {
  --background: #0a0f1a;
  --surface: #111827;
  --border: #1f2937;
  --gold: #d4a44a;
}

body {
  background-color: var(--background);
  color: white;
  font-family: 'Inter', system-ui, sans-serif;
}

/* Modal animations */
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-shake {
  animation: shake 0.3s ease-out;
}

/* Toast animations */
@keyframes toastIn {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes toastOut {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-100%); opacity: 0; }
}

.animate-toast-in {
  animation: toastIn 0.3s ease-out;
}

.animate-toast-out {
  animation: toastOut 0.3s ease-in forwards;
}
```

- [ ] **Step 5: Set up root layout with fonts and metadata**

Replace `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AREMS Capital Campaign — Building Naming Rights",
  description:
    "Interactive building blueprint for the AREMS capital campaign naming rights program.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-white antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Create .env.local.example and vercel.json**

`.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PIN=
```

`vercel.json`:

```json
{
  "framework": "nextjs"
}
```

- [ ] **Step 7: Update .gitignore**

Append to existing `.gitignore`:

```
# dependencies
node_modules/
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# superpowers
.superpowers/
```

- [ ] **Step 8: Verify project builds**

```bash
cd /c/tmp/building-arems
npm run build
```

Expected: Build succeeds (may have a default page — that's fine).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, Supabase deps, and design system"
```

---

## Task 2: Supabase Schema & Migration

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`, `supabase/seed.sql`

- [ ] **Step 1: Write the migration file**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- EMS Building Naming Rights Schema
-- Run this in the Supabase SQL Editor or via supabase db push

-- ============================================================
-- ROOMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('bay', 'office', 'common', 'utility', 'bedroom', 'corridor')),
  description text,
  price integer NOT NULL,
  coordinates jsonb NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Index for sorting
CREATE INDEX idx_rooms_sort_order ON rooms (sort_order);

-- RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_select_public" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "rooms_insert_service" ON rooms
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "rooms_update_service" ON rooms
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "rooms_delete_service" ON rooms
  FOR DELETE USING (auth.role() = 'service_role');


-- ============================================================
-- DONATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid UNIQUE NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  donor_name text NOT NULL,
  dedication_text text,
  status text NOT NULL DEFAULT 'pledged' CHECK (status IN ('pledged', 'sold')),
  donor_phone text,
  donor_email text,
  donor_address text,
  pledge_amount integer,
  payment_method text CHECK (payment_method IN ('cash', 'check', 'credit', 'pledge_card', 'other')),
  internal_notes text,
  donated_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by text
);

-- Index for room lookups
CREATE INDEX idx_donations_room_id ON donations (room_id);

-- RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "donations_select_public" ON donations
  FOR SELECT USING (true);

CREATE POLICY "donations_insert_service" ON donations
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "donations_update_service" ON donations
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "donations_delete_service" ON donations
  FOR DELETE USING (auth.role() = 'service_role');


-- ============================================================
-- CAMPAIGN SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text DEFAULT 'Capital Campaign',
  campaign_goal integer,
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE campaign_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaign_settings_select_public" ON campaign_settings
  FOR SELECT USING (true);

CREATE POLICY "campaign_settings_update_service" ON campaign_settings
  FOR UPDATE USING (auth.role() = 'service_role');

-- Insert default row
INSERT INTO campaign_settings (campaign_name, is_active)
VALUES ('AREMS Capital Campaign', true);


-- ============================================================
-- ENABLE REALTIME ON DONATIONS
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE donations;
```

- [ ] **Step 2: Write the seed file**

Create `supabase/seed.sql`:

```sql
-- Seed file for EMS Building Naming Rights
-- This file is intentionally empty. Room data will be populated manually.
--
-- Expected room format:
-- INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
--   ('bay-1', 'Apparatus Bay 1', 'bay', 'Primary apparatus storage bay', 10000000, '{"x": 5, "y": 5, "width": 25, "height": 40}', 1),
--   ('office-1', 'Captain''s Office', 'office', 'Administrative office', 2500000, '{"x": 5, "y": 58, "width": 18, "height": 35}', 10);
--
-- Coordinates are percentages of the blueprint image dimensions.
-- Prices are in cents (e.g., 10000000 = $100,000).
--
-- Expected donation format (created via the app, not seeded):
-- INSERT INTO donations (room_id, donor_name, dedication_text, status, donor_phone, donor_email, pledge_amount, payment_method) VALUES
--   ('<room-uuid>', 'Smith Family Foundation', 'In honor of Adams County first responders', 'sold', '(717) 555-0142', 'smith@email.com', 10000000, 'check');
```

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase migration with rooms, donations, campaign_settings tables and RLS"
```

---

## Task 3: TypeScript Types & Utility Functions

**Files:**
- Create: `src/lib/types.ts`, `src/lib/utils.ts`

- [ ] **Step 1: Define types**

Create `src/lib/types.ts`:

```typescript
export type RoomType = "bay" | "office" | "common" | "utility" | "bedroom" | "corridor";

export type DonationStatus = "pledged" | "sold";

export type PaymentMethod = "cash" | "check" | "credit" | "pledge_card" | "other";

export type RoomStatus = "available" | DonationStatus;

export interface RoomCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Room {
  id: string;
  slug: string;
  name: string;
  type: RoomType;
  description: string | null;
  price: number;
  coordinates: RoomCoordinates;
  sort_order: number;
  created_at: string;
}

export interface Donation {
  id: string;
  room_id: string;
  donor_name: string;
  dedication_text: string | null;
  status: DonationStatus;
  donor_phone: string | null;
  donor_email: string | null;
  donor_address: string | null;
  pledge_amount: number | null;
  payment_method: PaymentMethod | null;
  internal_notes: string | null;
  donated_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface CampaignSettings {
  id: string;
  campaign_name: string;
  campaign_goal: number | null;
  is_active: boolean;
  updated_at: string;
}

export interface RoomWithDonation extends Room {
  donation: Donation | null;
}
```

- [ ] **Step 2: Define utility functions**

Create `src/lib/utils.ts`:

```typescript
import { RoomType, RoomStatus } from "./types";

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const ROOM_TYPE_COLORS: Record<RoomType, string> = {
  bay: "#1a5276",
  office: "#2c3e7a",
  common: "#6c3483",
  utility: "#5d4e60",
  bedroom: "#1a5c5c",
  corridor: "#3a3a3a",
};

const STATUS_COLORS: Record<RoomStatus, string> = {
  available: "#1a5276",
  pledged: "#7d5a0b",
  sold: "#0e6b3a",
};

export function getRoomColor(type: RoomType, status: RoomStatus): string {
  if (status !== "available") return STATUS_COLORS[status];
  return ROOM_TYPE_COLORS[type];
}

export function getStatusLabel(status: RoomStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getStatusTextColor(status: RoomStatus): string {
  switch (status) {
    case "available": return "#5dade2";
    case "pledged": return "#f0c040";
    case "sold": return "#58d68d";
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/
git commit -m "feat: add TypeScript types and utility functions"
```

---

## Task 4: Supabase Client Configuration

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`

- [ ] **Step 1: Create browser client**

Create `src/lib/supabase/client.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create server client**

Create `src/lib/supabase/server.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat: add Supabase browser and server client configuration"
```

---

## Task 5: PIN Authentication API Routes

**Files:**
- Create: `src/app/api/auth/verify/route.ts`, `src/app/api/auth/logout/route.ts`

- [ ] **Step 1: Write the verify route**

Create `src/app/api/auth/verify/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const SALT = "arems-building-naming-rights-2026";

function getSecret() {
  const pin = process.env.ADMIN_PIN;
  if (!pin) throw new Error("ADMIN_PIN not configured");
  return new TextEncoder().encode(pin + SALT);
}

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin || pin !== process.env.ADMIN_PIN) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("12h")
      .sign(getSecret());

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 12, // 12 hours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Write the logout route**

Create `src/app/api/auth/logout/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return response;
}
```

- [ ] **Step 3: Verify routes compile**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/auth/
git commit -m "feat: add PIN auth verify and logout API routes with JWT cookie"
```

---

## Task 6: Donations API Route

**Files:**
- Create: `src/app/api/donations/route.ts`

- [ ] **Step 1: Write the donations route**

Create `src/app/api/donations/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createServerClient } from "@/lib/supabase/server";

const SALT = "arems-building-naming-rights-2026";

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session")?.value;
  if (!token) return false;

  try {
    const pin = process.env.ADMIN_PIN;
    if (!pin) return false;
    const secret = new TextEncoder().encode(pin + SALT);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

// POST — create a new donation
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("donations")
      .insert({
        room_id: body.room_id,
        donor_name: body.donor_name,
        dedication_text: body.dedication_text || null,
        status: body.status || "pledged",
        donor_phone: body.donor_phone || null,
        donor_email: body.donor_email || null,
        donor_address: body.donor_address || null,
        pledge_amount: body.pledge_amount || null,
        payment_method: body.payment_method || null,
        internal_notes: body.internal_notes || null,
        updated_by: body.updated_by || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT — update an existing donation
export async function PUT(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("donations")
      .update({
        donor_name: body.donor_name,
        dedication_text: body.dedication_text || null,
        status: body.status,
        donor_phone: body.donor_phone || null,
        donor_email: body.donor_email || null,
        donor_address: body.donor_address || null,
        pledge_amount: body.pledge_amount || null,
        payment_method: body.payment_method || null,
        internal_notes: body.internal_notes || null,
        updated_by: body.updated_by || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE — remove a donation (reset room to available)
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing donation id" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from("donations")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/donations/
git commit -m "feat: add donations CRUD API route with admin JWT verification"
```

---

## Task 7: React Hooks — useAdmin

**Files:**
- Create: `src/hooks/useAdmin.ts`, `src/app/api/auth/check/route.ts`

Since the JWT is stored in an httpOnly cookie (not readable by JS), we need a lightweight `/api/auth/check` endpoint that verifies the cookie server-side and returns `{ isAdmin: true/false }`.

- [ ] **Step 1: Create auth check route**

Create `src/app/api/auth/check/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SALT = "arems-building-naming-rights-2026";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  if (!token) {
    return NextResponse.json({ isAdmin: false });
  }

  try {
    const pin = process.env.ADMIN_PIN;
    if (!pin) return NextResponse.json({ isAdmin: false });
    const secret = new TextEncoder().encode(pin + SALT);
    await jwtVerify(token, secret);
    return NextResponse.json({ isAdmin: true });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
```

- [ ] **Step 2: Write the useAdmin hook**

Create `src/hooks/useAdmin.ts`:

```typescript
"use client";

import { useState, useEffect } from "react";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        setIsAdmin(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAdmin(false);
  };

  return { isAdmin, isLoading, login, logout };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAdmin.ts src/app/api/auth/check/
git commit -m "feat: add useAdmin hook with auth check endpoint for session persistence"
```

---

## Task 8: React Hooks — useRooms (with Realtime)

**Files:**
- Create: `src/hooks/useRooms.ts`

- [ ] **Step 1: Write the useRooms hook**

Create `src/hooks/useRooms.ts`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Room, Donation, RoomWithDonation } from "@/lib/types";

export function useRooms() {
  const [rooms, setRooms] = useState<RoomWithDonation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();

    async function fetchData() {
      const [roomsRes, donationsRes] = await Promise.all([
        supabase.from("rooms").select("*").order("sort_order"),
        supabase.from("donations").select("*"),
      ]);

      const roomsData = (roomsRes.data || []) as Room[];
      const donationsData = (donationsRes.data || []) as Donation[];

      const donationsByRoom = new Map(
        donationsData.map((d) => [d.room_id, d])
      );

      setRooms(
        roomsData.map((room) => ({
          ...room,
          donation: donationsByRoom.get(room.id) || null,
        }))
      );
      setIsLoading(false);
    }

    fetchData();

    // Subscribe to realtime changes on donations
    const channel = supabase
      .channel("donations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        (payload) => {
          setRooms((prev) => {
            if (payload.eventType === "DELETE") {
              const old = payload.old as { id: string; room_id: string };
              return prev.map((room) =>
                room.id === old.room_id
                  ? { ...room, donation: null }
                  : room
              );
            }

            const donation = payload.new as Donation;
            return prev.map((room) =>
              room.id === donation.room_id
                ? { ...room, donation }
                : room
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { rooms, isLoading };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useRooms.ts
git commit -m "feat: add useRooms hook with Supabase realtime subscriptions"
```

---

## Task 9: React Hooks — useCampaignStats

**Files:**
- Create: `src/hooks/useCampaignStats.ts`

- [ ] **Step 1: Write the hook**

Create `src/hooks/useCampaignStats.ts`:

```typescript
"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { CampaignSettings, RoomWithDonation } from "@/lib/types";

export function useCampaignStats(rooms: RoomWithDonation[]) {
  const [settings, setSettings] = useState<CampaignSettings | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase
      .from("campaign_settings")
      .select("*")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setSettings(data as CampaignSettings);
      });
  }, []);

  const stats = useMemo(() => {
    const available = rooms.filter(
      (r) => !r.donation && r.type !== "corridor"
    ).length;
    const pledged = rooms.filter(
      (r) => r.donation?.status === "pledged"
    ).length;
    const sold = rooms.filter(
      (r) => r.donation?.status === "sold"
    ).length;

    const totalRaised = rooms.reduce((sum, room) => {
      if (!room.donation) return sum;
      return sum + (room.donation.pledge_amount ?? room.price);
    }, 0);

    const goal = settings?.campaign_goal ?? 0;
    const progress = goal > 0 ? Math.min((totalRaised / goal) * 100, 100) : 0;

    return {
      available,
      pledged,
      sold,
      totalRaised,
      goal,
      progress,
      campaignName: settings?.campaign_name ?? "Capital Campaign",
    };
  }, [rooms, settings]);

  return stats;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useCampaignStats.ts
git commit -m "feat: add useCampaignStats hook for derived campaign totals"
```

---

## Task 10: StatusBadge & Toast Components

**Files:**
- Create: `src/components/StatusBadge.tsx`, `src/components/Toast.tsx`

- [ ] **Step 1: Write StatusBadge**

Create `src/components/StatusBadge.tsx`:

```typescript
"use client";

import { RoomStatus } from "@/lib/types";
import { getStatusLabel, getStatusTextColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: RoomStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const textColor = getStatusTextColor(status);
  const bgColors: Record<RoomStatus, string> = {
    available: "rgba(26,82,118,0.5)",
    pledged: "rgba(125,90,11,0.5)",
    sold: "rgba(14,107,58,0.5)",
  };

  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-bold"
      style={{ color: textColor, backgroundColor: bgColors[status] }}
    >
      {getStatusLabel(status)}
    </span>
  );
}
```

- [ ] **Step 2: Write Toast**

Create `src/components/Toast.tsx`:

```typescript
"use client";

import { useState, useRef, useCallback, createContext, useContext } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-toast-in px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
              toast.type === "success"
                ? "bg-status-sold/90 text-white"
                : "bg-red-700/90 text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/StatusBadge.tsx src/components/Toast.tsx
git commit -m "feat: add StatusBadge and Toast components"
```

---

## Task 11: CampaignStats & StatusFilter Components

**Files:**
- Create: `src/components/CampaignStats.tsx`, `src/components/StatusFilter.tsx`

- [ ] **Step 1: Write CampaignStats**

Create `src/components/CampaignStats.tsx`:

```typescript
"use client";

import { formatCurrency } from "@/lib/utils";

interface CampaignStatsProps {
  campaignName: string;
  totalRaised: number;
  goal: number;
  progress: number;
  available: number;
  pledged: number;
  sold: number;
  isAdmin: boolean;
  onAdminClick: () => void;
  onLogout: () => void;
}

export function CampaignStats({
  campaignName,
  totalRaised,
  goal,
  progress,
  available,
  pledged,
  sold,
  isAdmin,
  onAdminClick,
  onLogout,
}: CampaignStatsProps) {
  return (
    <div>
      {/* Stats Bar */}
      <div className="bg-surface px-5 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-border">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="text-gold font-serif text-lg font-bold">
            {campaignName}
          </span>
          <span className="text-gray-400 text-sm">
            Total Raised:{" "}
            <span className="text-green-400 font-bold">
              {formatCurrency(totalRaised)}
            </span>
          </span>
          {goal > 0 && (
            <span className="text-gray-400 text-sm">
              Goal:{" "}
              <span className="text-gold font-bold">
                {formatCurrency(goal)}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-room-bay inline-block" />
              {available} Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gold-dark inline-block" />
              {pledged} Pledged
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-sold inline-block" />
              {sold} Sold
            </span>
          </div>
          {isAdmin ? (
            <button
              onClick={onLogout}
              className="text-xs text-gray-400 border border-border px-3 py-1 rounded hover:border-red-500 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={onAdminClick}
              className="text-xs text-gray-400 border border-border px-3 py-1 rounded hover:border-gold hover:text-gold transition-colors"
            >
              Admin Login
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-[3px] bg-border">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #0e6b3a, #d4a44a)",
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write StatusFilter**

Create `src/components/StatusFilter.tsx`:

```typescript
"use client";

import { RoomStatus } from "@/lib/types";

type FilterValue = "all" | RoomStatus;

interface StatusFilterProps {
  active: FilterValue;
  onChange: (filter: FilterValue) => void;
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "pledged", label: "Pledged" },
  { value: "sold", label: "Sold" },
];

export function StatusFilter({ active, onChange }: StatusFilterProps) {
  return (
    <div className="px-5 py-2 flex gap-2 bg-[#0d1117] border-b border-border overflow-x-auto">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
            active === f.value
              ? "bg-border text-white"
              : "bg-transparent text-gray-500 border border-border hover:text-gray-300"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CampaignStats.tsx src/components/StatusFilter.tsx
git commit -m "feat: add CampaignStats bar and StatusFilter components"
```

---

## Task 12: PinLoginDialog Component

**Files:**
- Create: `src/components/PinLoginDialog.tsx`

- [ ] **Step 1: Write the keypad component**

Create `src/components/PinLoginDialog.tsx`:

```typescript
"use client";

import { useState } from "react";

interface PinLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<boolean>;
}

const MAX_DIGITS = 6;

export function PinLoginDialog({ isOpen, onClose, onSubmit }: PinLoginDialogProps) {
  const [digits, setDigits] = useState("");
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleDigit = async (d: string) => {
    if (isSubmitting) return;
    setError(false);
    const next = digits + d;
    setDigits(next);

    if (next.length === MAX_DIGITS) {
      setIsSubmitting(true);
      const success = await onSubmit(next);
      if (success) {
        setDigits("");
        onClose();
      } else {
        setError(true);
        setTimeout(() => {
          setDigits("");
          setError(false);
        }, 600);
      }
      setIsSubmitting(false);
    }
  };

  const handleBackspace = () => {
    setDigits((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setDigits("");
    setError(false);
  };

  const handleClose = () => {
    setDigits("");
    setError(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={handleClose}
    >
      <div
        className={`bg-surface rounded-xl border border-border max-w-xs w-full mx-4 ${error ? "animate-shake" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pt-6 pb-4 text-center">
          <div className="text-gold font-serif text-lg font-bold">
            Admin Access
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {error ? "Invalid PIN" : "Enter PIN to continue"}
          </p>
        </div>

        {/* PIN Dots */}
        <div className="flex justify-center gap-3 pb-5">
          {Array.from({ length: MAX_DIGITS }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-colors ${
                i < digits.length
                  ? "bg-gold"
                  : "border-2 border-border"
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="py-4 bg-border rounded-lg text-white text-xl font-bold hover:bg-gray-600 active:bg-gray-500 transition-colors"
              >
                {d}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="py-4 rounded-lg text-red-400 text-sm hover:text-red-300 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => handleDigit("0")}
              className="py-4 bg-border rounded-lg text-white text-xl font-bold hover:bg-gray-600 active:bg-gray-500 transition-colors"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="py-4 rounded-lg text-gray-500 text-lg hover:text-gray-300 transition-colors"
            >
              &#9003;
            </button>
          </div>
        </div>

        {/* Cancel */}
        <div className="pb-4 text-center">
          <button
            onClick={handleClose}
            className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PinLoginDialog.tsx
git commit -m "feat: add PinLoginDialog with numeric keypad and auto-submit"
```

---

## Task 13: RoomOverlay & BlueprintCanvas Components

**Files:**
- Create: `src/components/RoomOverlay.tsx`, `src/components/BlueprintCanvas.tsx`

- [ ] **Step 1: Write RoomOverlay**

Create `src/components/RoomOverlay.tsx`:

```typescript
"use client";

import { RoomWithDonation, RoomStatus } from "@/lib/types";
import { getRoomColor, formatCurrency } from "@/lib/utils";

interface RoomOverlayProps {
  room: RoomWithDonation;
  dimmed: boolean;
  onClick: (room: RoomWithDonation) => void;
}

export function RoomOverlay({ room, dimmed, onClick }: RoomOverlayProps) {
  const status: RoomStatus = room.donation?.status ?? "available";
  const color = getRoomColor(room.type, status);
  const isCorridor = room.type === "corridor";

  return (
    <div
      className={`absolute flex flex-col items-center justify-center text-center transition-all duration-200 ${
        isCorridor
          ? "cursor-default"
          : "cursor-pointer hover:brightness-125 hover:scale-[1.02]"
      }`}
      style={{
        left: `${room.coordinates.x}%`,
        top: `${room.coordinates.y}%`,
        width: `${room.coordinates.width}%`,
        height: `${room.coordinates.height}%`,
        backgroundColor: `${color}59`,
        border: `2px solid ${color}`,
        borderRadius: "3px",
        opacity: dimmed ? 0.25 : 1,
      }}
      onClick={isCorridor ? undefined : () => onClick(room)}
      role={isCorridor ? undefined : "button"}
      tabIndex={isCorridor ? undefined : 0}
      onKeyDown={
        isCorridor
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") onClick(room);
            }
      }
    >
      <span
        className="font-bold text-[10px] sm:text-xs leading-tight px-1"
        style={{ color: isCorridor ? "#6b6b6b" : `${color}cc` }}
      >
        {room.name}
      </span>
      {!isCorridor && (
        <span
          className="text-[8px] sm:text-[10px] mt-0.5 px-1 truncate max-w-full"
          style={{ color: `${color}aa` }}
        >
          {room.donation
            ? `${status.toUpperCase()} - ${room.donation.donor_name}`
            : formatCurrency(room.price)}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write BlueprintCanvas**

Create `src/components/BlueprintCanvas.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { RoomWithDonation } from "@/lib/types";
import { RoomOverlay } from "./RoomOverlay";

interface BlueprintCanvasProps {
  rooms: RoomWithDonation[];
  dimmedFilter: (room: RoomWithDonation) => boolean;
  onRoomClick: (room: RoomWithDonation) => void;
}

export function BlueprintCanvas({
  rooms,
  dimmedFilter,
  onRoomClick,
}: BlueprintCanvasProps) {
  const [hasImage, setHasImage] = useState<boolean | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setHasImage(true);
    img.onerror = () => setHasImage(false);
    img.src = "/blueprint.png";
  }, []);

  if (hasImage === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading blueprint...</div>
      </div>
    );
  }

  if (!hasImage) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg font-serif">
            No blueprint image found
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Add your blueprint image as{" "}
            <code className="text-gold/70 bg-border px-1.5 py-0.5 rounded text-xs">
              public/blueprint.png
            </code>{" "}
            to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-5 overflow-auto">
      <div className="relative w-full max-w-6xl mx-auto">
        {/* Blueprint image */}
        <img
          src="/blueprint.png"
          alt="Building Blueprint"
          className="w-full h-auto block"
          draggable={false}
        />

        {/* Room overlays */}
        {rooms.map((room) => (
          <RoomOverlay
            key={room.id}
            room={room}
            dimmed={dimmedFilter(room)}
            onClick={onRoomClick}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/RoomOverlay.tsx src/components/BlueprintCanvas.tsx
git commit -m "feat: add BlueprintCanvas and RoomOverlay with percentage-based positioning"
```

---

## Task 14: RoomInfoDisplay & RoomForm Components

**Files:**
- Create: `src/components/RoomInfoDisplay.tsx`, `src/components/RoomForm.tsx`

- [ ] **Step 1: Write RoomInfoDisplay (public view)**

Create `src/components/RoomInfoDisplay.tsx`:

```typescript
"use client";

import { RoomWithDonation } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface RoomInfoDisplayProps {
  room: RoomWithDonation;
}

export function RoomInfoDisplay({ room }: RoomInfoDisplayProps) {
  return (
    <div>
      {/* Price */}
      <div className="text-center py-4 mb-4 border-b border-border">
        <div className="text-gold font-serif text-3xl font-bold">
          {formatCurrency(room.price)}
        </div>
        <div className="text-gray-500 text-xs mt-1">Naming Rights</div>
      </div>

      {/* Content */}
      <div className="bg-[#0d1117] rounded-lg p-4 text-center">
        {room.donation ? (
          <>
            <p className="text-white font-medium">
              {room.donation.donor_name}
            </p>
            {room.donation.dedication_text && (
              <p className="text-gray-400 text-sm mt-2 italic">
                &ldquo;{room.donation.dedication_text}&rdquo;
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-gray-400 text-sm">
              This space is available for naming rights
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Contact campaign leadership for details
            </p>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write RoomForm (admin view)**

Create `src/components/RoomForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { RoomWithDonation, DonationStatus, PaymentMethod } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "./Toast";

interface RoomFormProps {
  room: RoomWithDonation;
  onClose: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "credit", label: "Credit" },
  { value: "pledge_card", label: "Pledge Card" },
  { value: "other", label: "Other" },
];

export function RoomForm({ room, onClose }: RoomFormProps) {
  const { showToast } = useToast();
  const d = room.donation;

  const [donorName, setDonorName] = useState(d?.donor_name ?? "");
  const [dedicationText, setDedicationText] = useState(d?.dedication_text ?? "");
  const [phone, setPhone] = useState(d?.donor_phone ?? "");
  const [email, setEmail] = useState(d?.donor_email ?? "");
  const [address, setAddress] = useState(d?.donor_address ?? "");
  const [status, setStatus] = useState<DonationStatus | "available">(
    d?.status ?? "available"
  );
  const [pledgeAmount, setPledgeAmount] = useState(
    d?.pledge_amount ? (d.pledge_amount / 100).toString() : (room.price / 100).toString()
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(
    d?.payment_method ?? ""
  );
  const [notes, setNotes] = useState(d?.internal_notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!donorName.trim()) {
      showToast("Donor name is required", "error");
      return;
    }
    if (status === "available") {
      showToast("Select a status (Pledged or Sold)", "error");
      return;
    }

    setIsSaving(true);
    try {
      const body = {
        ...(d ? { id: d.id } : {}),
        room_id: room.id,
        donor_name: donorName.trim(),
        dedication_text: dedicationText.trim() || null,
        status,
        donor_phone: phone.trim() || null,
        donor_email: email.trim() || null,
        donor_address: address.trim() || null,
        pledge_amount: pledgeAmount ? Math.round(parseFloat(pledgeAmount) * 100) : null,
        payment_method: paymentMethod || null,
        internal_notes: notes.trim() || null,
      };

      const res = await fetch("/api/donations", {
        method: d ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      showToast("Donation saved successfully");
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!d) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/donations?id=${d.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to clear donation");
      }

      showToast("Room reset to available");
      onClose();
    } catch {
      showToast("Failed to clear donation", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full mt-1 px-3 py-2.5 bg-[#0d1117] border border-border rounded-md text-white text-sm focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass = "text-gray-400 text-[11px] uppercase tracking-wider";

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      {/* Price */}
      <div className="text-center py-3 mb-4 border-b border-border">
        <div className="text-gold font-serif text-2xl font-bold">
          {formatCurrency(room.price)}
        </div>
      </div>

      {/* Donor Information */}
      <div className="mb-4">
        <div className="text-gold text-[10px] uppercase tracking-widest font-bold mb-3">
          Donor Information
        </div>

        <div className="mb-2.5">
          <label className={labelClass}>Donor Name *</label>
          <input
            className={inputClass}
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Name of donor or family"
          />
        </div>

        <div className="mb-2.5">
          <label className={labelClass}>Dedication Text</label>
          <textarea
            className={`${inputClass} min-h-[60px] resize-none`}
            value={dedicationText}
            onChange={(e) => setDedicationText(e.target.value)}
            placeholder="In memory of... / In honor of..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <label className={labelClass}>Phone</label>
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(717) 555-0142"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="donor@email.com"
            />
          </div>
        </div>

        <div className="mb-2.5">
          <label className={labelClass}>Mailing Address</label>
          <input
            className={inputClass}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, Gettysburg, PA 17325"
          />
        </div>
      </div>

      {/* Payment Details */}
      <div className="mb-4">
        <div className="text-gold text-[10px] uppercase tracking-widest font-bold mb-3">
          Payment Details
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <label className={labelClass}>Status</label>
            <select
              className={`${inputClass} appearance-none`}
              value={status}
              onChange={(e) => setStatus(e.target.value as DonationStatus | "available")}
            >
              <option value="available">Available</option>
              <option value="pledged">Pledged</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Pledge Amount</label>
            <input
              className={inputClass}
              type="number"
              value={pledgeAmount}
              onChange={(e) => setPledgeAmount(e.target.value)}
              placeholder={`${room.price / 100}`}
            />
          </div>
        </div>

        <div className="mb-2.5">
          <label className={labelClass}>Payment Method</label>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() =>
                  setPaymentMethod(paymentMethod === m.value ? "" : m.value)
                }
                className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                  paymentMethod === m.value
                    ? "bg-border border border-gold text-gold"
                    : "bg-[#0d1117] border border-border text-gray-500 hover:text-gray-300"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Internal Notes */}
      <div className="mb-4">
        <label className={labelClass}>
          Internal Notes{" "}
          <span className="text-gray-600 italic normal-case">(admin only)</span>
        </label>
        <textarea
          className={`${inputClass} min-h-[60px] resize-none`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Private notes..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-3 bg-gold text-background font-bold rounded-md text-sm hover:bg-gold/90 disabled:opacity-50 transition-colors"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        {d && (
          <button
            onClick={handleClear}
            disabled={isSaving}
            className="px-4 py-3 text-red-400 border border-red-900 rounded-md text-sm hover:bg-red-900/20 disabled:opacity-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/RoomInfoDisplay.tsx src/components/RoomForm.tsx
git commit -m "feat: add RoomInfoDisplay (public) and RoomForm (admin) components"
```

---

## Task 15: RoomModal Component

**Files:**
- Create: `src/components/RoomModal.tsx`

- [ ] **Step 1: Write RoomModal**

Create `src/components/RoomModal.tsx`:

```typescript
"use client";

import { RoomWithDonation, RoomStatus } from "@/lib/types";
import { getRoomColor } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { RoomInfoDisplay } from "./RoomInfoDisplay";
import { RoomForm } from "./RoomForm";

interface RoomModalProps {
  room: RoomWithDonation | null;
  isAdmin: boolean;
  onClose: () => void;
}

export function RoomModal({ room, isAdmin, onClose }: RoomModalProps) {
  if (!room) return null;

  const status: RoomStatus = room.donation?.status ?? "available";
  const color = getRoomColor(room.type, status);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center animate-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-xl sm:rounded-xl w-full sm:max-w-md mx-0 sm:mx-4 max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div
          className="px-6 pt-6 pb-4"
          style={{
            background: `linear-gradient(180deg, ${color} 0%, #111827 100%)`,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white font-serif text-xl font-bold">
                {room.name}
              </h2>
              {room.description && (
                <p className="text-gray-400 text-sm mt-1">
                  {room.description}
                </p>
              )}
            </div>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {isAdmin ? (
            <RoomForm room={room} onClose={onClose} />
          ) : (
            <RoomInfoDisplay room={room} />
          )}

          {/* Close button (only for public view — admin has its own close via form) */}
          {!isAdmin && (
            <button
              onClick={onClose}
              className="w-full mt-4 py-2.5 bg-border text-gray-400 rounded-md text-sm hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/RoomModal.tsx
git commit -m "feat: add RoomModal with gradient header and admin/public view switching"
```

---

## Task 16: Main Page — Assemble Everything

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx` (add ToastProvider)

- [ ] **Step 1: Add ToastProvider to layout**

Update `src/app/layout.tsx` to wrap children in ToastProvider:

```typescript
import type { Metadata } from "next";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "AREMS Capital Campaign — Building Naming Rights",
  description:
    "Interactive building blueprint for the AREMS capital campaign naming rights program.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-white antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Write the main page**

Replace `src/app/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { RoomWithDonation, RoomStatus } from "@/lib/types";
import { useRooms } from "@/hooks/useRooms";
import { useAdmin } from "@/hooks/useAdmin";
import { useCampaignStats } from "@/hooks/useCampaignStats";
import { CampaignStats } from "@/components/CampaignStats";
import { StatusFilter } from "@/components/StatusFilter";
import { BlueprintCanvas } from "@/components/BlueprintCanvas";
import { RoomModal } from "@/components/RoomModal";
import { PinLoginDialog } from "@/components/PinLoginDialog";

type FilterValue = "all" | RoomStatus;

export default function Home() {
  const { rooms, isLoading } = useRooms();
  const { isAdmin, login, logout } = useAdmin();
  const stats = useCampaignStats(rooms);

  const [filter, setFilter] = useState<FilterValue>("all");
  const [selectedRoom, setSelectedRoom] = useState<RoomWithDonation | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const dimmedFilter = (room: RoomWithDonation): boolean => {
    if (filter === "all") return false;
    const roomStatus: RoomStatus = room.donation?.status ?? "available";
    return roomStatus !== filter;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CampaignStats
        campaignName={stats.campaignName}
        totalRaised={stats.totalRaised}
        goal={stats.goal}
        progress={stats.progress}
        available={stats.available}
        pledged={stats.pledged}
        sold={stats.sold}
        isAdmin={isAdmin}
        onAdminClick={() => setShowPinDialog(true)}
        onLogout={logout}
      />

      <StatusFilter active={filter} onChange={setFilter} />

      <BlueprintCanvas
        rooms={rooms}
        dimmedFilter={dimmedFilter}
        onRoomClick={setSelectedRoom}
      />

      <RoomModal
        room={selectedRoom}
        isAdmin={isAdmin}
        onClose={() => setSelectedRoom(null)}
      />

      <PinLoginDialog
        isOpen={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onSubmit={login}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds. The page should render (though with no rooms or blueprint yet).

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat: assemble main page with all components, hooks, and interactions"
```

---

## Task 17: Setup Documentation

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README**

Create `README.md`:

````markdown
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

1. Push to GitHub: `git push origin main`
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
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add setup and deployment README"
```

---

## Task 18: Final Build Verification & Push

- [ ] **Step 1: Full build check**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Verify dev server starts**

```bash
npm run dev
```

Check `http://localhost:3000` — should see the empty state with "No blueprint image found" and the stats bar.

- [ ] **Step 3: Push to GitHub**

```bash
git push -u origin master
```
