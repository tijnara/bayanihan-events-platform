'use client';

import React, { useTransition, useState } from 'react';
import { X, CheckCircle2, XCircle, Loader2, Mail, Phone, Calendar } from 'lucide-react';
import { EventBookingRecord, EventBookingStatus } from '@/modules/shared/types/database.types';
import { updateBookingStatus } from '../../actions/adminActions';

interface VerifyReceiptModalProps {
    booking: EventBookingRecord | null;
    onClose: () => void;
    onRefresh: () => void;
}

export const VerifyReceiptModal: React.FC<VerifyReceiptModalProps> = ({
                                                                          booking,
                                                                          onClose,
                                                                          onRefresh,
                                                                      }) => {
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    if (!booking) return null;

    const handleStatusChange = (newStatus: EventBookingStatus) => {
        setFeedback(null);
        startTransition(async () => {
            const res = await updateBookingStatus(booking.id, newStatus);
            if (res.success) {
                setFeedback({ type: 'success', text: res.message || 'Status updated!' });
                setTimeout(() => {
                    onRefresh();
                    onClose();
                }, 1200);
            } else {
                setFeedback({ type: 'error', text: res.message || 'Action failed.' });
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto font-sans">
                {/* Header */}
                <div className="bg-emerald-950 px-5 py-4 text-white flex justify-between items-center border-b border-emerald-900 sticky top-0 z-10">
                    <div>
            <span className="text-amber-300 text-[9px] font-bold uppercase tracking-widest block">
              Payment Deposit Verification
            </span>
                        <h3 className="font-serif text-lg sm:text-xl font-bold">{booking.id}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-white transition-colors p-1 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Feedback Alert */}
                {feedback && (
                    <div
                        className={`p-3.5 mx-5 mt-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                            feedback.type === 'error'
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        }`}
                    >
                        {feedback.type === 'error' ? <XCircle className="w-4 h-4 text-red-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                        <span>{feedback.text}</span>
                    </div>
                )}

                {/* Modal Body */}
                <div className="p-5 space-y-4 text-xs">
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
                        <p className="font-bold text-stone-900 text-sm flex items-center justify-between">
                            <span>{booking.organizer_name}</span>
                            <span className="uppercase text-[9px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                {booking.payment_method.replace('_', ' ')}
              </span>
                        </p>
                        <p className="text-stone-600 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-emerald-800 shrink-0" /> {booking.organizer_email}
                        </p>
                        <p className="text-stone-600 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-emerald-800 shrink-0" /> {booking.organizer_phone}
                        </p>
                        <p className="text-stone-600 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-emerald-800 shrink-0" /> {booking.event_date} ({booking.slot_block.replace('_', ' ')})
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-stone-700">
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                            <span className="text-[9px] uppercase text-stone-400 font-bold block">Total Event Cost</span>
                            <span className="font-serif font-bold text-xs sm:text-sm text-stone-900">₱{Number(booking.total_amount_php).toLocaleString()}</span>
                        </div>
                        <div className="bg-emerald-900 text-white p-3 rounded-xl border border-emerald-950">
                            <span className="text-[9px] uppercase text-amber-300 font-bold block">Required Deposit</span>
                            <span className="font-serif font-bold text-xs sm:text-sm text-amber-200">₱{Number(booking.required_deposit_php).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="border-t border-stone-200 pt-3 flex items-center justify-between">
                        <span className="text-stone-500">Current Status:</span>
                        <span className="font-bold uppercase text-[10px] px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
              {booking.status.replace('_', ' ')}
            </span>
                    </div>

                    <div className="pt-2 grid grid-cols-2 gap-2.5">
                        <button
                            onClick={() => handleStatusChange('confirmed')}
                            disabled={isPending || booking.status === 'confirmed'}
                            className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-3 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-md"
                        >
                            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />}
                            Approve
                        </button>
                        <button
                            onClick={() => handleStatusChange('cancelled')}
                            disabled={isPending || booking.status === 'cancelled'}
                            className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-bold py-3 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
                        >
                            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5 text-red-600" />}
                            Reject / Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};