import { notFound } from 'next/navigation';
import { supabase } from '@/modules/shared/utils/supabase';
import { getEventPackagesAndAddOns } from '@/modules/events/actions/venueActions';
import { EventVenue } from '@/modules/shared/types/database.types';
import { EventReservationFlow } from '@/modules/events/components/EventReservationFlow';

interface VenuePageProps {
    params: Promise<{ slug: string }>;
}

export default async function VenueBookingPage({ params }: VenuePageProps) {
    const { slug } = await params;

    // Fetch venue details by slug
    const { data: venueData, error } = await supabase
        .from('event_venues')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !venueData) {
        notFound();
    }

    const venue = venueData as EventVenue;

    // Fetch packages & add-ons catalog
    const catalogRes = await getEventPackagesAndAddOns();
    const packages = catalogRes.data?.packages || [];
    const addOns = catalogRes.data?.addOns || [];

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 py-12 px-4 md:px-6 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">
                <EventReservationFlow venue={venue} packages={packages} addOns={addOns} />
            </div>
        </div>
    );
}