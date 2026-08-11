'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    ArrowLeft,
    X,
    AlertTriangle,
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
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isPending, startTransition] = useTransition();
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

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

    const [organizerName, setOrganizerName] = useState<string>('');
    const [organizerEmail, setOrganizerEmail] = useState<string>('');
    const [organizerPhone, setOrganizerPhone] = useState<string>('');

    const [sessionId] = useState<string>(() => `SESS-${Math.random().toString(36).substring(2, 9)}`);
    const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
    const [countdownSeconds, setCountdownSeconds] = useState<number>(600);
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

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
        <div className="space-y-4 font-sans">
            {/* Outer Action Navigation Link */}
            <div className="flex items-center justify-between px-2">
                <Link
                    href="/venues"
                    className="inline-flex items-center gap-2 text-stone-600 hover:text-emerald-950 font-bold text-xs sm:text-sm transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span>Back to Venues Directory</span>
                </Link>

                <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="text-stone-500 hover:text-red-700 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                >
                    <X className="w-4 h-4" />
                    <span>Cancel Draft</span>
                </button>
            </div>

            <div className="relative w-full bg-white text-stone-800 rounded-2xl sm:rounded-3xl border-0 shadow-2xl overflow-hidden">
                {/* Header Banner */}
                <div className="bg-emerald-950 px-4 sm:px-6 py-4 sm:py-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-900 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm shrink-0">
                            <Trees className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
              <span className="text-amber-300 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest block">
                REGINA’S GARDEN RESERVATION
              </span>
                            <h2 className="font-serif text-lg sm:text-2xl md:text-3xl font-bold">{venue.name}</h2>
                        </div>
                    </div>

                    {holdExpiresAt && (
                        <div className="flex items-center gap-2 bg-emerald-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-300/40 shrink-0">
                            <Lock className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                            <div>
                                <p className="text-[8px] sm:text-[9px] uppercase text-amber-200/90 font-extrabold">10-Min Lock Active</p>
                                <p className="text-xs font-mono font-bold text-amber-300">{formatTimer(countdownSeconds)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* High-Contrast Multi-Step Indicator Bar */}
                <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-50 text-xs font-bold">
                    {[
                        { num: 1, label: 'Date & Time', stepVal: 1 },
                        { num: 2, label: 'Catering', stepVal: 2 },
                        { num: 3, label: 'Checkout', stepVal: 3 },
                    ].map((s) => (
                        <button
                            key={s.num}
                            onClick={() => s.stepVal === 1 ? setStep(1) : holdExpiresAt && setStep(s.stepVal as 1 | 2 | 3)}
                            disabled={s.stepVal > 1 && !holdExpiresAt}
                            className={`py-3.5 sm:py-4 px-2 text-center transition-all flex items-center justify-center gap-1.5 ${
                                step === s.stepVal
                                    ? 'border-b-2 border-emerald-900 text-emerald-950 bg-white font-extrabold shadow-sm'
                                    : 'text-stone-600 hover:text-stone-900 disabled:opacity-50'
                            }`}
                        >
              <span
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                      step === s.stepVal ? 'bg-emerald-900 text-white' : 'bg-stone-200 text-stone-800'
                  }`}
              >
                {s.num}
              </span>
                            <span className="truncate">{s.label}</span>
                        </button>
                    ))}
                </div>

                {/* Feedback Alerts */}
                {feedback && (
                    <div
                        className={`p-3.5 sm:p-4 mx-4 sm:mx-8 mt-4 sm:mt-6 rounded-xl sm:rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-medium ${
                            feedback.type === 'error'
                                ? 'bg-red-50 border border-red-200 text-red-800'
                                : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                        }`}
                    >
                        {feedback.type === 'error' ? (
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                        )}
                        <span>{feedback.text}</span>
                    </div>
                )}

                {/* Main Body */}
                <div className="p-4 sm:p-8">
                    {isConfirmed ? (
                        <div className="text-center py-8 space-y-4 sm:space-y-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-900 shadow-inner">
                                <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-800" />
                            </div>

                            <div className="space-y-1">
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                  Draft Created
                </span>
                                <h3 className="font-serif text-2xl sm:text-4xl font-extrabold text-emerald-950">
                                    Event Provisionally Locked!
                                </h3>
                            </div>

                            <p className="text-stone-600 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
                                Your reservation draft for <span className="text-emerald-900 font-bold">{venue.name}</span> is set. Submit your <span className="text-emerald-900 uppercase font-bold">{paymentMethod.replace('_', ' ')}</span> downpayment of <span className="text-emerald-900 font-extrabold">₱{requiredDeposit.toLocaleString()}</span> within 24 hours.
                            </p>

                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="w-full sm:w-auto bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-6 py-3.5 rounded-xl text-xs inline-flex items-center justify-center gap-2"
                            >
                                <span>Return to Homepage</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* STEP 1: TIME BLOCK */}
                            {step === 1 && (
                                <div className="space-y-5 sm:space-y-6">
                                    <div>
                                        <h3 className="font-serif text-lg sm:text-2xl font-bold text-stone-900">
                                            Step 1: Select Event Date & Slot Block
                                        </h3>
                                        <p className="text-xs text-stone-500">
                                            Pick your occasion date to check real-time availability.
                                        </p>
                                    </div>

                                    <div className="relative w-full sm:w-72">
                                        <Calendar className="w-4 h-4 text-emerald-800 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="bg-stone-50 border border-stone-300 text-stone-900 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-emerald-800 w-full font-bold shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-2.5">
                                        <label className="text-[10px] sm:text-xs font-extrabold text-stone-500 uppercase tracking-widest block">
                                            Available Time Blocks ({selectedDate})
                                        </label>

                                        {isPending ? (
                                            <div className="py-8 text-center text-stone-500 flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-emerald-800" />
                                                <span className="text-xs">Checking slot availability...</span>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                                                {slots.map((s) => {
                                                    const isSelected = selectedSlot === s.slot_block;
                                                    const isHeld = s.status === 'held';
                                                    const isBooked = s.status === 'booked';

                                                    return (
                                                        <div
                                                            key={s.slot_block}
                                                            onClick={() => !isHeld && !isBooked && setSelectedSlot(s.slot_block)}
                                                            className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                                                                isSelected
                                                                    ? 'bg-emerald-50/90 border-2 border-emerald-800 ring-2 ring-emerald-800/30 shadow-md'
                                                                    : isHeld || isBooked
                                                                        ? 'bg-stone-100 border-stone-200 opacity-50 cursor-not-allowed'
                                                                        : 'bg-white border-stone-200 hover:border-emerald-700'
                                                            }`}
                                                        >
                                                            <div>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <Clock className="w-3.5 h-3.5 text-emerald-800" />
                                                                    <div className="flex items-center gap-1.5">
                                                                        {isSelected && (
                                                                            <CheckCircle2 className="w-4 h-4 text-emerald-800 fill-emerald-100 shrink-0" />
                                                                        )}
                                                                        <span
                                                                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                                                isSelected
                                                                                    ? 'bg-emerald-900 text-white'
                                                                                    : s.status === 'available'
                                                                                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                                                                        : isHeld
                                                                                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                                                                            : 'bg-red-100 text-red-900 border border-red-300'
                                                                            }`}
                                                                        >
                                      {isSelected ? 'SELECTED' : s.status === 'available' ? 'AVAILABLE' : isHeld ? 'HELD' : 'BOOKED'}
                                    </span>
                                                                    </div>
                                                                </div>
                                                                <h4 className="font-serif font-bold text-base sm:text-lg text-stone-900">{s.label}</h4>
                                                                <p className="text-xs text-stone-500 mt-0.5">{s.time_range}</p>
                                                            </div>

                                                            <p className="mt-3 font-serif font-extrabold text-lg sm:text-xl text-emerald-950">
                                                                ₱{s.price_php.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                        <button
                                            onClick={handleInitiateHold}
                                            disabled={isPending || !selectedSlot}
                                            className="w-full sm:w-auto bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-6 py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                                        >
                                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4 text-amber-300" />}
                                            Lock Slot & Customize Package
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2 */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-serif text-lg sm:text-2xl font-bold text-stone-900">
                                            Step 2: Choose Catering Package & Add-Ons
                                        </h3>
                                        <p className="text-xs text-stone-500">
                                            Tailor Regina’s signature buffet menu and event add-ons.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] sm:text-xs font-extrabold text-stone-600 uppercase tracking-widest block">
                                            Occasion Type
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                            {[
                                                { id: 'wedding', label: 'Garden Wedding' },
                                                { id: 'debut_18th', label: '18th Debut' },
                                                { id: 'christening_banyag', label: 'Baptismal' },
                                                { id: 'private_gathering', label: 'Family Reunion' },
                                                { id: 'corporate_party', label: 'Corporate / LGU' },
                                            ].map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setEventType(item.id as PHEventType)}
                                                    className={`py-2.5 px-2 text-xs rounded-xl border font-bold transition-all ${
                                                        eventType === item.id
                                                            ? 'bg-emerald-900 text-white border-emerald-900'
                                                            : 'bg-stone-50 border-stone-200 text-stone-700'
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <label className="text-[10px] sm:text-xs font-extrabold text-stone-600 uppercase tracking-widest block">
                                            Select Catering Package
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {packages.map((pkg, idx) => {
                                                const isSelected = selectedPackageId === pkg.id;
                                                const isTopTier = idx === 1;

                                                return (
                                                    <div
                                                        key={pkg.id}
                                                        onClick={() => setSelectedPackageId(pkg.id)}
                                                        className={`relative p-5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                                                            isSelected
                                                                ? 'bg-emerald-50/80 border-2 border-emerald-800 ring-2 ring-emerald-800/30'
                                                                : isTopTier
                                                                    ? 'bg-white border-amber-400 ring-1 ring-amber-300'
                                                                    : 'bg-white border-stone-200'
                                                        }`}
                                                    >
                                                        {isTopTier && (
                                                            <span className="absolute -top-2.5 left-4 bg-amber-400 text-stone-950 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                MOST POPULAR
                              </span>
                                                        )}

                                                        <div className="space-y-1.5 pt-1">
                                                            <h4 className="font-serif font-bold text-base text-stone-900">{pkg.name}</h4>
                                                            <p className="text-xs text-stone-600 leading-relaxed">{pkg.description}</p>
                                                        </div>

                                                        <div className="pt-4 border-t border-stone-100 mt-3 space-y-2">
                                                            <p className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                                                                <Users className="w-3.5 h-3.5 text-emerald-800" />
                                                                <span>Catering: {pkg.included_catering_headcount} Guests</span>
                                                            </p>
                                                            <p className="font-serif font-extrabold text-xl text-stone-950">
                                                                ₱{Number(pkg.price_php).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <label className="text-[10px] sm:text-xs font-extrabold text-stone-600 uppercase tracking-widest block">
                                            Optional Extras
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {addOns.map((addon) => {
                                                const isChecked = selectedAddOnIds.includes(addon.id);
                                                return (
                                                    <div
                                                        key={addon.id}
                                                        onClick={() => handleToggleAddOn(addon.id)}
                                                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                                            isChecked
                                                                ? 'bg-emerald-50 border-emerald-800 text-emerald-950'
                                                                : 'bg-white border-stone-200 text-stone-700'
                                                        }`}
                                                    >
                                                        <div>
                                                            <p className="text-xs font-bold">{addon.name}</p>
                                                            <p className="text-xs text-emerald-800 font-extrabold mt-0.5">
                                                                +₱{Number(addon.price_php).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div
                                                            className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                                                                isChecked ? 'bg-emerald-900 border-emerald-900 text-white' : 'border-stone-300 bg-stone-50'
                                                            }`}
                                                        >
                                                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center justify-center gap-1"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            <span>Back to Date Block</span>
                                        </button>

                                        <button
                                            onClick={() => setStep(3)}
                                            className="w-full sm:w-auto bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-6 py-3.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                                        >
                                            <span>Proceed to Downpayment</span>
                                            <ArrowRight className="w-4 h-4 text-amber-300" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3 */}
                            {step === 3 && (
                                <form onSubmit={handleFinalCheckout} className="space-y-6">
                                    <div>
                                        <h3 className="font-serif text-lg sm:text-2xl font-bold text-stone-900 mb-0.5">
                                            Step 3: Cost Summary & Deposit Submission
                                        </h3>
                                        <p className="text-xs text-stone-500">
                                            Live fee breakdown and local payment channels.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5 space-y-3.5 text-xs lg:sticky lg:top-24">
                                            <h4 className="font-serif font-bold text-base text-emerald-950 border-b border-stone-200 pb-2">
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

                                            <div className="pt-1 flex justify-between text-xs sm:text-sm font-extrabold text-stone-950">
                                                <span>Estimated Total Event Fee:</span>
                                                <span className="font-mono text-emerald-950">₱{totalCost.toLocaleString()}</span>
                                            </div>

                                            <div className="bg-emerald-950 text-white p-4 rounded-xl shadow-inner flex justify-between items-center border border-emerald-900">
                                                <div>
                          <span className="block text-[9px] uppercase text-amber-300 font-extrabold tracking-wider mb-0.5">
                            Required Deposit (30%)
                          </span>
                                                    <span className="font-serif text-2xl font-extrabold text-amber-200">
                            ₱{requiredDeposit.toLocaleString()}
                          </span>
                                                </div>
                                                <ShieldCheck className="w-7 h-7 text-amber-300 shrink-0" />
                                            </div>

                                            <div className="flex justify-between text-[11px] text-stone-500 pt-0.5">
                                                <span>Remaining Balance:</span>
                                                <span className="font-mono font-bold text-stone-800">₱{remainingBalance.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2.5">
                                                <label className="text-[10px] sm:text-xs font-extrabold text-stone-700 uppercase tracking-widest block">
                                                    Organizer Details
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Organizer Full Name"
                                                    required
                                                    value={organizerName}
                                                    onChange={(e) => setOrganizerName(e.target.value)}
                                                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                                                />
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                    <input
                                                        type="email"
                                                        placeholder="Email Address"
                                                        required
                                                        value={organizerEmail}
                                                        onChange={(e) => setOrganizerEmail(e.target.value)}
                                                        className="bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                                                    />
                                                    <input
                                                        type="tel"
                                                        placeholder="+63 Mobile Number"
                                                        required
                                                        value={organizerPhone}
                                                        onChange={(e) => setOrganizerPhone(e.target.value)}
                                                        className="bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] sm:text-xs font-extrabold text-stone-700 uppercase tracking-widest block">
                                                    Downpayment Channel
                                                </label>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
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
                                                            className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all font-bold ${
                                                                paymentMethod === method.id
                                                                    ? 'bg-emerald-900 text-white border-emerald-900'
                                                                    : 'bg-stone-50 border-stone-200 text-stone-700'
                                                            }`}
                                                        >
                                                            <CreditCard className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                                                            <span className="text-[11px]">{method.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3 items-center justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() => setStep(2)}
                                                    className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center justify-center gap-1"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                    <span>Back to Catering</span>
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={isPending}
                                                    className="w-full sm:w-auto bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 shadow-lg"
                                                >
                                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4 text-amber-300" />}
                                                    Submit Provisional Draft
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </div>

                {/* Cancellation Confirmation Modal */}
                {showCancelModal && (
                    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 max-w-sm w-full space-y-4 text-center border border-stone-200 shadow-2xl">
                            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-300/60 shadow-inner">
                                <AlertTriangle className="w-6 h-6 text-amber-700" />
                            </div>

                            <div className="space-y-1">
                                <h4 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                                    Cancel Reservation?
                                </h4>
                                <p className="text-xs text-stone-500 leading-relaxed">
                                    Are you sure you want to cancel your reservation draft? Your time slot lock will be released and you will be redirected to the home page.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCancelModal(false)}
                                    className="py-3 px-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
                                >
                                    Keep Editing
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        router.push('/venues');
                                    }}
                                    className="py-3 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors"
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};