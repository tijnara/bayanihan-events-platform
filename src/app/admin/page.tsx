'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { getBookings, getSiteSettings, getUsers } from '@/modules/admin/actions/adminActions';
import { getVenues } from '@/modules/events/actions/venueActions';
import { EventBookingRecord, EventVenue, SiteSettings, UserProfile } from '@/modules/shared/types/database.types';
import { BookingsTab } from '@/modules/admin/components/tabs/BookingsTab';
import { VenuesTab } from '@/modules/admin/components/tabs/VenuesTab';
import { HeroSettingsTab } from '@/modules/admin/components/tabs/HeroSettingsTab';
import { UsersTab } from '@/modules/admin/components/tabs/UsersTab';
import { Calendar, ShieldCheck, Clock, RefreshCw, Loader2, LogOut, Users as UsersIcon, Shield } from 'lucide-react';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'bookings' | 'venues' | 'hero' | 'users'>('bookings');
    const [isMounted, setIsMounted] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const [bookings, setBookings] = useState<EventBookingRecord[]>([]);
    const [venues, setVenues] = useState<EventVenue[]>([]);
    const [usersList, setUsersList] = useState<UserProfile[]>([]);
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [isPending, startTransition] = useTransition();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createBrowserClient(supabaseUrl, supabaseKey);

    // Prevent hydration mismatch by reading localStorage only after client mounts
    useEffect(() => {
        setIsMounted(true);
        const storedSession = localStorage.getItem('reginas_user_session');
        if (!storedSession) {
            router.push('/admin/login');
            return;
        }
        try {
            setUserProfile(JSON.parse(storedSession));
        } catch {
            router.push('/admin/login');
        }
    }, [router]);

    const loadData = () => {
        startTransition(async () => {
            const [bookingsRes, venuesRes, settingsRes, usersRes] = await Promise.all([
                getBookings(),
                getVenues(true),
                getSiteSettings(),
                getUsers(),
            ]);

            if (bookingsRes.success && bookingsRes.data) setBookings(bookingsRes.data);
            if (venuesRes.success && venuesRes.data) setVenues(venuesRes.data);
            if (settingsRes.success && settingsRes.data) setSiteSettings(settingsRes.data);
            if (usersRes.success && usersRes.data) setUsersList(usersRes.data);
        });
    };

    useEffect(() => {
        if (userProfile) {
            loadData();
        }
    }, [userProfile]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('reginas_user_session');
        setUserProfile(null);
        router.push('/admin/login');
        router.refresh();
    };

    // Render loading state until mounted to guarantee identical Server & Client initial HTML
    if (!isMounted || !userProfile) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 font-sans">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-900 mx-auto" />
                    <p className="text-xs font-bold text-stone-600">Verifying session credentials...</p>
                </div>
            </div>
        );
    }

    const pendingCount = bookings.filter((b) => b.status === 'pending_deposit').length;
    const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
    const totalRevenueDeposits = bookings
        .filter((b) => b.status === 'confirmed')
        .reduce((sum, b) => sum + Number(b.required_deposit_php), 0);

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans py-6 sm:py-10 px-4 sm:px-8">
            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950 text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest block">
                                {siteSettings?.admin_portal_label || 'STAFF PORTAL OVERVIEW'}
                            </span>
                            <span className="bg-amber-400 text-stone-950 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Shield className="w-2.5 h-2.5" />
                                {userProfile.role}
                            </span>
                        </div>
                        <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold">
                            {siteSettings?.admin_portal_title || 'Regina’s Garden Management'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadData}
                            disabled={isPending}
                            className="bg-emerald-900 hover:bg-emerald-800 text-amber-200 border border-emerald-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="bg-red-900/80 hover:bg-red-900 text-white border border-red-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                            title="Sign Out of Admin Portal"
                        >
                            <LogOut className="w-3.5 h-3.5 text-amber-300" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] sm:text-xs text-stone-500 font-semibold block">Pending Verification</span>
                            <span className="font-serif text-xl sm:text-2xl font-bold text-amber-600">{pendingCount}</span>
                        </div>
                        <Clock className="w-7 h-7 text-amber-500/30 shrink-0" />
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] sm:text-xs text-stone-500 font-semibold block">Confirmed Reservations</span>
                            <span className="font-serif text-xl sm:text-2xl font-bold text-emerald-900">{confirmedCount}</span>
                        </div>
                        <ShieldCheck className="w-7 h-7 text-emerald-800/30 shrink-0" />
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] sm:text-xs text-stone-500 font-semibold block">Confirmed Deposits</span>
                            <span className="font-serif text-xl sm:text-2xl font-bold text-emerald-950">
                                ₱{totalRevenueDeposits.toLocaleString()}
                            </span>
                        </div>
                        <Calendar className="w-7 h-7 text-amber-500/30 shrink-0" />
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-stone-200 flex gap-4 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto whitespace-nowrap pb-1">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`pb-2.5 transition-all shrink-0 ${
                            activeTab === 'bookings'
                                ? 'border-b-2 border-emerald-900 text-emerald-950 font-bold'
                                : 'text-stone-400 hover:text-stone-700'
                        }`}
                    >
                        Reservations ({bookings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('venues')}
                        className={`pb-2.5 transition-all shrink-0 ${
                            activeTab === 'venues'
                                ? 'border-b-2 border-emerald-900 text-emerald-950 font-bold'
                                : 'text-stone-400 hover:text-stone-700'
                        }`}
                    >
                        Venue Spaces ({venues.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('hero')}
                        className={`pb-2.5 transition-all shrink-0 ${
                            activeTab === 'hero'
                                ? 'border-b-2 border-emerald-900 text-emerald-950 font-bold'
                                : 'text-stone-400 hover:text-stone-700'
                        }`}
                    >
                        Hero Content & Branding
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-2.5 transition-all shrink-0 flex items-center gap-1.5 ${
                            activeTab === 'users'
                                ? 'border-b-2 border-emerald-900 text-emerald-950 font-bold'
                                : 'text-stone-400 hover:text-stone-700'
                        }`}
                    >
                        <UsersIcon className="w-3.5 h-3.5" />
                        <span>User Accounts ({usersList.length})</span>
                    </button>
                </div>

                {/* Tab Views */}
                {isPending && bookings.length === 0 ? (
                    <div className="py-12 text-center text-stone-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-800" />
                        <span className="text-xs font-semibold">Loading portal data...</span>
                    </div>
                ) : activeTab === 'bookings' ? (
                    <BookingsTab bookings={bookings} onRefresh={loadData} />
                ) : activeTab === 'venues' ? (
                    <VenuesTab venues={venues} onRefresh={loadData} />
                ) : activeTab === 'hero' ? (
                    siteSettings && <HeroSettingsTab settings={siteSettings} onRefresh={loadData} />
                ) : (
                    <UsersTab users={usersList} currentUserRole={userProfile.role} onRefresh={loadData} />
                )}
            </div>
        </div>
    );
}