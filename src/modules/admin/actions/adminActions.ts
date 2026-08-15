'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/modules/shared/utils/supabaseAdmin';
import {
    AppRole,
    EventBookingRecord,
    EventBookingStatus,
    EventVenue,
    ServerActionResponse,
    SiteSettings,
    UserProfile,
} from '@/modules/shared/types/database.types';

/**
 * Fetches all registered system users (Admins, Managers, Staff).
 */
export async function getUsers(): Promise<ServerActionResponse<UserProfile[]>> {
    try {
        const { data, error } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        return { success: true, data: data as UserProfile[] };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch user accounts.';
        return { success: false, message };
    }
}

/**
 * Creates a new portal user account with designated AppRole.
 */
export async function createUserAccount(
    fullName: string,
    email: string,
    pass: string,
    role: AppRole
): Promise<ServerActionResponse<UserProfile>> {
    try {
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: pass,
            email_confirm: true,
            user_metadata: { full_name: fullName, role },
        });

        if (authError || !authUser.user) throw new Error(authError?.message || 'Failed to create Auth user.');

        const { data: profile, error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .upsert({
                id: authUser.user.id,
                full_name: fullName,
                email,
                role,
            })
            .select()
            .single();

        if (profileError) throw new Error(profileError.message);

        revalidatePath('/admin');

        return {
            success: true,
            message: `Account for ${fullName} (${role.toUpperCase()}) created successfully!`,
            data: profile as UserProfile,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create user account.';
        return { success: false, message };
    }
}

/**
 * Updates an existing user's system role (Admin, Manager, Staff).
 */
export async function updateUserRole(
    userId: string,
    newRole: AppRole
): Promise<ServerActionResponse<UserProfile>> {
    try {
        const { data, error } = await supabaseAdmin
            .from('user_profiles')
            .update({ role: newRole })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        revalidatePath('/admin');

        return {
            success: true,
            message: `User role updated to ${newRole.toUpperCase()}.`,
            data: data as UserProfile,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update user role.';
        return { success: false, message };
    }
}

/**
 * Deletes a user account from Auth and User Profiles.
 */
export async function deleteUserAccount(userId: string): Promise<ServerActionResponse> {
    try {
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) throw new Error(authError.message);

        revalidatePath('/admin');

        return {
            success: true,
            message: 'User account removed successfully.',
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete user account.';
        return { success: false, message };
    }
}

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
 * Updates a booking's status.
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
 * Toggles maintenance/active status for a venue pavilion or function hall.
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

        revalidatePath('/');
        revalidatePath('/admin');
        revalidatePath('/venues');

        return {
            success: true,
            message: `Venue state updated.`,
            data: data as EventVenue,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update venue state.';
        return { success: false, message };
    }
}

/**
 * Sets or unsets a venue as 'Premier Choice' (featured space).
 */
export async function toggleFeaturedVenue(
    venueId: string,
    shouldFeature: boolean
): Promise<ServerActionResponse<EventVenue>> {
    try {
        if (shouldFeature) {
            const { error: resetError } = await supabaseAdmin
                .from('event_venues')
                .update({ is_featured: false })
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (resetError) throw new Error(resetError.message);

            const { data, error } = await supabaseAdmin
                .from('event_venues')
                .update({ is_featured: true })
                .eq('id', venueId)
                .select()
                .single();

            if (error) throw new Error(error.message);

            revalidatePath('/');
            revalidatePath('/admin');
            revalidatePath('/venues');

            return {
                success: true,
                message: `${data.name} is now set as Premier Choice!`,
                data: data as EventVenue,
            };
        } else {
            const { data, error } = await supabaseAdmin
                .from('event_venues')
                .update({ is_featured: false })
                .eq('id', venueId)
                .select()
                .single();

            if (error) throw new Error(error.message);

            revalidatePath('/');
            revalidatePath('/admin');
            revalidatePath('/venues');

            return {
                success: true,
                message: `Premier Choice badge removed from ${data.name}.`,
                data: data as EventVenue,
            };
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update Premier Choice state.';
        return { success: false, message };
    }
}

/**
 * Updates full venue details.
 */
export async function updateVenueDetails(
    venueId: string,
    payload: Partial<EventVenue>
): Promise<ServerActionResponse<EventVenue>> {
    try {
        const { data, error } = await supabaseAdmin
            .from('event_venues')
            .update(payload)
            .eq('id', venueId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        revalidatePath('/');
        revalidatePath('/admin');
        revalidatePath('/venues');

        return {
            success: true,
            message: `${data.name} details updated successfully!`,
            data: data as EventVenue,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update venue details.';
        return { success: false, message };
    }
}

/**
 * Creates a new venue space.
 */
export async function createVenue(
    payload: Omit<EventVenue, 'id' | 'created_at'>
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