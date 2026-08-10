import React from 'react';
import Link from 'next/link';
import { Users, Sparkles, ArrowRight } from 'lucide-react';
import { EventVenue } from '@/modules/shared/types/database.types';

interface VenueCardProps {
    venue: EventVenue;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue }) => {
    return (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
            {/* Image Banner */}
            <div className="relative h-60 w-full bg-stone-100 overflow-hidden">
                {venue.image_urls && venue.image_urls.length > 0 ? (
                    <img
                        src={venue.image_urls[0]}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                        <Sparkles className="w-10 h-10 opacity-30 text-emerald-800" />
                    </div>
                )}
                <div className="absolute top-3 right-3 bg-amber-100/90 backdrop-blur-md px-3 py-1 rounded-full border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    <Users className="w-3.5 h-3.5 text-amber-700" />
                    <span>Up to {venue.max_guest_capacity} Guests</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                    <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-emerald-900 transition-colors">
                        {venue.name}
                    </h3>
                    <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                        {venue.description || 'Lush venue space equipped for garden receptions, debuts, and family gatherings.'}
                    </p>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
              Base Space Rental
            </span>
                        <span className="text-lg font-serif font-bold text-emerald-900">
              ₱{Number(venue.base_rental_rate_php).toLocaleString()}
            </span>
                        <span className="text-[11px] text-stone-500 font-normal"> / 5-hr block</span>
                    </div>

                    <Link
                        href={`/venues/${venue.slug}`}
                        className="bg-emerald-900 hover:bg-emerald-950 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5"
                    >
                        <span>Book Venue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
};