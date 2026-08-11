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
  * Tagline quote typography uses balanced inline quotation styling to prevent text crowding.
  * Supports dynamic badge text and event-themed Lucide badge icons (*Sparkles, PartyPopper, Trees, Heart, Crown, Calendar, Utensils, Music, Flower2, Building2, Star*) mapped via `BADGE_ICON_MAP`.
  * Includes a social proof trust bar (*"4.9★ Rated Venue"*, *"100% In-House Buffet Catering"*, *"1,200+ Celebrations Hosted"*).
  * Feature cards double as equal-height flex containers with uniform font weights and welcoming phrasing (*"Flexible Payments"*).
  * Replaces upper-right directory links with a prominent, centered action button (`View Full Venue Directory →`) below the venue selection grid.
* **Venues Directory Listing (`src/app/(public)/venues/page.tsx`):**
  * Includes a sticky navigation bar with a clear `← Back to Home` action link.
  * Features interactive category filter pills (*All Spaces, Outdoor Garden, Indoor Glass Hall, Al Fresco Deck*) and a dynamic sort selector (*Recommended, Highest Capacity, Lowest Rental Rate*).
* **Venue Cards (`src/modules/events/components/VenueCard.tsx`):**
  * Borderless white cards backed by soft drop shadows (`shadow-md hover:shadow-2xl hover:-translate-y-1.5`).
  * Uniform `aspect-[16/10]` widescreen image frames with scale-up hover transitions (`group-hover:scale-105`) and error-safe image fallback handlers.
  * Translucent backdrop-blur capacity badges (`bg-white/80 backdrop-blur-md`).
  * Supports full description rendering for directory views and flex-centered action rows where pricing blocks and *"Book Venue"* buttons align on the exact vertical center axis.
* **Interactive Step Wizard (`src/modules/events/components/EventReservationFlow.tsx`):**
  * **Explicit Active Slot Visibility:** Selected slot cards feature an explicit checkmark (`CheckCircle2`), bold green border (`border-2 border-emerald-800`), light green background tint (`bg-emerald-50/90`), and a `"SELECTED"` badge.
  * **Header & Navigation Controls:** Moves the `← Back to Venues Directory` link outside the header container to prevent squeezed button layouts on mobile screens. Features dedicated **Cancel Draft** actions.
  * **Cancellation Safety Modal:** Clicking cancel opens a responsive popup (`AlertTriangle` modal) prompting the user to confirm cancellation before releasing slot holds and redirecting to `/venues`.
  * **High-Contrast Step Indicators:** Step buttons (`1. Date & Time`, `2. Catering`, `3. Checkout`) use high-contrast typography and indicators across mobile devices.
  * **Sticky Financial Sidebar:** Mobile-first calculator sidebar (`lg:sticky lg:top-24`) dynamically calculates total cost, 30% required deposit, and remaining balance.
* **Responsive Admin Portal & Site Content Management (`src/app/admin/page.tsx`):**
  * **Hero Content & Branding Tab (`HeroSettingsTab.tsx`):** Grants staff real-time control over top announcement banners, business names, navigation labels, headlines, CTA button text, and hero season badge icon dropdown selectors with live previews.
  * **Auto-Stacking Stat Cards:** Summary cards stack vertically on mobile screens (`grid-cols-1 sm:grid-cols-3`).
  * **Horizontal Scroll Menu:** Tab navigation features overflow scrolling (`overflow-x-auto whitespace-nowrap`).
  * **Mobile-Safe Data Tables (`BookingsTab.tsx`):** Data tables are wrapped in horizontal scroll containers (`overflow-x-auto min-w-[640px]`) to maintain legibility on narrow screens.
  * **Bounded Review Modal (`VerifyReceiptModal.tsx`):** Modal viewport is constrained (`max-h-[92vh] overflow-y-auto`) to ensure action buttons are reachable on mobile screens.

---

## 🛠️ Stack Architecture

* **Framework:** Next.js 15+ / 16 (App Router with Turbopack), React 19, TypeScript
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
    │       └── VenueGrid.tsx
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

* `public.event_venues`: Base spaces (*Regina's Main Garden Pavilion*, *Grand Glass Function Hall*, *Veranda Al Fresco Deck*), capacity, rental rates, maintenance status (`is_under_maintenance`).
* `public.event_packages`: In-house buffet bundles (*Classic Garden Feast*, *Royal Garden Grand Celebration*), headcount, sounds/lights, stage backdrop inclusions.
* `public.event_add_ons`: Optional extras (*Live Lechon Carving Station*, *Pangasinan Seafood Special Bar*, *360 Photo Booth*).
* `public.event_slot_holds`: 10-to-15 minute temporary reservation locks with `expires_at` TTL.
* `public.event_bookings`: Permanent bookings (`EVT-YYYY-XXXX` ID format) tracking 30% / ₱5,000 downpayment calculations.
* `public.site_settings`: Single-row (`id = 1`) configuration storing dynamic homepage labels, text headlines, CTAs, and badge icons.

```sql
-- Create site_settings table for dynamic landing page content
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- Seed initial default settings row
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Grant public read access
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to site_settings" ON public.site_settings FOR SELECT USING (true);

-- Ensure badge icon column exists
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS hero_season_badge_icon TEXT NOT NULL DEFAULT 'Sparkles';

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
  is_under_maintenance: boolean;
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
  updated_at?: string;
}

// ALWAYS use <T void> syntax with the '=' sign
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
* Use `supabaseAdmin` for admin actions to bypass RLS when querying all bookings or modifying `site_settings`.
* Always trigger `revalidatePath()` on modified paths (`/`, `/admin`, `/venues`) upon database mutations.

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/modules/shared/utils/supabaseAdmin';
import { ServerActionResponse, SiteSettings } from '@/modules/shared/types/database.types';

export async function updateSiteSettings(
  payload: Partial<SiteSettings>
): Promise<ServerActionResponse<SiteSettings>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, message: 'Website content updated successfully!', data: data as SiteSettings };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed.';
    return { success: false, message };
  }
}

```

### 4. IDE & Linter Warning Prevention Rules

#### 4.1 Avoiding Tailwind CSS Conflict Warnings in JetBrains IDEs (WebStorm / PyCharm)

* **Problem:** WebStorm flags CSS warnings like `'border-stone-300' applies the same CSS properties as 'focus:border-emerald-800'`.
* **Prevention Rule:** Avoid stacking redundant border classes or conflicting static/focus border utilities on the same element. Instead of combining static `border-stone-300` with `focus:border-emerald-800`, use focus ring utilities (`focus:outline-none focus:ring-2 focus:ring-emerald-800/20`) or ensure focus state overrides are isolated properly:
```tsx
// ✅ RECOMMENDED: Focus rings avoid border property collision warnings
className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"

```



#### 4.2 Avoiding React 19 / TypeScript Deprecation Warnings (`TS6385: 'FormEvent' is deprecated`)

* **Problem:** React 19 / modern `@types/react` marks raw `FormEvent` or deprecated event imports as warning triggers when improperly parameterized.
* **Prevention Rule:** Always use explicitly parameterized `React.FormEvent<HTMLFormElement>` on form submission handlers, or type native submission events cleanly. Never import raw unparameterized `FormEvent`:
```tsx
// ✅ RECOMMENDED: Explicitly type form submit handlers with HTMLFormElement
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // handler logic
};

```



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
* **Zero Deprecation & Warning Policy:** Ensure all code snippets comply with Rule 4 (using `React.FormEvent<HTMLFormElement>` and clean Tailwind focus ring classes to eliminate IDE/linter warnings).
* **Module Boundaries:** Maintain file placement rules within `src/modules/` as defined in the directory blueprint.

```

```