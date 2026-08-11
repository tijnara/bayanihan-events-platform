'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getBookings, toggleVenueMaintenance } from '@/modules/admin/actions/adminActions';
import { getVenues } from '@/modules/events/actions/venueActions';
import { EventBookingRecord, EventVenue } from '@/modules/shared/types/database.types';
import { BookingsTab } from '@/modules/admin/components/tabs/BookingsTab';
import { VenuesTab } from '@/modules/admin/components/tabs/VenuesTab';
import { Calendar, ShieldCheck, Clock, Trees, RefreshCw, Loader2 } from 'lucide-react';

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState<'bookings' | 'venues'>('bookings');
    const [bookings, setBookings] = useState<EventBookingRecord[]>([]);
    const [venues, setVenues] = useState<EventVenue[]>([]);
    const [isPending, startTransition] = useTransition();

    const loadData = () => {
        startTransition(async () => {
            const [bookingsRes, venuesRes] = await Promise.all([
                getBookings(),
                getVenues(true), // Include maintenance venues
            ]);

            if (bookingsRes.success && bookingsRes.data) {
                setBookings(bookingsRes.data);
            }
            if (venuesRes.success && venuesRes.data) {
                setVenues(venuesRes.data);
            }
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    // Summary Metrics
    const pendingCount = bookings.filter((b) => b.status === 'pending_deposit').length;
    const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
    const totalRevenueDeposits = bookings
        .filter((b) => b.status === 'confirmed')
        .reduce((sum, b) => sum + Number(b.required_deposit_php), 0);

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans py-10 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-emerald-950 text-white p-6 rounded-3xl shadow-xl">
                    <div>
            <span className="text-amber-300 text-xs font-bold uppercase tracking-widest block mb-1">
              Staff Portal Overview
            </span>
                        <h1 className="font-serif text-2xl md:text-3xl font-bold">
                            Regina’s Garden Management
                        </h1>
                    </div>
                    <button
                        onClick={loadData}
                        disabled={isPending}
                        className="bg-emerald-900 hover:bg-emerald-800 text-amber-200 border border-emerald-800 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
                        <span>Refresh Portal</span>
                    </button>
                </div>

                {/* Overview Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs text-stone-500 font-semibold block">Pending Verification</span>
                            <span className="font-serif text-2xl font-bold text-amber-600">{pendingCount}</span>
                        </div>
                        <Clock className="w-8 h-8 text-amber-500/30" />
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs text-stone-500 font-semibold block">Confirmed Reservations</span>
                            <span className="font-serif text-2xl font-bold text-emerald-900">{confirmedCount}</span>
                        </div>
                        <ShieldCheck className="w-8 h-8 text-emerald-800/30" />
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs text-stone-500 font-semibold block">Confirmed Downpayments</span>
                            <span className="font-serif text-2xl font-bold text-emerald-950">
                ₱{totalRevenueDeposits.toLocaleString()}
              </span>
                        </div>
                        <Calendar className="w-8 h-8 text-amber-500/30" />
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-stone-200 flex gap-6 text-sm font-semibold">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`pb-3 transition-all ${
                            activeTab === 'bookings'
                                ? 'border-b-2 border-emerald-900 text-emerald-950 font-bold'
                                : 'text-stone-400 hover:text-stone-700'
                        }`}
                    >
                        Reservations ({bookings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('venues')}
                        className={`pb-3 transition-all ${
                            activeTab === 'venues'
                                ? 'border-b-2 border-emerald-900 text-emerald-950 font-bold'
                                : 'text-stone-400 hover:text-stone-700'
                        }`}
                    >
                        Garden Spaces & Halls ({venues.length})
                    </button>
                </div>

                {/* Tab Contents */}
                {isPending && bookings.length === 0 ? (
                    <div className="py-16 text-center text-stone-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-800" />
                        <span className="text-xs font-semibold">Loading dashboard data...</span>
                    </div>
                ) : activeTab === 'bookings' ? (
                    <BookingsTab bookings={bookings} onRefresh={loadData} />
                ) : (
                    <VenuesTab venues={venues} onRefresh={loadData} />
                )}
            </div>
        </div>
    );
}