import React from 'react';
import { EventVenue } from '@/modules/shared/types/database.types';
import { VenueCard } from './VenueCard';

interface VenueGridProps {
    venues: EventVenue[];
}

export const VenueGrid: React.FC<VenueGridProps> = ({ venues }) => {
    if (venues.length === 0) {
        return (
            <div className="text-center py-16 bg-white border border-stone-200 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
                <p className="text-stone-500 text-sm font-sans">
                    No venue spaces currently available for online booking.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.map((venue, index) => (
                <VenueCard key={venue.id} venue={venue} isFeatured={index === 0} />
            ))}
        </div>
    );
};