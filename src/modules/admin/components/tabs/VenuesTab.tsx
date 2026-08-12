'use client';

import React, { useTransition, useState } from 'react';
import { EventVenue } from '@/modules/shared/types/database.types';
import { toggleVenueMaintenance, toggleFeaturedVenue } from '../../actions/adminActions';
import { EditVenueModal } from '../modals/EditVenueModal';
import { AddVenueModal } from '../modals/AddVenueModal';
import { Sparkles, Edit3, Loader2, CheckCircle2, AlertCircle, Users, Plus, Trees } from 'lucide-react';

interface VenuesTabProps {
    venues: EventVenue[];
    onRefresh: () => void;
}

export const VenuesTab: React.FC<VenuesTabProps> = ({ venues, onRefresh }) => {
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const [selectedEditingVenue, setSelectedEditingVenue] = useState<EventVenue | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleToggleActiveState = (venue: EventVenue) => {
        setFeedback(null);
        startTransition(async () => {
            const res = await toggleVenueMaintenance(venue.id, !venue.is_under_maintenance);
            if (res.success) {
                setFeedback({ type: 'success', text: res.message || 'Updated active status.' });
                onRefresh();
            } else {
                setFeedback({ type: 'error', text: res.message || 'Failed to update status.' });
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
            {/* Tab Header Action Bar with Add Venue Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
                <div>
                    <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                        <Trees className="w-5 h-5 text-emerald-800" />
                        <span>Venue Catalog Management</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                        Manage pavilion rental rates, guest capacities, showcase photos, and public availability.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-5 py-3 rounded-xl text-xs transition-all shadow-md hover:shadow-emerald-900/20 flex items-center justify-center gap-2 shrink-0 active:scale-95"
                >
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>Add New Venue</span>
                </button>
            </div>

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

            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map((venue) => {
                    const isActive = !venue.is_under_maintenance;

                    return (
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

                                    {/* Active / Inactive Toggle Button Badge */}
                                    <button
                                        type="button"
                                        onClick={() => handleToggleActiveState(venue)}
                                        disabled={isPending}
                                        className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                            isActive
                                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                                                : 'bg-stone-200 text-stone-600 border border-stone-300 hover:bg-stone-300'
                                        }`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-600 animate-pulse' : 'bg-stone-500'}`} />
                                        <span>{isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                                    </button>
                                </div>

                                <div>
                                    <h3 className="font-serif font-bold text-lg text-stone-900">{venue.name}</h3>
                                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">{venue.description}</p>
                                </div>

                                <p className="font-serif font-extrabold text-lg text-emerald-950">
                                    ₱{Number(venue.base_rental_rate_php).toLocaleString()}{' '}
                                    <span className="text-xs font-sans font-normal text-stone-500">
                    {venue.slot_duration_text || '/ 5-hr slot block'}
                  </span>
                                </p>
                            </div>

                            <div className="pt-3 border-t border-stone-100 space-y-2">
                                {/* Edit Venue Modal Button */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedEditingVenue(venue)}
                                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-emerald-900 hover:bg-emerald-950 text-white shadow-sm"
                                >
                                    <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Edit Venue Details</span>
                                </button>

                                {/* Premier Choice Toggle Button */}
                                {venue.is_featured ? (
                                    <button
                                        type="button"
                                        onClick={() => handleTogglePremierChoice(venue, false)}
                                        disabled={isPending}
                                        className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-stone-950 shadow-sm"
                                    >
                                        {isPending ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <>
                                                <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                                                <span>★ PREMIER CHOICE (Click to Unset)</span>
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
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit Venue Modal */}
            <EditVenueModal
                venue={selectedEditingVenue}
                onClose={() => setSelectedEditingVenue(null)}
                onRefresh={onRefresh}
            />

            {/* Add New Venue Modal */}
            <AddVenueModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onRefresh={onRefresh}
            />
        </div>
    );
};