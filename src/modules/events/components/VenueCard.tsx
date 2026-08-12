'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ArrowRight, Sparkles, Camera, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { EventVenue } from '@/modules/shared/types/database.types';
import { VenueImageLightboxModal } from './VenueImageLightboxModal';

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
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const images =
        venue.image_urls && venue.image_urls.length > 0
            ? venue.image_urls
            : ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80'];

    // Auto-slide carousel interval (3.5s)
    useEffect(() => {
        if (images.length <= 1 || isPaused || isLightboxOpen) return;

        const interval = setInterval(() => {
            setCurrentIdx((prev) => (prev + 1) % images.length);
        }, 3500);

        return () => clearInterval(interval);
    }, [images.length, isPaused, isLightboxOpen]);

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIdx((prev) => (prev + 1) % images.length);
    };

    const handleOpenLightbox = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLightboxOpen(true);
    };

    return (
        <>
            <div
                className={`group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 ease-out flex flex-col justify-between ${
                    isFeatured
                        ? 'shadow-lg sm:shadow-xl hover:shadow-2xl hover:-translate-y-1.5 ring-2 ring-amber-400/80'
                        : 'shadow-md hover:shadow-2xl hover:-translate-y-1.5 border-0'
                }`}
            >
                <div>
                    {/* Widescreen Image Container - Click to Enlarge */}
                    <div
                        onClick={handleOpenLightbox}
                        className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900 group/slider cursor-pointer"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        title="Click to enlarge photo"
                    >
                        {/* Ambient Background Depth */}
                        <div
                            className="absolute inset-0 bg-cover bg-center blur-xl opacity-35 scale-125 transition-all duration-700 pointer-events-none"
                            style={{ backgroundImage: `url(${images[currentIdx]})` }}
                        />

                        {/* Cross-Fading Images */}
                        {images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`${venue.name} photo ${idx + 1}`}
                                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                                    idx === currentIdx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
                                }`}
                            />
                        ))}

                        {/* Vignette Shadow */}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-stone-950/20 z-15 pointer-events-none" />

                        {/* Top Left: Premier Choice Ribbon */}
                        {isFeatured && (
                            <div className="absolute top-3 left-3 z-20 bg-amber-400 text-stone-950 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-stone-950" />
                                <span>Premier Choice</span>
                            </div>
                        )}

                        {/* Top Right: Capacity Badge */}
                        <div className="absolute top-3 right-3 z-20 bg-white/80 backdrop-blur-md border border-white/60 text-stone-900 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-amber-600" />
                            <span>Up to {venue.max_guest_capacity} Guests</span>
                        </div>

                        {/* Hover Expand Trigger Prompt */}
                        <div className="absolute inset-0 z-25 bg-emerald-950/30 backdrop-blur-[2px] opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="bg-white/90 backdrop-blur-md text-emerald-950 text-xs font-extrabold px-3.5 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition-transform duration-300 group-hover/slider:scale-105">
                <Maximize2 className="w-3.5 h-3.5 text-amber-700" />
                <span>Click to Enlarge</span>
              </span>
                        </div>

                        {/* Bottom Left: Photo Counter Badge */}
                        {images.length > 1 && (
                            <div className="absolute bottom-3 left-3 z-20 bg-stone-950/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <Camera className="w-3 h-3 text-amber-300" />
                                <span>{currentIdx + 1} / {images.length}</span>
                            </div>
                        )}

                        {/* Bottom Center: Slide Indicator Pills */}
                        {images.length > 1 && (
                            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setCurrentIdx(idx);
                                        }}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            idx === currentIdx
                                                ? 'w-5 bg-amber-400 shadow-sm'
                                                : 'w-1.5 bg-white/50 hover:bg-white/80'
                                        }`}
                                        title={`Photo ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Left/Right Carousel Arrow Controls */}
                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-stone-950/40 hover:bg-emerald-950/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300"
                                    title="Previous photo"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-stone-950/40 hover:bg-emerald-950/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300"
                                    title="Next photo"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </>
                        )}
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
              {venue.slot_duration_text || '/ 5-hr slot block'}
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

            {/* Enlarged Animated Photo Lightbox Modal */}
            <VenueImageLightboxModal
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                images={images}
                initialIndex={currentIdx}
                venueName={venue.name}
            />
        </>
    );
};