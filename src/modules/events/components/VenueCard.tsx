'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, ArrowRight, Sparkles } from 'lucide-react';
import { EventVenue } from '@/modules/shared/types/database.types';

interface VenueCardProps {
    venue: EventVenue;
    isFeatured?: boolean;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue, isFeatured = false }) => {
    const [imgError, setImgError] = useState(false);

    const primaryImage =
        !imgError && venue.image_urls && venue.image_urls.length > 0
            ? venue.image_urls[0]
            : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80';

    return (
        <div
            className={`group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                isFeatured
                    ? 'shadow-lg sm:shadow-xl hover:shadow-2xl ring-2 ring-amber-400/60'
                    : 'shadow-md hover:shadow-xl border-0'
            }`}
        >
            {/* Featured Ribbon */}
            {isFeatured && (
                <div className="absolute top-3 left-3 z-20 bg-amber-400 text-stone-950 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-stone-950" />
                    <span>Premier Choice</span>
                </div>
            )}

            <div>
                {/* Uniform Widescreen Aspect Ratio */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                    <img
                        src={primaryImage}
                        alt={venue.name}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Glassmorphic Capacity Badge */}
                    <div className="absolute top-3 right-3 bg-white/85 backdrop-blur-md border border-white/50 text-stone-900 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        <span>Up to {venue.max_guest_capacity} Guests</span>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-5 sm:p-6 space-y-2 sm:space-y-3">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 group-hover:text-emerald-900 transition-colors">
                        {venue.name}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                        {venue.description || 'Lush garden venue space equipped for formal receptions, debuts, and family gatherings.'}
                    </p>
                </div>
            </div>

            {/* Pricing & Full-Width Touch Button on Mobile */}
            <div className="p-5 sm:p-6 pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div className="space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 block">
            Base Space Rental
          </span>
                    <p className="font-serif font-extrabold text-xl sm:text-2xl text-stone-950 leading-none">
                        ₱{Number(venue.base_rental_rate_php).toLocaleString()}
                    </p>
                    <span className="text-[11px] font-medium text-stone-500 block pt-0.5">
            / 5-hr slot block
          </span>
                </div>

                <Link
                    href={`/venues/${venue.slug}`}
                    className="w-full sm:w-auto bg-emerald-900 hover:bg-amber-400 hover:text-stone-950 text-white font-bold px-4 py-3 rounded-xl sm:rounded-2xl text-xs transition-all duration-300 shadow-md flex items-center justify-center gap-2 group/btn shrink-0"
                >
                    <span>Book Venue</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                </Link>
            </div>
        </div>
    );
};