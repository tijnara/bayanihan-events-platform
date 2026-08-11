'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import {
    Calendar,
    Clock,
    Check,
    Loader2,
    Lock,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Users,
    Sparkles,
    PartyPopper,
    ShieldCheck,
    Trees,
    ArrowRight,
    ChevronLeft,
} from 'lucide-react';
import {
    EventAddOn,
    EventPackage,
    EventVenue,
    PHEventType,
    PHPaymentMethod,
    SlotBlockAvailability,
    VenueSlotBlock,
} from '@/modules/shared/types/database.types';
import {
    createEventSlotHold,
    confirmEventBooking,
    getVenueSlotAvailabilities,
} from '../actions/venueActions';

interface EventReservationFlowProps {
    venue: EventVenue;
    packages: EventPackage[];
    addOns: EventAddOn[];
}

export const EventReservationFlow: React.FC<EventReservationFlowProps> = ({
                                                                              venue,
                                                                              packages,
                                                                              addOns,
                                                                          }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isPending, startTransition] = useTransition();

    // Dynamic Date Initializer (Defaults to today's YYYY-MM-DD)
    const [selectedDate, setSelectedDate] = useState<string>(
        () => new Date().toISOString().split('T')[0]
    );
    const [slots, setSlots] = useState<SlotBlockAvailability[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<VenueSlotBlock | null>('morning_lunch');
    const [eventType, setEventType] = useState<PHEventType>('wedding');
    const [selectedPackageId, setSelectedPackageId] = useState<string>(packages[0]?.id || '');
    const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
    const [guestCount, setGuestCount] = useState<number>(100);
    const [paymentMethod, setPaymentMethod] = useState<PHPaymentMethod>('gcash');

    // Organizer Metadata Fields
    const [organizerName, setOrganizerName] = useState<string>('');
    const [organizerEmail, setOrganizerEmail] = useState<string>('');
    const [organizerPhone, setOrganizerPhone] = useState<string>('');

    // Lock State & 10-Minute Concurrency Countdown
    const [sessionId] = useState<string>(() => `SESS-${Math.random().toString(36).substring(2, 9)}`);
    const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
    const [countdownSeconds, setCountdownSeconds] = useState<number>(600); // 10 minutes TTL
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

    // Fetch slot block availability in real time
    useEffect(() => {
        let isMounted = true;
        startTransition(async () => {
            const res = await getVenueSlotAvailabilities(venue.id, selectedDate);
            if (res.success && res.data && isMounted) {
                setSlots(res.data);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [venue.id, selectedDate]);

    // Countdown clock ticker
    useEffect(() => {
        if (!holdExpiresAt) return;

        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.floor((new Date(holdExpiresAt).getTime() - Date.now()) / 1000));
            setCountdownSeconds(remaining);

            if (remaining === 0) {
                setHoldExpiresAt(null);
                setFeedback({
                    type: 'error',
                    text: '10-minute slot hold expired. Please re-select your venue time block.',
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [holdExpiresAt]);

    // Dynamic Financial Calculations
    const activeSlot = useMemo(() => slots.find((s) => s.slot_block === selectedSlot), [slots, selectedSlot]);
    const activePackage = useMemo(() => packages.find((p) => p.id === selectedPackageId), [packages, selectedPackageId]);

    const baseRental = activeSlot ? activeSlot.price_php : Number(venue.base_rental_rate_php);
    const packageCost = activePackage ? Number(activePackage.price_php) : 0;

    const addOnsCost = useMemo(() => {
        return selectedAddOnIds.reduce((sum, id) => {
            const item = addOns.find((a) => a.id === id);
            return sum + (item ? Number(item.price_php) : 0);
        }, 0);
    }, [selectedAddOnIds, addOns]);

    const totalCost = baseRental + packageCost + addOnsCost;
    const requiredDeposit = Math.max(5000, Math.round(totalCost * 0.3));
    const remainingBalance = totalCost - requiredDeposit;

    const handleToggleAddOn = (id: string) => {
        setSelectedAddOnIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleInitiateHold = () => {
        if (!selectedSlot) {
            setFeedback({ type: 'error', text: 'Please select an available venue time block.' });
            return;
        }
        setFeedback(null);

        startTransition(async () => {
            const res = await createEventSlotHold(venue.id, selectedDate, selectedSlot, sessionId);
            if (res.success && res.data) {
                setHoldExpiresAt(res.data.expiresAt);
                setStep(2);
            } else {
                setFeedback({ type: 'error', text: res.message || 'Failed to lock slot block.' });
            }
        });
    };

    const handleFinalCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot || !selectedPackageId) return;

        setFeedback(null);

        startTransition(async () => {
            const res = await confirmEventBooking({
                venue_id: venue.id,
                event_date: selectedDate,
                slot_block: selectedSlot,
                event_type: eventType,
                package_id: selectedPackageId,
                add_on_ids: selectedAddOnIds,
                expected_guest_count: guestCount,
                total_amount_php: totalCost,
                required_deposit_php: requiredDeposit,
                remaining_balance_php: remainingBalance,
                payment_method: paymentMethod,
                organizer_name: organizerName,
                organizer_email: organizerEmail,
                organizer_phone: organizerPhone,
            });

            if (res.success) {
                setIsConfirmed(true);
                setFeedback({ type: 'success', text: res.message || 'Venue provisionally reserved!' });
            } else {
                setFeedback({ type: 'error', text: res.message || 'Submission failed.' });
            }
        });
    };

    const formatTimer = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full bg-white text-stone-800 rounded-3xl border-0 shadow-2xl overflow-hidden font-sans">
            {/* 1. Header Banner */}
            <div className="bg-emerald-950 px-6 py-7 text-white flex flex-wrap items-center justify-between gap-4 border-b border-emerald-900">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-900 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm shrink-0">
                        <Trees className="w-5 h-5" />
                    </div>
                    <div>
            <span className="text-amber-300 text-[10px] font-extrabold uppercase tracking-widest block mb-0.5">
              REGINA’S GARDEN ONLINE RESERVATION
            </span>
                        <h2 className="font-serif text-2xl md:text-3xl font-bold">{venue.name}</h2>
                    </div>
                </div>

                {holdExpiresAt && (
                    <div className="flex items-center gap-3 bg-emerald-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-300/40 shadow-inner">
                        <Lock className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
                        <div>
                            <p className="text-[10px] uppercase text-amber-200/90 font-extrabold tracking-wider">
                                10-Min Lock Active
                            </p>
                            <p className="text-sm font-mono font-bold text-amber-300">{formatTimer(countdownSeconds)}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Sleek Multi-Step Indicator */}
            <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-50 text-xs font-semibold">
                <button
                    onClick={() => setStep(1)}
                    className={`py-4 px-3 text-center transition-all flex items-center justify-center gap-2 ${
                        step === 1
                            ? 'border-b-2 border-emerald-900 text-emerald-950 bg-white font-extrabold shadow-sm'
                            : 'text-stone-400 hover:text-stone-700'
                    }`}
                >
          <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 1 ? 'bg-emerald-900 text-white' : 'bg-stone-200 text-stone-600'
              }`}
          >
            1
          </span>
                    <span className="hidden sm:inline">Date & Time Block</span>
                    <span className="sm:hidden">Date</span>
                </button>

                <button
                    onClick={() => holdExpiresAt && setStep(2)}
                    disabled={!holdExpiresAt}
                    className={`py-4 px-3 text-center transition-all flex items-center justify-center gap-2 ${
                        step === 2
                            ? 'border-b-2 border-emerald-900 text-emerald-950 bg-white font-extrabold shadow-sm'
                            : 'text-stone-400 disabled:opacity-40 hover:text-stone-700'
                    }`}
                >
          <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 2 ? 'bg-emerald-900 text-white' : 'bg-stone-200 text-stone-600'
              }`}
          >
            2
          </span>
                    <span className="hidden sm:inline">Catering & Package</span>
                    <span className="sm:hidden">Package</span>
                </button>

                <button
                    onClick={() => holdExpiresAt && setStep(3)}
                    disabled={!holdExpiresAt}
                    className={`py-4 px-3 text-center transition-all flex items-center justify-center gap-2 ${
                        step === 3
                            ? 'border-b-2 border-emerald-900 text-emerald-950 bg-white font-extrabold shadow-sm'
                            : 'text-stone-400 disabled:opacity-40 hover:text-stone-700'
                    }`}
                >
          <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 3 ? 'bg-emerald-900 text-white' : 'bg-stone-200 text-stone-600'
              }`}
          >
            3
          </span>
                    <span className="hidden sm:inline">Cost & Downpayment</span>
                    <span className="sm:hidden">Checkout</span>
                </button>
            </div>

            {/* Alert Notifications */}
            {feedback && (
                <div
                    className={`p-4 mx-6 md:mx-8 mt-6 rounded-2xl flex items-center gap-3 text-xs md:text-sm font-medium ${
                        feedback.type === 'error'
                            ? 'bg-red-50 border border-red-200 text-red-800'
                            : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    }`}
                >
                    {feedback.type === 'error' ? (
                        <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                    ) : (
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-700" />
                    )}
                    <span>{feedback.text}</span>
                </div>
            )}

            {/* Main Form Body */}
            <div className="p-6 md:p-8">
                {isConfirmed ? (
                    /* Confirmation Success Screen */
                    <div className="text-center py-10 space-y-6">
                        <div className="w-20 h-20 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-900 shadow-inner">
                            <PartyPopper className="w-10 h-10 text-emerald-800" />
                        </div>

                        <div className="space-y-2">
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Provisional Reservation Draft Created
              </span>
                            <h3 className="font-serif text-3xl md:text-4xl font-extrabold text-emerald-950">
                                Event Provisionally Locked!
                            </h3>
                        </div>

                        <p className="text-stone-600 max-w-lg mx-auto text-sm leading-relaxed font-sans">
                            Your reservation draft for <span className="text-emerald-900 font-bold">{venue.name}</span> is set. Please submit your <span className="text-emerald-900 uppercase font-bold">{paymentMethod.replace('_', ' ')}</span> downpayment of <span className="text-emerald-900 font-extrabold">₱{requiredDeposit.toLocaleString()}</span> within 24 hours to secure the slot.
                        </p>

                        <div className="bg-stone-50 p-6 rounded-3xl max-w-md mx-auto text-left text-xs space-y-3 border border-stone-200 text-stone-700 shadow-sm">
                            <div className="flex justify-between border-b border-stone-200 pb-2">
                                <span className="text-stone-500 font-semibold">Event Date:</span>
                                <span className="font-bold text-stone-900">{selectedDate}</span>
                            </div>
                            <div className="flex justify-between border-b border-stone-200 pb-2">
                                <span className="text-stone-500 font-semibold">Slot Time Block:</span>
                                <span className="font-bold text-emerald-900">{activeSlot?.label} ({activeSlot?.time_range})</span>
                            </div>
                            <div className="flex justify-between border-b border-stone-200 pb-2">
                                <span className="text-stone-500 font-semibold">Total Event Cost:</span>
                                <span className="font-mono font-bold text-stone-900">₱{totalCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-stone-200 pb-2 bg-emerald-50 p-2.5 rounded-xl text-emerald-950">
                                <span className="font-bold">Required Downpayment (30%):</span>
                                <span className="font-mono font-extrabold text-emerald-900 text-sm">₱{requiredDeposit.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-stone-500 font-semibold">Remaining Balance:</span>
                                <span className="font-mono font-bold text-stone-800">₱{remainingBalance.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* STEP 1: TIME BLOCK & DATE */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 mb-1">
                                        Step 1: Select Event Date & Slot Block
                                    </h3>
                                    <p className="text-xs text-stone-500">
                                        Pick your occasion date to check real-time availability in the garden.
                                    </p>
                                </div>

                                {/* Date Selection Input */}
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    <div className="relative w-full sm:w-72">
                                        <Calendar className="w-5 h-5 text-emerald-800 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="bg-stone-50 border border-stone-300 text-stone-900 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20 w-full font-bold shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* Available Slot Cards */}
                                <div className="space-y-3">
                                    <label className="text-xs font-extrabold text-stone-500 uppercase tracking-widest block">
                                        Available Garden Time Blocks ({selectedDate})
                                    </label>

                                    {isPending ? (
                                        <div className="py-12 text-center text-stone-500 flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-emerald-800" />
                                            <span className="text-xs font-semibold">Checking real-time slot block availability...</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {slots.map((s) => {
                                                const isSelected = selectedSlot === s.slot_block;
                                                const isHeld = s.status === 'held';
                                                const isBooked = s.status === 'booked';

                                                return (
                                                    <div
                                                        key={s.slot_block}
                                                        onClick={() => !isHeld && !isBooked && setSelectedSlot(s.slot_block)}
                                                        className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                                                            isSelected
                                                                ? 'bg-emerald-50/70 border-emerald-800 ring-2 ring-emerald-800/30 shadow-md'
                                                                : isHeld || isBooked
                                                                    ? 'bg-stone-100 border-stone-200 opacity-50 cursor-not-allowed'
                                                                    : 'bg-white border-stone-200 hover:border-emerald-700 hover:shadow-lg'
                                                        }`}
                                                    >
                                                        <div>
                                                            <div className="flex items-center justify-between mb-3">
                                                                <Clock className="w-4 h-4 text-emerald-800" />
                                                                <span
                                                                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                                                        s.status === 'available'
                                                                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                                                            : isHeld
                                                                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                                                                : 'bg-red-100 text-red-900 border border-red-300'
                                                                    }`}
                                                                >
                                  {s.status === 'available' ? 'AVAILABLE' : isHeld ? 'HELD BY PLANNER' : 'BOOKED'}
                                </span>
                                                            </div>
                                                            <h4 className="font-serif font-bold text-lg text-stone-900">{s.label}</h4>
                                                            <p className="text-xs text-stone-500 mt-1">{s.time_range}</p>
                                                        </div>

                                                        <p className="mt-4 font-serif font-extrabold text-xl text-emerald-950">
                                                            ₱{s.price_php.toLocaleString()}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={handleInitiateHold}
                                        disabled={isPending || !selectedSlot}
                                        className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-8 py-4 rounded-2xl transition-all flex items-center gap-2 text-sm disabled:opacity-50 shadow-lg hover:shadow-emerald-900/20"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4 text-amber-300" />}
                                        Lock Slot & Customize Package
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: CATERING & PACKAGES */}
                        {step === 2 && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 mb-1">
                                        Step 2: Choose Catering Package & Add-Ons
                                    </h3>
                                    <p className="text-xs text-stone-500">
                                        Tailor Regina’s signature buffet menu and event add-ons.
                                    </p>
                                </div>

                                {/* Occasion Type Filter */}
                                <div className="space-y-3">
                                    <label className="text-xs font-extrabold text-stone-600 uppercase tracking-widest block">
                                        Occasion Type
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                                        {[
                                            { id: 'wedding', label: 'Garden Wedding' },
                                            { id: 'debut_18th', label: '18th Debut' },
                                            { id: 'christening_banyag', label: 'Baptismal Reception' },
                                            { id: 'private_gathering', label: 'Family Reunion' },
                                            { id: 'corporate_party', label: 'Corporate / LGU' },
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setEventType(item.id as PHEventType)}
                                                className={`py-3 px-3 text-xs rounded-2xl border font-bold transition-all ${
                                                    eventType === item.id
                                                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                                                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* In-House Catering Packages */}
                                <div className="space-y-3">
                                    <label className="text-xs font-extrabold text-stone-600 uppercase tracking-widest block">
                                        Select In-House Catering Package
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {packages.map((pkg, idx) => {
                                            const isSelected = selectedPackageId === pkg.id;
                                            const isTopTier = idx === 1; // Top tier gold ribbon

                                            return (
                                                <div
                                                    key={pkg.id}
                                                    onClick={() => setSelectedPackageId(pkg.id)}
                                                    className={`relative p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                                                        isSelected
                                                            ? 'bg-emerald-50/80 border-emerald-800 ring-2 ring-emerald-800/30 shadow-xl'
                                                            : isTopTier
                                                                ? 'bg-white border-amber-400/80 ring-1 ring-amber-300 shadow-md hover:shadow-xl'
                                                                : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-lg'
                                                    }`}
                                                >
                                                    {isTopTier && (
                                                        <span className="absolute -top-3 left-6 bg-amber-400 text-stone-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-stone-950" />
                              <span>MOST POPULAR</span>
                            </span>
                                                    )}

                                                    <div className="pt-2 space-y-2">
                                                        <h4 className="font-serif font-bold text-lg text-stone-900">{pkg.name}</h4>
                                                        <p className="text-xs text-stone-600 leading-relaxed">{pkg.description}</p>
                                                    </div>

                                                    <div className="pt-6 border-t border-stone-100 mt-4 space-y-3">
                                                        <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                                            <Users className="w-4 h-4 text-emerald-800" />
                                                            <span>Included Catering: {pkg.included_catering_headcount} Guests</span>
                                                        </p>
                                                        <p className="font-serif font-extrabold text-2xl text-stone-950">
                                                            ₱{Number(pkg.price_php).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Optional Add-ons */}
                                <div className="space-y-3">
                                    <label className="text-xs font-extrabold text-stone-600 uppercase tracking-widest block">
                                        Optional Event Extras
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {addOns.map((addon) => {
                                            const isChecked = selectedAddOnIds.includes(addon.id);
                                            return (
                                                <div
                                                    key={addon.id}
                                                    onClick={() => handleToggleAddOn(addon.id)}
                                                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between ${
                                                        isChecked
                                                            ? 'bg-emerald-50 border-emerald-800 text-emerald-950 shadow-sm'
                                                            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                                                    }`}
                                                >
                                                    <div>
                                                        <p className="text-xs font-bold">{addon.name}</p>
                                                        <p className="text-xs text-emerald-800 font-extrabold mt-0.5">
                                                            +₱{Number(addon.price_php).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div
                                                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                                                            isChecked
                                                                ? 'bg-emerald-900 border-emerald-900 text-white'
                                                                : 'border-stone-300 bg-stone-50'
                                                        }`}
                                                    >
                                                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-between items-center">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span>Back to Date Block</span>
                                    </button>

                                    <button
                                        onClick={() => setStep(3)}
                                        className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-8 py-4 rounded-2xl transition-all text-sm shadow-lg hover:shadow-emerald-900/20 flex items-center gap-2"
                                    >
                                        <span>Proceed to Downpayment Summary</span>
                                        <ArrowRight className="w-4 h-4 text-amber-300" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: LIVE ESTIMATOR SIDEBAR & CHECKOUT */}
                        {step === 3 && (
                            <form onSubmit={handleFinalCheckout} className="space-y-8">
                                <div>
                                    <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 mb-1">
                                        Step 3: Financial Summary & Deposit Submission
                                    </h3>
                                    <p className="text-xs text-stone-500">
                                        Live cost breakdown and local payment channels.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                    {/* Sticky Calculator Sidebar */}
                                    <div className="bg-stone-50 border border-stone-200/80 rounded-3xl p-6 md:p-7 space-y-4 text-xs sticky top-24 shadow-sm">
                                        <h4 className="font-serif font-bold text-lg text-emerald-950 border-b border-stone-200 pb-3">
                                            Cost Calculation
                                        </h4>

                                        <div className="flex justify-between text-stone-600 border-b border-dashed border-stone-200 pb-2">
                                            <span>Venue Rental ({activeSlot?.label}):</span>
                                            <span className="font-mono font-bold text-stone-900">₱{baseRental.toLocaleString()}</span>
                                        </div>

                                        <div className="flex justify-between text-stone-600 border-b border-dashed border-stone-200 pb-2">
                                            <span>Package ({activePackage?.name}):</span>
                                            <span className="font-mono font-bold text-stone-900">₱{packageCost.toLocaleString()}</span>
                                        </div>

                                        <div className="flex justify-between text-stone-600 border-b border-dashed border-stone-200 pb-2">
                                            <span>Add-ons Total ({selectedAddOnIds.length}):</span>
                                            <span className="font-mono font-bold text-stone-900">₱{addOnsCost.toLocaleString()}</span>
                                        </div>

                                        <div className="pt-2 flex justify-between text-sm font-extrabold text-stone-950">
                                            <span>Estimated Total Event Fee:</span>
                                            <span className="font-mono text-emerald-950 text-base">₱{totalCost.toLocaleString()}</span>
                                        </div>

                                        {/* Prominent Downpayment Highlight Card */}
                                        <div className="bg-emerald-950 text-white p-5 rounded-2xl shadow-inner flex justify-between items-center border border-emerald-900">
                                            <div>
                        <span className="block text-[10px] uppercase text-amber-300 font-extrabold tracking-wider mb-1">
                          Required Downpayment (30%)
                        </span>
                                                <span className="font-serif text-3xl font-extrabold text-amber-200">
                          ₱{requiredDeposit.toLocaleString()}
                        </span>
                                            </div>
                                            <ShieldCheck className="w-8 h-8 text-amber-300 shrink-0" />
                                        </div>

                                        <div className="flex justify-between text-[11px] text-stone-500 pt-1">
                                            <span>Remaining Balance (Due on Event Date):</span>
                                            <span className="font-mono font-bold text-stone-800">₱{remainingBalance.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Organizer Form & Payment Channels */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-extrabold text-stone-700 uppercase tracking-widest block">
                                                Organizer Contact Details
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Organizer Full Name"
                                                required
                                                value={organizerName}
                                                onChange={(e) => setOrganizerName(e.target.value)}
                                                className="w-full bg-stone-50 border border-stone-300 rounded-2xl px-4 py-3 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20"
                                            />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <input
                                                    type="email"
                                                    placeholder="Email Address"
                                                    required
                                                    value={organizerEmail}
                                                    onChange={(e) => setOrganizerEmail(e.target.value)}
                                                    className="bg-stone-50 border border-stone-300 rounded-2xl px-4 py-3 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20"
                                                />
                                                <input
                                                    type="tel"
                                                    placeholder="+63 Mobile Number"
                                                    required
                                                    value={organizerPhone}
                                                    onChange={(e) => setOrganizerPhone(e.target.value)}
                                                    className="bg-stone-50 border border-stone-300 rounded-2xl px-4 py-3 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-extrabold text-stone-700 uppercase tracking-widest block">
                                                Select Downpayment Channel
                                            </label>
                                            <div className="grid grid-cols-2 gap-2.5 text-xs">
                                                {[
                                                    { id: 'gcash', label: 'GCash' },
                                                    { id: 'maya', label: 'Maya' },
                                                    { id: 'bank_transfer', label: 'Bank Transfer' },
                                                    { id: 'palawan_express', label: 'Palawan Express' },
                                                ].map((method) => (
                                                    <button
                                                        key={method.id}
                                                        type="button"
                                                        onClick={() => setPaymentMethod(method.id as PHPaymentMethod)}
                                                        className={`p-3.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all font-bold ${
                                                            paymentMethod === method.id
                                                                ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                                                                : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                                                        }`}
                                                    >
                                                        <CreditCard className="w-4 h-4 shrink-0 text-amber-300" />
                                                        <span>{method.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                <span>Back to Catering</span>
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={isPending}
                                                className="w-full sm:w-auto bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 shadow-xl hover:shadow-emerald-900/20"
                                            >
                                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4 text-amber-300" />}
                                                Submit Provisional Reservation Draft
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};