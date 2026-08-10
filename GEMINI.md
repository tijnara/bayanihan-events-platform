# GEMINI.md - System Context & Development Guidelines

## 🎯 Domain Context & Critical Guardrails
This project is **Bayanihan Events Platform**, a high-concurrency venue reservation system customized specifically for **Regina’s Garden and Restaurant** (located at Maramba Blvd., Libsong West, Lingayen, Pangasinan).

> ⚠️ **STRICT DOMAIN BOUNDARY:**
> This is **NOT** a hotel or resort reservation system.
> * **DO NOT** use hotel/resort terminology such as "rooms", "beds", "nights", "check-in/check-out", or "room rates".
> * **ALWAYS** model operations using **Event Venues** (*Garden Pavilions, Glass Function Halls, Al Fresco Verandas*), **5-Hour Time Blocks** (*Morning/Lunch* vs. *Evening/Dinner* vs. *Whole Day*), **Occasion Types** (*18th Debuts, Garden Weddings, Baptismal Receptions, Family Reunions, Corporate/LGU Seminars*), **In-House Catering Headcounts**, **Sounds & Lights Styling**, and **Local Downpayment Rules**.
> * **BRAND TAGLINE:** *“It’s not a celebration, unless it’s Regina’s.”*

---

## 🎨 Design System & Theme Tokens (Regina's Garden Branding)

### 1. Color Palette & Motifs
* **Primary Brand Green:** Deep Forest / Emerald Green (`#022c22` / `emerald-950`, `#064e3b` / `emerald-900`, `#065f46` / `emerald-800`). Used for primary headers, navigation bars, and primary CTA triggers.
* **Secondary Champagne Gold:** Warm Metallic & Champagne Gold (`#fde68a` / `amber-200`, `#fbbf24` / `amber-400`, `#d97706` / `amber-600`). Used for capacity badges, price tags, and active step highlight rings.
* **Warm Neutral Backgrounds:** Clean Off-White & Warm Stone (`#fafaf9` / `stone-50`, `#ffffff` / `white`, `#f5f5f4` / `stone-100`). Ensures visual elegance and readability across garden event photography.

### 2. Typography Dual System
* **Header Font (Serif):** `Playfair Display` (`font-serif`) — Captures the sophisticated, celebratory tone of debuts, weddings, and banquets.
* **Body Font (Sans-Serif):** `Inter` (`font-sans`) — Provides high legibility for descriptions, forms, catering menus, and checkout line items.

---

## 🛠️ Stack Architecture

* **Framework:** Next.js 15+ / 16 (App Router with Turbopack), React 19, TypeScript
* **Styling & Fonts:** Tailwind CSS v4 (`@import "tailwindcss";`), Google Fonts (`Playfair_Display`, `Inter`), Lucide React
* **Backend & Database:** Supabase PostgreSQL, Stored Procedures, Service Role SDK, Realtime WebSockets
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
            └── supabase.ts
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

### 3. Concurrency Locking Mechanics
* Slot holds are governed by the atomic PostgreSQL stored procedure:
  ```sql
  public.hold_event_slot(p_venue_id UUID, p_event_date DATE, p_slot_block venue_slot_block, p_session_id TEXT)
  ```

---

## 📐 Coding Standards & Guidelines

### 1. Strict TypeScript Rules
* All database entities, form payloads, and Server Action responses must be explicitly typed in `src/modules/shared/types/database.types.ts`.
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

// ALWAYS use <T void> syntax with the '=' sign
export interface ServerActionResponse<T = void> {
  success: boolean;
  message?: string;
  data?: T;
}
```

### 2. UI & Component Standards
* **Tailwind v4 Rule:** Use `@import "tailwindcss";` in `src/app/globals.css`. Do not use deprecated v3 `@tailwind base;` directives.
* **Theme Styling:** Use warm stone backgrounds (`bg-stone-50`, `bg-white`), forest green buttons (`bg-emerald-900`, `hover:bg-emerald-950`), and champagne gold accents (`text-amber-600`, `bg-amber-100`).
* **Component Boundaries:** Modals belong in `src/modules/admin/components/modals/`, tab layouts in `src/modules/admin/components/tabs/`.
* **State & Feedback:** Asynchronous submissions must display explicit loading indicators (`Loader2`), disable submit triggers during execution, and render feedback alerts on error or success.
* **Maintenance Logic:** Public views call `getVenues()` (filtering out `is_under_maintenance: true`). Admin dashboards call `getVenues(true)` to display maintenance status badges.

### 3. Server Actions Protocol
* Every Server Action must return a strongly-typed `ServerActionResponse<T>` object.
* Always trigger `revalidatePath()` on modified paths (`/admin`, `/venues`) upon database mutations.

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { ServerActionResponse, EventVenue } from '@/modules/shared/types/database.types';

export async function toggleVenueMaintenance(
        venueId: string,
        isUnderMaintenance: boolean
): Promise<ServerActionResponse<EventVenue>> {
  try {
    // Supabase mutation logic...
    revalidatePath('/admin');
    revalidatePath('/venues');
    return { success: true, message: 'Venue maintenance state updated.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed.';
    return { success: false, message };
  }
}
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
* **Module Boundaries:** Maintain file placement rules within `src/modules/` as defined in the directory blueprint.