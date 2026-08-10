import { getVenues } from '@/modules/events/actions/venueActions';
import { VenueGrid } from '@/modules/events/components/VenueGrid';

export default async function VenuesDirectoryPage() {
    const res = await getVenues();
    const venues = res.data || [];

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 py-16 px-6 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
          <span className="text-emerald-800 text-xs font-bold uppercase tracking-widest block mb-1">
            Directory Listing
          </span>
                    <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
                        Garden Pavilions & Function Halls
                    </h1>
                    <p className="text-xs text-stone-500 mt-2">
                        Select a venue space to inspect available 5-hour time blocks and configure catering packages.
                    </p>
                </div>

                <VenueGrid venues={venues} />
            </div>
        </div>
    );
}