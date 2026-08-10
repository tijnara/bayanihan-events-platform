'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/modules/shared/utils/supabase';
import {
    EventAddOn,
    EventBookingPayload,
    EventBookingRecord,
    EventPackage,
    EventVenue,
    ServerActionResponse,
    SlotBlockAvailability,
    VenueSlotBlock,
} from '@/modules/shared/types/database.types';

/**
 * Fetches all active event venues for the public directory.
 */
export async function getVenues(
    includeMaintenance = false
): Promise<ServerActionResponse<EventVenue[]>> {
    try {
        let query = supabase.from('event_venues').select('*').order('created_at', { ascending: false });

        if (!includeMaintenance) {
            query = query.eq('is_under_maintenance', false);
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);

        return { success: true, data: data as EventVenue[] };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch event venues.';
        return { success: false, message };
    }
}

/**
 * Fetches available event packages and optional add-ons for booking calculations.
 */
export async function getEventPackagesAndAddOns(): Promise<
    ServerActionResponse<{ packages: EventPackage[]; addOns: EventAddOn[] }>
> {
    try {
        const [packagesRes, addOnsRes] = await Promise.all([
            supabase.from('event_packages').select('*').order('price_php', { ascending: true }),
            supabase.from('event_add_ons').select('*').order('price_php', { ascending: true }),
        ]);

        if (packagesRes.error) throw new Error(packagesRes.error.message);
        if (addOnsRes.error) throw new Error(addOnsRes.error.message);

        return {
            success: true,
            data: {
                packages: packagesRes.data as EventPackage[],
                addOns: addOnsRes.data as EventAddOn[],
            },
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch catalog packages.';
        return { success: false, message };
    }
}

/**
 * Evaluates morning, evening, and full-day time block availability for a specific date.
 */
export async function getVenueSlotAvailabilities(
    venueId: string,
    eventDate: string
): Promise<ServerActionResponse<SlotBlockAvailability[]>> {
    try {
        const nowIso = new Date().toISOString();

        // 1. Query permanent bookings
        const { data: bookings, error: bookingErr } = await supabase
            .from('event_bookings')
            .select('slot_block')
            .eq('venue_id', venueId)
            .eq('event_date', eventDate)
            .neq('status', 'cancelled');

        if (bookingErr) throw new Error(bookingErr.message);

        // 2. Query active slot holds (expires_at > now)
        const { data: holds, error: holdErr } = await supabase
            .from('event_slot_holds')
            .select('slot_block, expires_at')
            .eq('venue_id', venueId)
            .eq('event_date', eventDate)
            .gt('expires_at', nowIso);

        if (holdErr) throw new Error(holdErr.message);

        // Explicitly typed sets and maps to resolve TS7006 and TS2322
        const typedBookings = (bookings || []) as Array<{ slot_block: VenueSlotBlock }>;
        const typedHolds = (holds || []) as Array<{ slot_block: VenueSlotBlock; expires_at: string }>;

        const bookedBlocks = new Set<VenueSlotBlock>(typedBookings.map((b) => b.slot_block));
        const heldBlocksMap = new Map<VenueSlotBlock, string>(
            typedHolds.map((h) => [h.slot_block, h.expires_at])
        );

        const defaultSlots: { block: VenueSlotBlock; label: string; time: string; baseMultiplier: number }[] = [
            { block: 'morning_lunch', label: 'Morning / Lunch Slot', time: '9:00 AM – 2:00 PM', baseMultiplier: 1.0 },
            { block: 'evening_dinner', label: 'Evening / Dinner Slot', time: '5:00 PM – 10:00 PM', baseMultiplier: 1.2 },
            { block: 'whole_day', label: 'Whole Day Exclusive Access', time: '9:00 AM – 10:00 PM', baseMultiplier: 1.8 },
        ];

        // Fetch base rental rate for calculation
        const { data: venue } = await supabase
            .from('event_venues')
            .select('base_rental_rate_php')
            .eq('id', venueId)
            .single();

        const baseRate = venue?.base_rental_rate_php || 25000;

        const slots: SlotBlockAvailability[] = defaultSlots.map((item) => {
            let status: 'available' | 'held' | 'booked' = 'available';
            let held_expires_at: string | undefined = undefined;

            if (bookedBlocks.has(item.block)) {
                status = 'booked';
            } else if (heldBlocksMap.has(item.block)) {
                status = 'held';
                held_expires_at = heldBlocksMap.get(item.block);
            }

            return {
                slot_block: item.block,
                label: item.label,
                time_range: item.time,
                price_php: Math.round(baseRate * item.baseMultiplier),
                status,
                held_expires_at,
            };
        });

        return { success: true, data: slots };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to query slot blocks.';
        return { success: false, message };
    }
}

/**
 * Executes the PostgreSQL atomic stored procedure `hold_event_slot()` to acquire a 15-minute lock.
 */
export async function createEventSlotHold(
    venueId: string,
    eventDate: string,
    slotBlock: VenueSlotBlock,
    sessionId: string
): Promise<ServerActionResponse<{ expiresAt: string }>> {
    try {
        const { data, error } = await supabase.rpc('hold_event_slot', {
            p_venue_id: venueId,
            p_event_date: eventDate,
            p_slot_block: slotBlock,
            p_session_id: sessionId,
        });

        if (error) throw new Error(error.message);

        if (!data.success) {
            return { success: false, message: data.message };
        }

        return {
            success: true,
            message: data.message,
            data: { expiresAt: data.expires_at },
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to lock slot.';
        return { success: false, message };
    }
}

/**
 * Creates a permanent reservation draft and calculates downpayment tracking.
 */
export async function confirmEventBooking(
    payload: EventBookingPayload
): Promise<ServerActionResponse<EventBookingRecord>> {
    try {
        const generatedId = `EVT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const bookingData: EventBookingRecord = {
            ...payload,
            id: generatedId,
            status: 'pending_deposit',
            created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('event_bookings').insert([bookingData]);

        if (error) throw new Error(error.message);

        revalidatePath('/admin');
        revalidatePath('/venues');

        return {
            success: true,
            message: 'Venue reservation draft created! Please submit your downpayment receipt within 24 hours.',
            data: bookingData,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to submit reservation.';
        return { success: false, message };
    }
}