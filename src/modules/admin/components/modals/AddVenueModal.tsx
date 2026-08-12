'use client';

import React, { useState, useTransition } from 'react';
import { createVenue } from '../../actions/adminActions';
import {
    X,
    Plus,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Image as ImageIcon,
    Users,
    Tag,
    Clock,
    Trash2,
    Upload,
    Link as LinkIcon,
    Trees,
} from 'lucide-react';

interface AddVenueModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
}

// Resizes and compresses local uploads to prevent payload bloat
const compressImageFile = (file: File, maxWidth = 1600, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject('Failed to get canvas context');
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = (err) => reject(err);
            img.src = e.target?.result as string;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};

export const AddVenueModal: React.FC<AddVenueModalProps> = ({ isOpen, onClose, onRefresh }) => {
    const [isPending, startTransition] = useTransition();
    const [isCompressing, setIsCompressing] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const [name, setName] = useState('');
    const [basePrice, setBasePrice] = useState<number>(25000);
    const [slotDurationText, setSlotDurationText] = useState('/ 5-hr slot block');
    const [capacity, setCapacity] = useState<number>(150);
    const [description, setDescription] = useState('');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [newWebUrl, setNewWebUrl] = useState('');
    const [isActive, setIsActive] = useState(true);

    if (!isOpen) return null;

    // Local File Upload Handler
    const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsCompressing(true);
        setFeedback(null);

        try {
            const compressedImages = await Promise.all(
                Array.from(files).map((file) => compressImageFile(file))
            );
            setImageUrls((prev) => [...prev, ...compressedImages]);
        } catch {
            setFeedback({ type: 'error', text: 'Failed to process and compress selected images.' });
        } finally {
            setIsCompressing(false);
            e.target.value = '';
        }
    };

    // Add Web URL Handler
    const handleAddWebUrl = () => {
        if (!newWebUrl.trim()) return;
        setImageUrls((prev) => [...prev, newWebUrl.trim()]);
        setNewWebUrl('');
    };

    // Remove Image Handler
    const handleRemoveImage = (indexToRemove: number) => {
        setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const resetForm = () => {
        setName('');
        setBasePrice(25000);
        setSlotDurationText('/ 5-hr slot block');
        setCapacity(150);
        setDescription('');
        setImageUrls([]);
        setNewWebUrl('');
        setIsActive(true);
        setFeedback(null);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFeedback(null);

        if (imageUrls.length === 0) {
            setFeedback({ type: 'error', text: 'Please upload or add at least one cover photo for the new venue.' });
            return;
        }

        startTransition(async () => {
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');

            const res = await createVenue({
                name,
                slug,
                base_rental_rate_php: Number(basePrice),
                slot_duration_text: slotDurationText,
                max_guest_capacity: Number(capacity),
                description,
                image_urls: imageUrls,
                is_under_maintenance: !isActive,
                is_featured: false,
            });

            if (res.success) {
                setFeedback({ type: 'success', text: res.message || 'Venue added successfully!' });
                setTimeout(() => {
                    resetForm();
                    onRefresh();
                    onClose();
                }, 1000);
            } else {
                setFeedback({ type: 'error', text: res.message || 'Failed to add venue.' });
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="bg-emerald-950 px-5 py-4 text-white flex justify-between items-center border-b border-emerald-900 sticky top-0 z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-900 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm shrink-0">
                            <Trees className="w-4 h-4" />
                        </div>
                        <div>
              <span className="text-amber-300 text-[10px] font-bold uppercase tracking-widest block">
                Catalog Management
              </span>
                            <h3 className="font-serif text-lg sm:text-xl font-bold">Add New Venue Space</h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
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
                        {feedback.type === 'error' ? (
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        )}
                        <span>{feedback.text}</span>
                    </div>
                )}

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                    {/* Active / Inactive Status Toggle */}
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 flex items-center justify-between">
                        <div>
                            <span className="font-bold text-stone-900 block text-xs">Initial Availability Status</span>
                            <span className="text-[11px] text-stone-500">
                {isActive ? 'Publicly active for bookings immediately' : 'Hidden / Under Maintenance'}
              </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsActive(!isActive)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isActive ? 'bg-emerald-900' : 'bg-stone-300'
                            }`}
                        >
              <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
                        </button>
                    </div>

                    <div>
                        <label className="font-bold text-stone-700 block mb-1">Venue Space Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., Al Fresco Sunset Veranda"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-stone-700 block mb-1">Base Rental Price (₱)</label>
                            <div className="relative">
                                <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(Number(e.target.value))}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="font-bold text-stone-700 block mb-1">Duration Label</label>
                            <div className="relative">
                                <Clock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    required
                                    value={slotDurationText}
                                    onChange={(e) => setSlotDurationText(e.target.value)}
                                    placeholder="/ 5-hr slot block"
                                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-stone-700 block mb-1">Max Guest Capacity (PAX)</label>
                        <div className="relative">
                            <Users className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="number"
                                required
                                min={1}
                                value={capacity}
                                onChange={(e) => setCapacity(Number(e.target.value))}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                            />
                        </div>
                    </div>

                    {/* Multi-Photo Management */}
                    <div className="space-y-2.5 pt-1 border-t border-stone-100">
                        <div className="flex items-center justify-between">
                            <label className="font-bold text-stone-900 block text-xs flex items-center gap-1.5">
                                <ImageIcon className="w-4 h-4 text-emerald-800" />
                                <span>Showcase Cover Photos ({imageUrls.length})</span>
                            </label>
                            {isCompressing && (
                                <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Optimizing images...
                </span>
                            )}
                        </div>

                        {/* Photo Previews Grid */}
                        {imageUrls.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                                {imageUrls.map((url, idx) => (
                                    <div key={idx} className="relative group aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 shadow-sm border border-stone-200">
                                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(idx)}
                                            className="absolute top-1 right-1 bg-stone-950/80 text-white p-1 rounded-full opacity-90 sm:opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                                            title="Remove Photo"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                        {idx === 0 && (
                                            <span className="absolute bottom-1 left-1 bg-emerald-900 text-amber-300 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase">
                        Cover
                      </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[11px] text-stone-400 italic bg-stone-50 p-3 rounded-xl border border-stone-200 text-center">
                                Upload local photo files or paste web image links below.
                            </p>
                        )}

                        {/* Upload Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            <label className="cursor-pointer bg-emerald-900/10 hover:bg-emerald-900/20 text-emerald-900 font-bold px-3.5 py-2.5 rounded-xl border border-emerald-900/30 flex items-center justify-center gap-2 transition-colors">
                                <Upload className="w-3.5 h-3.5 text-amber-600" />
                                <span>Upload Local Photos</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleLocalFileUpload}
                                    disabled={isCompressing}
                                    className="hidden"
                                />
                            </label>

                            <div className="flex items-center gap-1.5">
                                <div className="relative flex-1">
                                    <LinkIcon className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="url"
                                        placeholder="Paste Image URL"
                                        value={newWebUrl}
                                        onChange={(e) => setNewWebUrl(e.target.value)}
                                        className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-8 pr-2 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddWebUrl}
                                    disabled={!newWebUrl.trim()}
                                    className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold p-2.5 rounded-xl disabled:opacity-40 transition-colors"
                                    title="Add Web URL"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-stone-700 block mb-1">Description</label>
                        <textarea
                            rows={3}
                            required
                            placeholder="Describe the ambiance, seating layouts, air-conditioning, and special features..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                        />
                    </div>

                    <div className="pt-3 grid grid-cols-2 gap-2.5 border-t border-stone-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-3 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || isCompressing}
                            className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-3 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md"
                        >
                            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 text-amber-300" />}
                            Create Venue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};