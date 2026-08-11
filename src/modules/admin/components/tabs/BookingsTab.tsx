'use client';

import React, { useState } from 'react';
import { EventBookingRecord, EventBookingStatus } from '@/modules/shared/types/database.types';
import { Filter } from 'lucide-react';
import { VerifyReceiptModal } from '../modals/VerifyReceiptModal';

interface BookingsTabProps {
    bookings: EventBookingRecord[];
    onRefresh: () => void;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({ bookings, onRefresh }) => {
    const [filter, setFilter] = useState<'all' | EventBookingStatus>('all');
    const [selectedBooking, setSelectedBooking] = useState<EventBookingRecord | null>(null);

    const filteredBookings = bookings.filter((b) => (filter === 'all' ? true : b.status === filter));

    const getStatusBadge = (status: EventBookingStatus) => {
        switch (status) {
            case 'confirmed':
                return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Confirmed</span>;
            case 'pending_deposit':
                return <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Pending Deposit</span>;
            case 'completed':
                return <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Completed</span>;
            case 'cancelled':
                return <span className="bg-red-100 text-red-900 border border-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Cancelled</span>;
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
                    <Filter className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span>Filter Status:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs font-semibold">
                    {(['all', 'pending_deposit', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilter(st)}
                            className={`px-3 py-1 rounded-xl border transition-all text-[11px] sm:text-xs ${
                                filter === st
                                    ? 'bg-emerald-900 text-white border-emerald-900'
                                    : 'bg-stone-50 border-stone-200 text-stone-600'
                            }`}
                        >
                            {st === 'all' ? 'All' : st.replace('_', ' ').toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table with Mobile Horizontal Scroll */}
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                {filteredBookings.length === 0 ? (
                    <div className="py-10 text-center text-stone-500 text-xs">
                        No reservation records found for this status filter.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse min-w-[640px]">
                            <thead>
                            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold text-[10px]">
                                <th className="py-3 px-4">Booking Ref</th>
                                <th className="py-3 px-4">Organizer Details</th>
                                <th className="py-3 px-4">Event Date & Slot</th>
                                <th className="py-3 px-4">Total Fee</th>
                                <th className="py-3 px-4">Deposit (30%)</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-stone-700">
                            {filteredBookings.map((b) => (
                                <tr key={b.id} className="hover:bg-stone-50/80 transition-colors">
                                    <td className="py-3.5 px-4 font-bold text-stone-900 font-mono text-[11px]">{b.id}</td>
                                    <td className="py-3.5 px-4">
                                        <p className="font-bold text-stone-900">{b.organizer_name}</p>
                                        <p className="text-[10px] text-stone-500">{b.organizer_phone}</p>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <p className="font-semibold text-stone-900">{b.event_date}</p>
                                        <p className="text-[10px] text-emerald-800 capitalize">{b.slot_block.replace('_', ' ')}</p>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                                        ₱{Number(b.total_amount_php).toLocaleString()}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-900">
                                        ₱{Number(b.required_deposit_php).toLocaleString()}
                                    </td>
                                    <td className="py-3.5 px-4">{getStatusBadge(b.status)}</td>
                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            onClick={() => setSelectedBooking(b)}
                                            className="bg-stone-100 hover:bg-emerald-900 hover:text-white text-stone-800 border border-stone-200 px-3 py-1 rounded-lg font-semibold text-[10px] transition-all"
                                        >
                                            Verify / Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <VerifyReceiptModal
                booking={selectedBooking}
                onClose={() => setSelectedBooking(null)}
                onRefresh={onRefresh}
            />
        </div>
    );
};