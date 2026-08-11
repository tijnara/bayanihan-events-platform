'use client';

import React, { useTransition } from 'react';
import { EventVenue } from '@/modules/shared/types/database.types';
import { Trees, ShieldAlert, Power, Users, Sparkles } from 'lucide-react';
import { toggleVenueMaintenance } from '../../actions/adminActions';

interface VenuesTabProps {
    venues: EventVenue[];
    onRefresh: () => void;
}

export const VenuesTab: React.FC<VenuesTabProps> = ({ venues, onRefresh }) => {
    const [isPending, startTransition] = useTransition();

    const handleToggle = (venueId: string, currentState: boolean) => {
        startTransition(async () => {
            await toggleVenueMaintenance(venueId, !currentState);
            onRefresh();
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {venues.map((v) => (
                <div
                    key={v.id}
                    className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                        v.is_under_maintenance ? 'border-red-300 bg-red-50/20' : 'border-stone-200'
                    }`}
                >
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                Capacity: {v.max_guest_capacity} Pax
              </span>
                            <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                    v.is_under_maintenance
                                        ? 'bg-red-100 text-red-800 border border-red-300'
                                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                }`}
                            >
                {v.is_under_maintenance ? 'MAINTENANCE' : 'ACTIVE'}
              </span>
                        </div>
                        <h4 className="font-serif font-bold text-lg text-stone-900">{v.name}</h4>
                        <p className="text-xs text-stone-500 line-clamp-2">{v.description}</p>
                        <p className="font-serif font-bold text-emerald-900 text-base pt-1">
                            ₱{Number(v.base_rental_rate_php).toLocaleString()} <span className="text-xs font-normal text-stone-400">/ 5-hr block</span>
                        </p>
                    </div>

                    <button
                        onClick={() => handleToggle(v.id, v.is_under_maintenance)}
                        disabled={isPending}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            v.is_under_maintenance
                                ? 'bg-emerald-900 hover:bg-emerald-950 text-white'
                                : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-200'
                        }`}
                    >
                        <Power className="w-3.5 h-3.5" />
                        <span>{v.is_under_maintenance ? 'Reactivate Space' : 'Set Under Maintenance'}</span>
                    </button>
                </div>
            ))}
        </div>
    );
};