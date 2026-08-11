'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/modules/shared/utils/supabaseAdmin';
import {
    EventBookingRecord,
    EventBookingStatus,
    EventVenue,
    ServerActionResponse,
    SiteSettings,
} from '@/modules/shared/types/database.types';

/**
 * Fetches all event bookings for admin oversight (bypasses RLS).
 */
export async function getBookings(): Promise<ServerActionResponse<EventBookingRecord[]>> {
    try {
        const { data, error } = await supabaseAdmin
            .from('event_bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        return { success: true, data: data as EventBookingRecord[] };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch bookings.';
        return { success: false, message };
    }
}

/**
 * Updates a booking's status (e.g., from 'pending_deposit' to 'confirmed' or 'cancelled').
 */
export async function updateBookingStatus(
    bookingId: string,
    status: EventBookingStatus
): Promise<ServerActionResponse<EventBookingRecord>> {
    try {
        const { data, error } = await supabaseAdmin
            .from('event_bookings')
            .update({ status })
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        revalidatePath('/admin');
        revalidatePath('/venues');

        return {
            success: true,
            message: `Booking ${bookingId} status updated to ${status.replace('_', ' ').toUpperCase()}.`,
            data: data as EventBookingRecord,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update booking status.';
        return { success: false, message };
    }
}

/**
 * Toggles maintenance status for a venue pavilion or function hall.
 */
export async function toggleVenueMaintenance(
    venueId: string,
    isUnderMaintenance: boolean
): Promise<ServerActionResponse<EventVenue>> {
    try {
        const { data, error } = await supabaseAdmin
            .from('event_venues')
            .update({ is_under_maintenance: isUnderMaintenance })
            .eq('id', venueId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        revalidatePath('/admin');
        revalidatePath('/venues');

        return {
            success: true,
            message: `Venue maintenance status updated.`,
            data: data as EventVenue,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update venue maintenance state.';
        return { success: false, message };
    }
}

/**
 * Fetches dynamic landing page settings.
 */
export async function getSiteSettings(): Promise<ServerActionResponse<SiteSettings>> {
    try {
        const { data, error } = await supabaseAdmin
            .from('site_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) throw new Error(error.message);

        return { success: true, data: data as SiteSettings };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch site settings.';
        return { success: false, message };
    }
}

/**
 * Updates site settings from the Admin Dashboard.
 */
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

        return {
            success: true,
            message: 'Website content updated successfully!',
            data: data as SiteSettings,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update site settings.';
        return { success: false, message };
    }
}