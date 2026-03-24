# EMS Building Naming Rights — Design Spec

## Overview

Interactive web application for an EMS organization's capital campaign. Displays a building blueprint where leadership can click rooms/areas and assign naming rights donors in real time at fundraising events. Hosted on Vercel at `building.arems.net` with Supabase as the backend.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL) with Realtime
- **Auth:** PIN-based (server-side verification, HTTP-only cookie session)
- **Hosting:** Vercel
- **Domain:** building.arems.net

## Database Schema

### `rooms` table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK, default gen_random_uuid()) | Unique room identifier |
| slug | text (unique, not null) | URL-friendly identifier (e.g., "bay-1") |
| name | text (not null) | Display name (e.g., "Apparatus Bay 1") |
| type | text (not null) | One of: "bay", "office", "common", "utility", "bedroom", "corridor" |
| description | text | Room description shown in modal |
| price | integer (not null) | Price in cents (e.g., 10000000 = $100,000) |
| coordinates | jsonb (not null) | Position/size as percentages: `{ x, y, width, height }` |
| sort_order | integer (default 0) | Display order in lists |
| created_at | timestamptz (default now()) | Record creation timestamp |

### `donations` table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK, default gen_random_uuid()) | Unique donation identifier |
| room_id | uuid (FK → rooms.id, unique, not null) | One donation per room |
| donor_name | text (not null) | Name of the donor or family |
| dedication_text | text | Optional dedication message |
| status | text (not null, default 'pledged') | One of: "pledged", "sold" |
| donor_phone | text | Contact phone number |
| donor_email | text | Contact email address |
| donor_address | text | Mailing address for tax receipts/thank-you letters |
| pledge_amount | integer | Amount in cents (defaults to room price if null) |
| payment_method | text | One of: "cash", "check", "credit", "pledge_card", "other" |
| internal_notes | text | Private notes (admin-only, not shown publicly) |
| donated_at | timestamptz (default now()) | When the donation was recorded |
| updated_at | timestamptz (default now()) | Last update timestamp |
| updated_by | text | Name/identifier of who made the change |

### `campaign_settings` table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK, default gen_random_uuid()) | |
| campaign_name | text (default 'Capital Campaign') | Display name |
| campaign_goal | integer | Goal amount in cents |
| is_active | boolean (default true) | Whether the campaign is live |
| updated_at | timestamptz (default now()) | |

### RLS Policies

- **rooms:** SELECT for anon. INSERT/UPDATE/DELETE for service_role only.
- **donations:** SELECT for anon. INSERT/UPDATE/DELETE for service_role only.
- **campaign_settings:** SELECT for anon. UPDATE for service_role only.

### Realtime

Enabled on the `donations` table. When an admin updates a room's donation status, all connected clients see the change immediately.

## Application Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, providers
│   ├── page.tsx                # Main blueprint view (public + admin)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── verify/route.ts # POST — verify PIN, set signed HTTP-only cookie
│   │   │   └── logout/route.ts # POST — clear session cookie
│   │   └── donations/
│   │       └── route.ts        # POST/PUT/DELETE — admin writes via service_role
├── components/
│   ├── BlueprintCanvas.tsx     # Blueprint image + room overlay container
│   ├── RoomOverlay.tsx         # Individual clickable room rectangle
│   ├── RoomModal.tsx           # Modal wrapper (slides up, backdrop blur)
│   ├── RoomForm.tsx            # Admin form (donor info, payment, notes)
│   ├── RoomInfoDisplay.tsx     # Public read-only donor/availability display
│   ├── CampaignStats.tsx       # Top stats bar with progress
│   ├── StatusFilter.tsx        # Filter buttons: All / Available / Pledged / Sold
│   ├── StatusBadge.tsx         # Color-coded status pill
│   └── PinLoginDialog.tsx      # PIN entry with numeric keypad
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client (anon key, read-only)
│   │   └── server.ts           # Server client (service_role key, writes)
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # formatCurrency, color helpers
├── hooks/
│   ├── useRooms.ts             # Fetch rooms + realtime donation subscriptions
│   ├── useAdmin.ts             # Admin session state (checks cookie)
│   └── useCampaignStats.ts     # Computed campaign totals
└── styles/
    └── globals.css             # Tailwind + custom CSS
```

## Authentication Flow

1. User taps "Admin Login" button in the top-right of the stats bar.
2. PIN keypad dialog appears as a centered overlay with backdrop blur.
3. User enters up to 6 digits on a numeric keypad (gold dots fill as digits are entered).
4. On submit (auto-submits when 6 digits entered, or tap Unlock): POST to `/api/auth/verify` with the PIN.
5. Server compares PIN against `ADMIN_PIN` environment variable.
6. On success: server sets a signed HTTP-only cookie (JWT signed with a secret derived from `ADMIN_PIN` + a hardcoded salt). No separate SESSION_SECRET env var needed — keeps setup simple. Returns 200.
7. Client updates admin state via `useAdmin` hook. Modal forms become editable.
8. On failure: shake animation on the keypad, dots reset, "Invalid PIN" message.
9. Logout: POST to `/api/auth/logout`, clears the cookie.

The PIN is **545400** — stored only as the `ADMIN_PIN` environment variable, never in client code.

## Blueprint Canvas

- The blueprint image loads from `/public/blueprint.png` (or `.jpg`).
- If no image exists, show an empty state: "Upload your blueprint image to get started."
- Room overlays are positioned using CSS `position: absolute` with percentage-based `top`, `left`, `width`, `height` from each room's `coordinates` JSONB field.
- The container uses `position: relative` with the blueprint as a contained image.
- Responsive: scales to fit the viewport width, overlays maintain position via percentages.

### Room Overlay Colors

**Available (by room type):**

| Type | Color | Hex |
|------|-------|-----|
| bay | Deep blue | #1a5276 |
| office | Navy | #2c3e7a |
| common | Purple | #6c3483 |
| utility | Muted purple | #5d4e60 |
| bedroom | Teal | #1a5c5c |
| corridor | Dark gray | #3a3a3a |

**By donation status (overrides type color):**

| Status | Color | Hex |
|--------|-------|-----|
| Pledged | Gold | #7d5a0b |
| Sold | Green | #0e6b3a |

Room overlays render with:
- Semi-transparent fill (`opacity ~0.35`)
- Solid 2px border in the status/type color
- Room name label centered
- Price shown below name (for available rooms)
- Donor name shown below name (for pledged/sold rooms)
- Hover: subtle brightness/scale effect
- Corridors: visible, labeled, dark gray, non-interactive (no hover effect, no click handler)

## Room Modal

Triggered by tapping a room overlay. Slides up from bottom (mobile) or fades in centered (desktop/tablet). Backdrop blur behind the modal.

### Header
- Gradient background matching the room's status color fading to the dark theme
- Room name (Playfair Display serif font, large)
- Room description
- Status badge (color-coded pill)

### Public View (not authenticated)
- Room name, description, price (gold, prominent)
- Status badge
- If donated: donor name and dedication text (read-only)
- If available: "This space is available for naming rights"
- Close button

### Admin View (authenticated)

**Donor Information section:**
- Donor Name (text input, required)
- Dedication Text (textarea)
- Phone and Email (side by side)
- Mailing Address (text input)

**Payment Details section:**
- Status (dropdown: Available / Pledged / Sold)
- Pledge Amount (currency input, defaults to room price)
- Payment Method (toggle buttons: Cash, Check, Credit, Pledge Card, Other)

**Internal Notes section:**
- Textarea, labeled "admin only"

**Actions:**
- Save Changes (gold button) — POST/PUT to `/api/donations/route.ts` which uses service_role to write
- Clear/Reset (red outline button) — deletes the donation record, sets room back to available
- Close button

On save: toast notification, modal closes, realtime update propagates to all clients.

## Campaign Stats Bar

Persistent bar at the top of the page:
- **Left:** Campaign name (gold, serif), Total Raised, Campaign Goal
- **Right:** Room counts (Available / Pledged / Sold with color dots), Admin Login button
- **Below:** Thin progress bar (gradient from green to gold)
- Updates in realtime as donations change

## Status Filters

Row of filter buttons below the stats bar:
- All (default, shows all rooms)
- Available (dims non-available rooms)
- Pledged (dims non-pledged rooms)
- Sold (dims non-sold rooms)

Filtering dims non-matching rooms (reduced opacity) rather than hiding them, so the blueprint layout stays intact.

## Design System

- **Background:** #0a0f1a (dark navy)
- **Surface:** #111827 (card/modal backgrounds)
- **Border:** #1f2937
- **Gold accent:** #d4a44a (prices, campaign branding, save buttons)
- **Headings font:** Playfair Display (serif)
- **Body font:** Inter (sans-serif)
- **Toast notifications** for save confirmations (success = green, error = red)
- **Animations:** modal slide-up/fade-in, backdrop blur, hover brightness on rooms

## Mobile / Tablet Optimization

Primary use case is tablets at fundraising events:
- Touch-friendly room targets (minimum 44px tap targets)
- Modal scrollable on smaller screens
- No horizontal scroll — blueprint scales to fit width
- Filter buttons horizontally scrollable if needed on phone
- PIN keypad sized for finger taps (48px+ button targets)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=          # Server-side only — writes
ADMIN_PIN=545400                    # Server-side only — admin PIN
```

## Supabase Setup

Deliverables:
- `supabase/migrations/001_initial_schema.sql` — full schema, RLS policies, indexes, realtime config
- `supabase/seed.sql` — empty with format comments (no placeholder data)

## Deployment

- Vercel with `building.arems.net` subdomain
- DNS: CNAME record for `building` pointing to Vercel deployment
- `vercel.json` if needed
- Setup docs included in project README

## What Is NOT Included

- No placeholder room data — rooms table ships empty
- No generated floor plan — app loads image from `/public`
- No dummy donor data
- No Supabase Auth / user accounts
