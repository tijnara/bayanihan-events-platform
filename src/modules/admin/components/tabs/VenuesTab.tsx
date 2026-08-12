'use client';

import React, { useTransition, useState } from 'react';
import { EventVenue } from '@/modules/shared/types/database.types';
import { toggleVenueMaintenance, toggleFeaturedVenue } from '../../actions/adminActions';
import { Sparkles, Power, Loader2, CheckCircle2, AlertCircle, Users, XCircle } from 'lucide-react';

interface VenuesTabProps {
    venues: EventVenue[];
    onRefresh: () => void;
}

export const VenuesTab: React.FC<VenuesTabProps> = ({ venues, onRefresh }) => {
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const handleToggleMaintenance = (venue: EventVenue) => {
        setFeedback(null);
        startTransition(async () => {
            const res = await toggleVenueMaintenance(venue.id, !venue.is_under_maintenance);
            if (res.success) {
                setFeedback({ type: 'success', text: res.message || 'Updated maintenance state.' });
                onRefresh();
            } else {
                setFeedback({ type: 'error', text: res.message || 'Failed to update.' });
            }
        });
    };

    const handleTogglePremierChoice = (venue: EventVenue, shouldFeature: boolean) => {
        setFeedback(null);
        startTransition(async () => {
            const res = await toggleFeaturedVenue(venue.id, shouldFeature);
            if (res.success) {
                setFeedback({ type: 'success', text: res.message || 'Updated Premier Choice status.' });
                onRefresh();
            } else {
                setFeedback({ type: 'error', text: res.message || 'Failed to update Premier Choice.' });
            }
        });
    };

    return (
        <div className="space-y-6 font-sans">
            {feedback && (
                <div
                    className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        feedback.type === 'error'
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    }`}
                >
                    {feedback.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    )}
                    <span>{feedback.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map((venue) => (
                    <div
                        key={venue.id}
                        className={`bg-white rounded-2xl border p-5 space-y-4 shadow-sm flex flex-col justify-between transition-all ${
                            venue.is_featured ? 'ring-2 ring-amber-400 border-amber-300' : 'border-stone-200'
                        }`}
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3 text-amber-600" />
                  Capacity: {venue.max_guest_capacity} PAX
                </span>

                                <span
                                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                        venue.is_under_maintenance
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    }`}
                                >
                  {venue.is_under_maintenance ? 'MAINTENANCE' : 'ACTIVE'}
                </span>
                            </div>

                            <div>
                                <h3 className="font-serif font-bold text-lg text-stone-900">{venue.name}</h3>
                                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{venue.description}</p>
                            </div>

                            <p className="font-serif font-extrabold text-lg text-emerald-950">
                                ₱{Number(venue.base_rental_rate_php).toLocaleString()}{' '}
                                <span className="text-xs font-sans font-normal text-stone-500">/ 5-hr block</span>
                            </p>
                        </div>

                        <div className="pt-3 border-t border-stone-100 space-y-2">
                            {/* Premier Choice Set / Unset Toggle Button */}
                            {venue.is_featured ? (
                                <button
                                    type="button"
                                    onClick={() => handleTogglePremierChoice(venue, false)}
                                    disabled={isPending}
                                    className="group/btn w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-stone-950 shadow-sm"
                                    title="Click to remove Premier Choice status"
                                >
                                    {isPending ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5 text-stone-950 group-hover/btn:hidden" />
                                            <XCircle className="w-3.5 h-3.5 text-stone-950 hidden group-hover/btn:inline-block" />
                                            <span className="group-hover/btn:hidden">★ PREMIER CHOICE</span>
                                            <span className="hidden group-hover/btn:inline-block">Unset Premier Choice</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleTogglePremierChoice(venue, true)}
                                    disabled={isPending}
                                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-stone-50 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200"
                                >
                                    {isPending ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                    )}
                                    <span>Set as Premier Choice</span>
                                </button>
                            )}

                            {/* Maintenance Toggle Button */}
                            <button
                                type="button"
                                onClick={() => handleToggleMaintenance(venue)}
                                disabled={isPending}
                                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                    venue.is_under_maintenance
                                        ? 'bg-emerald-900 hover:bg-emerald-950 text-white'
                                        : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                                }`}
                            >
                                {isPending ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Power className="w-3.5 h-3.5" />
                                )}
                                <span>
                  {venue.is_under_maintenance ? 'Re-Activate Venue' : 'Set Under Maintenance'}
                </span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};