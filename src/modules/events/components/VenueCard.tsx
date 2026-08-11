'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, ArrowRight, Sparkles } from 'lucide-react';
import { EventVenue } from '@/modules/shared/types/database.types';

interface VenueCardProps {
    venue: EventVenue;
    isFeatured?: boolean;
    showFullDescription?: boolean;
}

export const VenueCard: React.FC<VenueCardProps> = ({
                                                        venue,
                                                        isFeatured = false,
                                                        showFullDescription = false,
                                                    }) => {
    const [imgError, setImgError] = useState(false);

    const primaryImage =
        !imgError && venue.image_urls && venue.image_urls.length > 0
            ? venue.image_urls[0]
            : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80';

    return (
        <div
            className={`group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 ease-out flex flex-col justify-between ${
                isFeatured
                    ? 'shadow-lg sm:shadow-xl hover:shadow-2xl hover:-translate-y-1.5 ring-2 ring-amber-400/80'
                    : 'shadow-md hover:shadow-2xl hover:-translate-y-1.5 border-0'
            }`}
        >
            {/* Featured Ribbon */}
            {isFeatured && (
                <div className="absolute top-3 left-3 z-20 bg-amber-400 text-stone-950 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-stone-950" />
                    <span>Premier Choice</span>
                </div>
            )}

            <div>
                {/* Uniform 16:10 Widescreen Aspect Ratio */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                    <img
                        src={primaryImage}
                        alt={venue.name}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Translucent Capacity Badge */}
                    <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md border border-white/60 text-stone-900 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        <span>Up to {venue.max_guest_capacity} Guests</span>
                    </div>
                </div>

                {/* Description Container */}
                <div className="p-5 sm:p-6 space-y-2 sm:space-y-2.5">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 group-hover:text-emerald-900 transition-colors">
                        {venue.name}
                    </h3>
                    <p
                        className={`text-xs text-stone-600 leading-relaxed ${
                            showFullDescription ? 'min-h-[2.5rem]' : 'line-clamp-2 min-h-[2.5rem]'
                        }`}
                    >
                        {venue.description ||
                            'Lush garden venue space equipped for formal receptions, debuts, and family gatherings.'}
                    </p>
                </div>
            </div>

            {/* Action Row */}
            <div className="p-5 sm:p-6 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
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
                    className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-5 py-3 rounded-xl sm:rounded-2xl text-xs transition-all duration-300 shadow-md hover:shadow-emerald-900/20 flex items-center justify-center gap-2 group/btn shrink-0"
                >
                    <span>Book Venue</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1 text-amber-300" />
                </Link>
            </div>
        </div>
    );
};