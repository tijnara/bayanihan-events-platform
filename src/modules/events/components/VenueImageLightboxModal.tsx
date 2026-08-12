'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Camera, Sparkles, Trees } from 'lucide-react';

interface VenueImageLightboxModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    initialIndex?: number;
    venueName: string;
}

export const VenueImageLightboxModal: React.FC<VenueImageLightboxModalProps> = ({
                                                                                    isOpen,
                                                                                    onClose,
                                                                                    images,
                                                                                    initialIndex = 0,
                                                                                    venueName,
                                                                                }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    // Render-phase state adjustment (prevents react-hooks/set-state-in-effect)
    if (initialIndex !== prevInitialIndex || isOpen !== prevIsOpen) {
        setPrevInitialIndex(initialIndex);
        setPrevIsOpen(isOpen);
        setCurrentIndex(initialIndex);
    }

    const handlePrev = useCallback(
        (e?: React.MouseEvent) => {
            e?.stopPropagation();
            if (images.length <= 1) return;
            setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        },
        [images.length]
    );

    const handleNext = useCallback(
        (e?: React.MouseEvent) => {
            e?.stopPropagation();
            if (images.length <= 1) return;
            setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        },
        [images.length]
    );

    // Keyboard Navigation Support
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, handlePrev, handleNext]);

    if (!isOpen || images.length === 0) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-stone-950/92 backdrop-blur-md flex flex-col justify-between items-center p-3 sm:p-6 transition-all duration-300 font-sans select-none overflow-hidden"
            onClick={onClose}
        >
            {/* Ambient Lighting Depth Blur Background */}
            <div
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110 pointer-events-none transition-all duration-700"
                style={{ backgroundImage: `url(${images[currentIndex]})` }}
            />

            {/* Lightbox Header Bar */}
            <div
                className="relative z-20 w-full max-w-6xl flex items-center justify-between text-white border-b border-white/10 pb-3"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-900 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm">
                        <Trees className="w-4 h-4" />
                    </div>
                    <div>
            <span className="text-amber-300 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest block">
              VENUE SHOWCASE GALLERY
            </span>
                        <h3 className="font-serif text-base sm:text-xl font-bold text-white leading-none">
                            {venueName}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <Camera className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {currentIndex + 1} of {images.length} Photos
            </span>
          </span>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
                        title="Close Lightbox (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Image Showcase Stage */}
            <div
                className="relative z-10 my-auto w-full max-w-5xl h-[55vh] sm:h-[68vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Animated Image Frame */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-stone-900/80">
                    {images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt={`${venueName} preview ${idx + 1}`}
                            className={`absolute max-w-full max-h-full object-contain transition-all duration-500 ease-out ${
                                idx === currentIndex
                                    ? 'opacity-100 scale-100 translate-x-0'
                                    : idx < currentIndex
                                        ? 'opacity-0 scale-95 -translate-x-12'
                                        : 'opacity-0 scale-95 translate-x-12'
                            }`}
                        />
                    ))}

                    {/* Left Arrow Button */}
                    {images.length > 1 && (
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-950/60 hover:bg-emerald-900 border border-white/20 text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
                            title="Previous Photo (←)"
                        >
                            <ChevronLeft className="w-6 h-6 text-amber-300" />
                        </button>
                    )}

                    {/* Right Arrow Button */}
                    {images.length > 1 && (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-950/60 hover:bg-emerald-900 border border-white/20 text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
                            title="Next Photo (→)"
                        >
                            <ChevronRight className="w-6 h-6 text-amber-300" />
                        </button>
                    )}
                </div>
            </div>

            {/* Lightbox Footer & Thumbnail Strip */}
            <div
                className="relative z-20 w-full max-w-4xl flex flex-col items-center gap-3 border-t border-white/10 pt-3"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Interactive Thumbnail Gallery */}
                {images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-2 no-scrollbar">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentIndex(idx)}
                                className={`relative aspect-[4/3] w-14 sm:w-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                                    idx === currentIndex
                                        ? 'border-amber-400 scale-105 shadow-md ring-2 ring-amber-400/40'
                                        : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/60'
                                }`}
                            >
                                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Click outside or press ESC to exit enlarged view</span>
                </div>
            </div>
        </div>
    );
};