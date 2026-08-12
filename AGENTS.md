# GEMINI.md - System Context & Development Guidelines

## 🎯 Domain Context & Critical Guardrails
This project is **Bayanihan Events Platform**, a high-concurrency venue reservation system customized specifically for **Regina’s Garden and Restaurant** (located at Maramba Blvd., Libsong West, Lingayen, Pangasinan).

> ⚠️ **STRICT DOMAIN BOUNDARY & MOBILE-FIRST DIRECTIVE:**
> * **MOBILE-FIRST MANDATE:** All public pages, admin dashboards, forms, cards, and modals **SHOULD AND MUST** be designed and implemented from a **Mobile-First perspective**. Always design for narrow touchscreens first, utilizing fluid spacing, full-width touch targets, non-cluttering overlays, and responsive breakpoints (`sm:`, `md:`, `lg:`).
> * **NO HOTEL/RESORT TERMINOLOGY:** This is **NOT** a hotel or resort reservation system.
>   * **DO NOT** use terms like "rooms", "beds", "nights", "check-in/check-out", or "room rates".
>   * **ALWAYS** model operations using **Event Venues** (*Garden Pavilions, Glass Function Halls, Al Fresco Verandas*), **5-Hour Time Blocks** (*Morning/Lunch* vs. *Evening/Dinner* vs. *Whole Day*), **Occasion Types** (*18th Debuts, Garden Weddings, Baptismal Receptions, Family Reunions, Corporate/LGU Seminars*), **In-House Catering Headcounts**, **Sounds & Lights Styling**, and **Local Downpayment Rules**.
> * **BRAND TAGLINE:** *“It’s not a celebration, unless it’s Regina’s.”*

---

## 🎨 Design System & Light Theme Tokens (Regina's Garden Branding)

### 1. Light, Sunlit Color Palette
* **Primary Brand Green:** Deep Forest / Emerald Green (`#022c22` / `emerald-950`, `#064e3b` / `emerald-900`, `#065f46` / `emerald-800`). Used for primary headers, navigation bars, and primary CTA triggers.
* **Secondary Champagne Gold:** Warm Metallic & Champagne Gold (`#fde68a` / `amber-200`, `#fcd34d` / `amber-300`, `#fbbf24` / `amber-400`, `#b45309` / `amber-700`). Used for capacity badges, price tags, logo emblem rings, and active step focus rings.
* **Bright Neutral Backgrounds:** Light Stone & Clean Off-White (`#fafaf9` / `stone-50`, `#ffffff` / `white`, `#f5f5f4` / `stone-100`). Evokes a bright, airy, and celebratory garden ambiance instead of a dark night lounge.

### 2. Typography Dual System
* **Header Font (Serif):** `Playfair Display` (`font-serif`) — Captures the sophisticated, celebratory tone of debuts, weddings, and banquets.
* **Body Font (Sans-Serif):** `Inter` (`font-sans`) — Provides high legibility for descriptions, forms, catering menus, and checkout line items.

### 3. Mobile-First UI/UX Architectural Rules & Key Modules
* **Hero Section & Dynamic Branding (`src/app/(public)/page.tsx`):**
    * Reads dynamic content from `public.site_settings` via `getSiteSettings()`.
    * Features a full-bleed widescreen background image with a light vignette overlay, containing a translucent glass card (`bg-white/80 backdrop-blur-md`) scaling fluidly without obscuring venue imagery on mobile viewports.
    * Supports dynamic badge text and event-themed Lucide badge icons (*Sparkles, PartyPopper, Trees, Heart, Crown, Calendar, Utensils, Music, Flower2, Building2, Star*) mapped via `ICON_MAP`.
    * Includes a conditionally rendered social proof trust bar (`show_social_proof_bar`) with dynamic text and icons (*"4.9★ Rated Venue"*, *"100% In-House Buffet Catering"*, *"1,200+ Celebrations Hosted"*).
    * Feature cards double as equal-height flex containers with uniform font weights and welcoming phrasing (*"Flexible Payments"*).
* **Venues Directory Listing (`src/app/(public)/venues/page.tsx`):**
    * Includes a sticky navigation bar with a clear `← Back to Home` action link.
    * Features interactive category filter pills (*All Spaces, Outdoor Garden, Indoor Glass Hall, Al Fresco Deck*) and a dynamic sort selector (*Recommended, Highest Capacity, Lowest Rental Rate*).
* **Venue Cards & Interactive Slideshow (`src/modules/events/components/VenueCard.tsx`):**
    * Borderless white cards backed by soft drop shadows (`shadow-md hover:shadow-2xl hover:-translate-y-1.5`).
    * **Automated Multi-Photo Slideshow:** Cross-fade slide transitions every 3.5s with pause-on-hover, slide indicator pills, photo counter (`📸 1 / N`), and left/right navigation controls.
    * Displays dynamic rental duration labels (`venue.slot_duration_text` e.g., `/ 5-hr slot block`).
    * Displays a golden **PREMIER CHOICE** badge dynamically driven by `venue.is_featured`.
    * **Click-to-Enlarge Lightbox Trigger:** Clicking any venue photo opens the enlarged lightbox modal.
* **Enlarged Photo Lightbox Modal (`src/modules/events/components/VenueImageLightboxModal.tsx`):**
    * Full-screen modal with ambient blur background lighting.
    * Keyboard navigation support (`Esc` to exit, `ArrowLeft` / `ArrowRight` to cycle photos).
    * Interactive thumbnail gallery strip.
    * Render-phase state adjustments preventing `react-hooks/set-state-in-effect` warnings.
* **Interactive Step Wizard (`src/modules/events/components/EventReservationFlow.tsx`):**
    * **Explicit Active Slot Visibility:** Selected slot cards feature an explicit checkmark (`CheckCircle2`), bold green border (`border-2 border-emerald-800`), light green background tint (`bg-emerald-50/90`), and a `"SELECTED"` badge.
    * **Cancellation Safety Modal:** Responsive popup (`AlertTriangle` modal) prompting confirmation before releasing slot holds.
    * **Sticky Financial Sidebar:** Mobile-first calculator sidebar (`lg:sticky lg:top-24`) dynamically calculates total cost, 30% required deposit, and remaining balance.
* **Responsive Admin Portal & Site Content Management (`src/app/admin/page.tsx`):**
    * **Dynamic Banner Header:** Banner subtitle (`admin_portal_label`) and title (`admin_portal_title`) are editable live from the admin panel.
    * **Venue Spaces Tab (`VenuesTab.tsx`):**
        * **Catalog Management Bar:** Header containing the `+ Add New Venue` trigger.
        * **Premier Choice Toggle:** Clickable `★ PREMIER CHOICE` toggle to feature/un-feature spaces.
        * **Active / Inactive Status Badges:** Quick-toggle switch between Active and Inactive (Maintenance) modes.
        * **Edit Venue Details Modal Trigger:** Opens full venue edit drawer.
    * **Add New Venue Modal (`AddVenueModal.tsx`):** Enables staff to create new venue spaces with custom pricing, capacity, custom duration labels, active status, description, and multi-photo uploads.
    * **Edit Venue Modal (`EditVenueModal.tsx`):**
        * Client-side HTML5 Canvas image downscaling/compression (`compressImageFile`) to resize local uploads to ~200–400KB JPEGs before submission.
        * Supports dual upload channels: local photo files (via `FileReader`) and direct web image URLs.
        * Editable duration label field (`slot_duration_text`).
        * Interactive gallery grid with instant thumbnail previews and deletion controls.
        * Render-phase state adjustment (`if (venue && venue.id !== prevVenueId)`) conforming strictly to React Rules of Hooks without triggering `react-hooks/set-state-in-effect`.
    * **Hero Content & Branding Tab (`HeroSettingsTab.tsx`):** Controls announcement banners, business titles, navigation labels, headlines, season badges, social proof trust items, and admin portal header text (`admin_portal_label`, `admin_portal_title`). Clean HTML entities (`&quot;`) prevent `react/no-unescaped-entities` warnings.

---

## 🛠️ Stack Architecture & Payload Configuration

* **Framework:** Next.js 15+ / 16 (App Router with Turbopack), React 19, TypeScript
* **Server Action Payload Limit (`next.config.ts`):** Configured with `experimental.serverActions.bodySizeLimit: '10mb'` to handle compressed multi-photo uploads smoothly.
* **Styling & Fonts:** Tailwind CSS v4 (`@import "tailwindcss";`), Google Fonts (`Playfair_Display`, `Inter`), Lucide React
* **Backend & Database:** Supabase PostgreSQL, Stored Procedures, Service Role SDK (`supabaseAdmin.ts`), Realtime WebSockets
* **State & Server Execution:** Next.js Server Actions (`venueActions.ts`, `adminActions.ts`) with typed responses
* **Architecture Style:** Modular feature-based layout inside `src/modules/` (`events/`, `admin/`, `packages/`, `shared/`)

---

## 📁 Modular Directory Blueprint

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── (public)/
│   │   ├── page.tsx
│   │   └── venues/
│   │       ├── page.tsx
│   │       └── [slug]/
│   │           └── page.tsx
│   └── admin/
│       └── page.tsx
└── modules/
    ├── admin/
    │   ├── actions/
    │   │   └── adminActions.ts
    │   └── components/
    │       ├── modals/
    │       │   ├── AddVenueModal.tsx
    │       │   ├── EditVenueModal.tsx
    │       │   └── VerifyReceiptModal.tsx
    │       └── tabs/
    │           ├── BookingsTab.tsx
    │           ├── HeroSettingsTab.tsx
    │           ├── PackagesTab.tsx
    │           └── VenuesTab.tsx
    ├── events/
    │   ├── actions/
    │   │   └── venueActions.ts
    │   └── components/
    │       ├── EventReservationFlow.tsx
    │       ├── VenueCard.tsx
    │       ├── VenueGrid.tsx
    │       └── VenueImageLightboxModal.tsx
    ├── packages/
    │   ├── actions/
    │   │   └── packageActions.ts
    │   └── components/
    │       └── PackageCard.tsx
    └── shared/
        ├── components/
        │   └── UI/
        ├── types/
        │   └── database.types.ts
        └── utils/
            ├── supabase.ts
            └── supabaseAdmin.ts

```

---

## 🗄️ Database Reference (`supabase/migrations/20260810000000_init_event_venues.sql`)

All database interactions must strictly conform to the primary schema established for this platform:

### 1. Database Enums

* `ph_payment_method`: `'gcash'`, `'maya'`, `'palawan_express'`, `'cliqq_7eleven'`, `'bank_transfer'`, `'cash_otc'`
* `event_booking_status`: `'pending_deposit'`, `'confirmed'`, `'completed'`, `'cancelled'`
* `venue_slot_block`: `'morning_lunch'`, `'evening_dinner'`, `'whole_day'`
* `ph_event_type`: `'debut_18th'`, `'wedding'`, `'christening_banyag'`, `'baranggay_fiesta'`, `'corporate_party'`, `'private_gathering'`

### 2. Primary Tables

* `public.event_venues`: Base spaces (*Regina's Main Garden Pavilion*, *Grand Glass Function Hall*, *Veranda Al Fresco Deck*), capacity, rental rates, maintenance status (`is_under_maintenance`), premier choice flag (`is_featured`), and duration label (`slot_duration_text`).
* `public.event_packages`: In-house buffet bundles (*Classic Garden Feast*, *Royal Garden Grand Celebration*), headcount, sounds/lights, stage backdrop inclusions.
* `public.event_add_ons`: Optional extras (*Live Lechon Carving Station*, *Pangasinan Seafood Special Bar*, *360 Photo Booth*).
* `public.event_slot_holds`: Temporary reservation locks with `expires_at` TTL.
* `public.event_bookings`: Permanent bookings (`EVT-YYYY-XXXX` ID format) tracking 30% / ₱5,000 downpayment calculations.
* `public.site_settings`: Single-row (`id = 1`) configuration storing dynamic homepage labels, text headlines, CTAs, badge icons, social proof items, and admin portal header text (`admin_portal_label`, `admin_portal_title`).

```sql
-- Schema Enhancements for Event Venues & Admin Branding
ALTER TABLE public.event_venues
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS slot_duration_text TEXT NOT NULL DEFAULT '/ 5-hr slot block';

-- Create site_settings table for dynamic site-wide content
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1,
    top_banner_text TEXT NOT NULL DEFAULT 'Maramba Blvd., Libsong West, Lingayen, Pangasinan — Open for 2026/2027 Event Reservations',
    business_name TEXT NOT NULL DEFAULT 'Regina’s Garden',
    business_subtitle TEXT NOT NULL DEFAULT '& Restaurant',
    nav_link_1_label TEXT NOT NULL DEFAULT 'Event Spaces',
    nav_link_2_label TEXT NOT NULL DEFAULT 'Services & Catering',
    nav_link_3_label TEXT NOT NULL DEFAULT 'Our Ambiance',
    nav_cta_button_text TEXT NOT NULL DEFAULT 'Check Availability',
    hero_season_badge_text TEXT NOT NULL DEFAULT 'Booking 2026 / 2027 Seasons',
    hero_season_badge_icon TEXT NOT NULL DEFAULT 'Sparkles',
    hero_headline_main TEXT NOT NULL DEFAULT 'It’s not a celebration,',
    hero_headline_highlight TEXT NOT NULL DEFAULT 'unless it’s Regina’s.',
    hero_subtitle TEXT NOT NULL DEFAULT 'Host your dream garden wedding, 18th debut, baptismal reception, or corporate banquet nestled in Lingayen’s premier pavilion venue.',
    hero_cta_button_text TEXT NOT NULL DEFAULT 'Reserve an Event Space',
    hero_scroll_label TEXT NOT NULL DEFAULT 'SCROLL TO EXPLORE',
    show_social_proof_bar BOOLEAN NOT NULL DEFAULT true,
    proof_1_text TEXT NOT NULL DEFAULT '4.9★ Rated Venue in Pangasinan',
    proof_1_icon TEXT NOT NULL DEFAULT 'Star',
    proof_2_text TEXT NOT NULL DEFAULT '100% In-House Buffet Catering',
    proof_2_icon TEXT NOT NULL DEFAULT 'Award',
    proof_3_text TEXT NOT NULL DEFAULT '1,200+ Celebrations Hosted',
    proof_3_icon TEXT NOT NULL DEFAULT 'Users2',
    admin_portal_label TEXT NOT NULL DEFAULT 'STAFF PORTAL OVERVIEW',
    admin_portal_title TEXT NOT NULL DEFAULT 'Regina’s Garden Management',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- Seed initial default settings row
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Grant public read access
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to site_settings" ON public.site_settings FOR SELECT USING (true);

```

### 3. Concurrency Locking Mechanics

Slot holds are governed by the atomic PostgreSQL stored procedure:

```sql
public.hold_event_slot(p_venue_id UUID, p_event_date DATE, p_slot_block venue_slot_block, p_session_id TEXT)

```

### 4. Admin Security & RLS Bypass

* Public user queries run through `src/modules/shared/utils/supabase.ts` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
* Administrative operations (`src/modules/admin/actions/adminActions.ts`) MUST execute via `src/modules/shared/utils/supabaseAdmin.ts` (`SUPABASE_SERVICE_ROLE_KEY`) to bypass Supabase Row Level Security (RLS) safely on server-side actions.

---

## 📐 Coding Standards & Guidelines

### 1. Strict TypeScript Rules

* All database entities, form payloads, site settings, and Server Action responses must be explicitly typed in `src/modules/shared/types/database.types.ts`.
* **Zero `any` Policy:** Always type function arguments, state setters, and Supabase query results explicitly.
* **Strict Generic Assignment Rule:** Generic default type assignments MUST use `=` syntax (`<T = void>`). Never omit the equals sign.

```typescript
// src/modules/shared/types/database.types.ts

export type PHPaymentMethod = 'gcash' | 'maya' | 'palawan_express' | 'cliqq_7eleven' | 'bank_transfer' | 'cash_otc';
export type EventBookingStatus = 'pending_deposit' | 'confirmed' | 'completed' | 'cancelled';
export type VenueSlotBlock = 'morning_lunch' | 'evening_dinner' | 'whole_day';
export type PHEventType = 'debut_18th' | 'wedding' | 'christening_banyag' | 'baranggay_fiesta' | 'corporate_party' | 'private_gathering';

export interface EventVenue {
  id: string;
  name: string;
  slug: string;
  description: string;
  max_guest_capacity: number;
  base_rental_rate_php: number;
  slot_duration_text?: string;
  is_under_maintenance: boolean;
  is_featured: boolean;
  image_urls: string[];
  created_at: string;
}

export interface EventPackage {
  id: string;
  name: string;
  description: string;
  included_catering_headcount: number;
  has_sounds_and_lights: boolean;
  has_stage_backdrop: boolean;
  price_php: number;
}

export interface EventAddOn {
  id: string;
  name: string;
  description: string;
  price_php: number;
}

export interface SlotBlockAvailability {
  slot_block: VenueSlotBlock;
  label: string;
  time_range: string;
  price_php: number;
  status: 'available' | 'held' | 'booked';
  held_expires_at?: string;
}

export interface EventBookingPayload {
  venue_id: string;
  event_date: string;
  slot_block: VenueSlotBlock;
  event_type: PHEventType;
  package_id: string;
  add_on_ids: string[];
  expected_guest_count: number;
  total_amount_php: number;
  required_deposit_php: number;
  remaining_balance_php: number;
  payment_method: PHPaymentMethod;
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
}

export interface EventBookingRecord extends EventBookingPayload {
  id: string;
  status: EventBookingStatus;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  top_banner_text: string;
  business_name: string;
  business_subtitle: string;
  nav_link_1_label: string;
  nav_link_2_label: string;
  nav_link_3_label: string;
  nav_cta_button_text: string;
  hero_season_badge_text: string;
  hero_season_badge_icon: string;
  hero_headline_main: string;
  hero_headline_highlight: string;
  hero_subtitle: string;
  hero_cta_button_text: string;
  hero_scroll_label: string;
  show_social_proof_bar: boolean;
  proof_1_text: string;
  proof_1_icon: string;
  proof_2_text: string;
  proof_2_icon: string;
  proof_3_text: string;
  proof_3_icon: string;
  admin_portal_label: string;
  admin_portal_title: string;
  updated_at?: string;
}

// ALWAYS use <T = void> syntax with the '=' sign
export interface ServerActionResponse<T = void> {
  success: boolean;
  message?: string;
  data?: T;
}

```

### 2. UI & Component Standards

* **Tailwind v4 Rule:** Use `@import "tailwindcss";` in `src/app/globals.css`. Do not use deprecated v3 `@tailwind base;` directives.
* **Mobile-First Priority:** Write Tailwind utilities mobile-first (e.g., `text-xs sm:text-sm md:text-base`, `flex-col sm:flex-row`, `w-full sm:w-auto`).
* **Theme Styling:** Use light stone backgrounds (`bg-stone-50`, `bg-white`), forest green primary triggers (`bg-emerald-900`, `hover:bg-emerald-950`), and champagne gold accents (`text-amber-600`, `bg-amber-100`, `bg-amber-300`).
* **Component Boundaries:** Modals belong in `src/modules/admin/components/modals/`, tab layouts in `src/modules/admin/components/tabs/`.
* **State & Feedback:** Asynchronous submissions must display explicit loading indicators (`Loader2`), disable submit triggers during execution, and render feedback alerts on error or success.
* **Maintenance Logic:** Public views call `getVenues()` (filtering out `is_under_maintenance: true`). Admin dashboards call `getVenues(true)` to display maintenance status badges.

### 3. Server Actions Protocol

* Every Server Action must return a strongly-typed `ServerActionResponse<T>` object.
* Use `supabaseAdmin` for admin actions (`createVenue`, `updateVenueDetails`, `toggleFeaturedVenue`, `updateSiteSettings`) to bypass Supabase RLS safely on server actions.
* Always trigger `revalidatePath()` on modified paths (`/`, `/admin`, `/venues`) upon database mutations.

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/modules/shared/utils/supabaseAdmin';
import { ServerActionResponse, EventVenue } from '@/modules/shared/types/database.types';

export async function createVenue(
  payload: Omit<EventVenue, 'created_at' | 'id'>
): Promise<ServerActionResponse<EventVenue>> {
  try {
    const generatedSlug =
      payload.slug ||
      payload.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const { data, error } = await supabaseAdmin
      .from('event_venues')
      .insert({
        ...payload,
        slug: generatedSlug,
        is_featured: payload.is_featured ?? false,
        is_under_maintenance: payload.is_under_maintenance ?? false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/venues');

    return {
      success: true,
      message: `${data.name} added to venue catalog successfully!`,
      data: data as EventVenue,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create venue.';
    return { success: false, message };
  }
}

```

### 4. IDE, React 19 & Warning Prevention Rules

#### 4.1 Avoiding Unescaped JSX Character Warnings (`react/no-unescaped-entities`)

* **Problem:** JSX text containing raw unescaped quotes (`"`, `'`) triggers ESLint warnings.
* **Prevention Rule:** Always escape quotes using HTML entities (`&quot;`, `&apos;`) or wrap string literals inside JSX expressions (`{"\""}`):

```tsx
// ✅ RECOMMENDED: Use HTML entities for clean JSX
<p>The social proof bar is hidden. Click &quot;Hidden from Landing Page&quot; above to enable it.</p>

```

#### 4.2 Render-Phase State Adjustment Rule (Preventing `react-hooks/set-state-in-effect`)

* **Problem:** Calling `setState` synchronously inside `useEffect` when props change causes cascading renders and ESLint errors.
* **Prevention Rule:** Do not use `useEffect` to synchronize props to state. Perform render-phase state adjustments directly in the component body before early returns:

```tsx
// ✅ RECOMMENDED: Perform render-phase state adjustment when props change
export const EditVenueModal = ({ venue, onClose }) => {
  const [name, setName] = useState('');
  const [prevVenueId, setPrevVenueId] = useState<string | null>(null);

  // Synchronize state safely during rendering without useEffect
  if (venue && venue.id !== prevVenueId) {
    setPrevVenueId(venue.id);
    setName(venue.name || '');
  }

  if (!venue) return null; // Safe early return
};

```

#### 4.3 Client-Side Image Downscaling (Preventing `Body exceeded 1 MB limit` Errors)

* **Problem:** High-resolution local image uploads converted directly to Base64 strings can exceed Server Action body payload limits.
* **Prevention Rule:** Always downscale client-side images via HTML5 Canvas before sending Base64 strings to Server Actions:

```typescript
const compressImageFile = (file: File, maxWidth = 1600, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

```

#### 4.4 Avoiding Tailwind CSS Property Conflict Warnings in JetBrains IDEs

* **Prevention Rule:** Use focus ring utilities (`focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800`) to avoid stacking redundant static border and focus border overrides.

#### 4.5 Parameterized React 19 Form Handlers

* **Prevention Rule:** Always explicitly parameterize form submission handlers with `React.FormEvent<HTMLFormElement>`.

---

## 💡 Localized Financial Rules & Business Equations

When writing financial calculations for dynamic estimates and checkout flows, adhere strictly to these formulas:

* **Total Event Cost Assembly:**

$$\text{Total Cost} = \text{Base Rental (Slot Block)} + \text{Package Price} + \sum(\text{Add-ons})$$


* **Required Downpayment Formula:**

$$\text{Required Downpayment} = \max(5000, \text{Math.round}(\text{Total Cost} \times 0.30))$$


* **Remaining Balance Formula:**

$$\text{Remaining Balance} = \text{Total Cost} - \text{Required Downpayment}$$



---

## 🤖 Output Expectations for Gemini Code Assist

* **Complete Code Snippets:** Provide full, copy-paste-ready React/TypeScript code without truncating imports, types, or internal logic.
* **Strict Domain Consistency:** Always use event venue nomenclature (organizer, event date, slot block, catering headcount, package). Never default to hotel/resort terminology (rooms, nights, check-in).
* **Strict Mobile-First Directive:** All generated components, layouts, pages, and modals must explicitly prioritize mobile viewport layouts and touch responsiveness before desktop enhancements.
* **Zero Deprecation & Warning Policy:** Ensure all code snippets comply with Rule 4 (using `React.FormEvent<HTMLFormElement>`, render-phase prop sync without `useEffect`, `&quot;` HTML entities for double quotes, and client-side canvas compression for local photo uploads).
* **Module Boundaries:** Maintain file placement rules within `src/modules/` as defined in the directory blueprint.
