'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Filter, ArrowUpDown, Trees, Calendar, Loader2 } from 'lucide-react';
import { getVenues } from '@/modules/events/actions/venueActions';
import { EventVenue } from '@/modules/shared/types/database.types';
import { VenueCard } from '@/modules/events/components/VenueCard';

export default function VenuesDirectoryPage() {
    const [venues, setVenues] = useState<EventVenue[]>([]);
    const [isPending, startTransition] = useTransition();
    const [filterCategory, setFilterCategory] = useState<'all' | 'garden' | 'hall' | 'deck'>('all');
    const [sortBy, setSortBy] = useState<'recommended' | 'capacity_desc' | 'price_asc'>('recommended');

    useEffect(() => {
        startTransition(async () => {
            const res = await getVenues();
            if (res.success && res.data) {
                setVenues(res.data);
            }
        });
    }, []);

    // Filter & Sort Logic
    const filteredVenues = useMemo(() => {
        let result = [...venues];

        if (filterCategory === 'garden') {
            result = result.filter((v) => v.slug.includes('garden') || v.slug.includes('pavilion'));
        } else if (filterCategory === 'hall') {
            result = result.filter((v) => v.slug.includes('hall') || v.slug.includes('glass'));
        } else if (filterCategory === 'deck') {
            result = result.filter((v) => v.slug.includes('deck') || v.slug.includes('veranda'));
        }

        if (sortBy === 'capacity_desc') {
            result.sort((a, b) => b.max_guest_capacity - a.max_guest_capacity);
        } else if (sortBy === 'price_asc') {
            result.sort((a, b) => Number(a.base_rental_rate_php) - Number(b.base_rental_rate_php));
        }

        return result;
    }, [venues, filterCategory, sortBy]);

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-amber-200 selection:text-emerald-950 overflow-x-hidden w-full">
            {/* Sticky Header with Navigation */}
            <header className="sticky top-0 z-40 w-full bg-white/92 backdrop-blur-md border-b border-stone-200/80 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-stone-600 hover:text-emerald-950 font-bold text-xs sm:text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 text-emerald-800 shrink-0" />
                        <span>Back to Home</span>
                    </Link>

                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-900 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm">
                            <Trees className="w-4 h-4" />
                        </div>
                        <span className="font-serif font-bold text-sm text-emerald-950 hidden sm:inline">
              Regina’s Garden
            </span>
                    </Link>

                    <Link
                        href="/"
                        className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
                    >
                        <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span className="hidden sm:inline">Main Showcase</span>
                        <span className="sm:hidden">Home</span>
                    </Link>
                </div>
            </header>

            {/* Main Directory Body */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
                {/* Title */}
                <div className="space-y-2">
          <span className="text-emerald-800 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest block">
            DIRECTORY LISTING
          </span>
                    <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-stone-900">
                        Garden Pavilions & Function Halls
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
                        Select a venue space to inspect available 5-hour time blocks and configure catering packages.
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 mr-1">
                            <Filter className="w-3.5 h-3.5 text-emerald-800" />
                            <span>Spaces:</span>
                        </div>
                        {[
                            { id: 'all', label: 'All Spaces' },
                            { id: 'garden', label: 'Outdoor Garden' },
                            { id: 'hall', label: 'Indoor Glass Hall' },
                            { id: 'deck', label: 'Al Fresco Deck' },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setFilterCategory(cat.id as typeof filterCategory)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    filterCategory === cat.id
                                        ? 'bg-emerald-900 text-white shadow-sm'
                                        : 'bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort Selector */}
                    <div className="flex items-center gap-2 self-end md:self-auto text-xs font-bold text-stone-600">
                        <ArrowUpDown className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 focus:outline-none focus:border-emerald-800"
                        >
                            <option value="recommended">Recommended</option>
                            <option value="capacity_desc">Highest Capacity</option>
                            <option value="price_asc">Lowest Rental Rate</option>
                        </select>
                    </div>
                </div>

                {/* Directory Grid */}
                {isPending ? (
                    <div className="py-16 text-center text-stone-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-800" />
                        <span className="text-xs font-semibold">Loading venue catalog...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredVenues.map((venue, index) => (
                            <VenueCard key={venue.id} venue={venue} isFeatured={index === 0} showFullDescription={true} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}