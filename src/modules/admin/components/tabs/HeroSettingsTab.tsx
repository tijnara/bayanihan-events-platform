'use client';

import React, { useState, useTransition } from 'react';
import { SiteSettings } from '@/modules/shared/types/database.types';
import { updateSiteSettings } from '../../actions/adminActions';
import {
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Calendar,
    PartyPopper,
    Trees,
    Crown,
    Heart,
    Utensils,
    Music,
    Flower2,
    Building2,
    Star,
    Award,
    Users2,
    ShieldCheck,
    ThumbsUp,
    MapPin,
    Eye,
    EyeOff,
    Layout,
    Type,
    BadgeCheck,
} from 'lucide-react';

interface HeroSettingsTabProps {
    settings: SiteSettings;
    onRefresh: () => void;
}

// Curated Event Place / Venue Icon Options for Season Badge
const VENUE_ICON_OPTIONS = [
    { value: 'Sparkles', label: '✨ Sparkles (Celebratory)', icon: Sparkles },
    { value: 'PartyPopper', label: '🎉 Party Popper (Festive & Banquets)', icon: PartyPopper },
    { value: 'Trees', label: '🌳 Trees (Outdoor Garden Pavilion)', icon: Trees },
    { value: 'Heart', label: '❤️ Heart (Garden Weddings & Receptions)', icon: Heart },
    { value: 'Crown', label: '👑 Crown (18th Debuts & Royal Parties)', icon: Crown },
    { value: 'Calendar', label: '📅 Calendar (Reservations & Season Booking)', icon: Calendar },
    { value: 'Utensils', label: '🍽️ Utensils (In-House Buffet Catering)', icon: Utensils },
    { value: 'Music', label: '🎵 Music (Live Band & Sounds/Lights Styling)', icon: Music },
    { value: 'Flower2', label: '🌸 Flower (Botanical & Floral Theme)', icon: Flower2 },
    { value: 'Building2', label: '🏛️ Building (Grand Function Glass Hall)', icon: Building2 },
    { value: 'Star', label: '⭐ Star (Premier / Flagship Showcase)', icon: Star },
];

// Curated Social Proof Icon Options
const PROOF_ICON_OPTIONS = [
    { value: 'Star', label: '⭐ Star Rating (Reviews & Ratings)', icon: Star },
    { value: 'Award', label: '🏆 Award / Trophy (Quality & Catering)', icon: Award },
    { value: 'Users2', label: '👥 Users / Guests (Celebrations & Clients)', icon: Users2 },
    { value: 'ShieldCheck', label: '🛡️ Shield Check (Secured & Trusted)', icon: ShieldCheck },
    { value: 'BadgeCheck', label: '🏅 Badge Check (Verified Venue)', icon: BadgeCheck },
    { value: 'ThumbsUp', label: '👍 Thumbs Up (Customer Approval)', icon: ThumbsUp },
    { value: 'Heart', label: '❤️ Heart (Loved Receptions & Debuts)', icon: Heart },
    { value: 'MapPin', label: '📍 Map Pin (Location & Destination)', icon: MapPin },
    { value: 'Utensils', label: '🍽️ Utensils (In-House Buffet Feasts)', icon: Utensils },
    { value: 'Trees', label: '🌳 Trees (Lush Garden Grounds)', icon: Trees },
    { value: 'Building2', label: '🏛️ Function Hall (Indoor Venues)', icon: Building2 },
];

export const HeroSettingsTab: React.FC<HeroSettingsTabProps> = ({ settings, onRefresh }) => {
    const [formData, setFormData] = useState<SiteSettings>(settings);
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const handleChange = (field: keyof SiteSettings, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFeedback(null);

        startTransition(async () => {
            const res = await updateSiteSettings(formData);
            if (res.success) {
                setFeedback({ type: 'success', text: res.message || 'Updated!' });
                onRefresh();
            } else {
                setFeedback({ type: 'error', text: res.message || 'Failed to save.' });
            }
        });
    };

    const SelectedSeasonIconComponent =
        VENUE_ICON_OPTIONS.find((opt) => opt.value === (formData.hero_season_badge_icon || 'Sparkles'))?.icon ||
        Sparkles;

    const getProofIconComponent = (iconName: string) => {
        return PROOF_ICON_OPTIONS.find((opt) => opt.value === iconName)?.icon || Star;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto font-sans">
            {/* Sticky Save Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-sm sticky top-20 z-20">
                <div>
                    <h3 className="font-serif font-bold text-base text-stone-900">Hero Section & Branding Editor</h3>
                    <p className="text-xs text-stone-500">Edit business labels, main headlines, social proof trust items, and CTA text in real-time.</p>
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-amber-300" />}
                    <span>Save Changes</span>
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

            {/* 1. Header Navigation & Branding */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <h4 className="font-serif font-bold text-sm text-emerald-950 border-b border-stone-100 pb-2 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-amber-600" />
                    <span>Branding & Header Navigation</span>
                </h4>

                <div className="space-y-3 text-xs">
                    <div>
                        <label className="font-bold text-stone-700 block mb-1">Top Announcement Banner Bar</label>
                        <input
                            type="text"
                            value={formData.top_banner_text || ''}
                            onChange={(e) => handleChange('top_banner_text', e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-stone-700 block mb-1">Business Name</label>
                            <input
                                type="text"
                                value={formData.business_name || ''}
                                onChange={(e) => handleChange('business_name', e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                            />
                        </div>
                        <div>
                            <label className="font-bold text-stone-700 block mb-1">Business Subtitle</label>
                            <input
                                type="text"
                                value={formData.business_subtitle || ''}
                                onChange={(e) => handleChange('business_subtitle', e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="font-bold text-stone-700 block mb-1">Nav Link 1 Label</label>
                            <input
                                type="text"
                                value={formData.nav_link_1_label || ''}
                                onChange={(e) => handleChange('nav_link_1_label', e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                            />
                        </div>
                        <div>
                            <label className="font-bold text-stone-700 block mb-1">Nav Link 2 Label</label>
                            <input
                                type="text"
                                value={formData.nav_link_2_label || ''}
                                onChange={(e) => handleChange('nav_link_2_label', e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                            />
                        </div>
                        <div>
                            <label className="font-bold text-stone-700 block mb-1">Nav Link 3 Label</label>
                            <input
                                type="text"
                                value={formData.nav_link_3_label || ''}
                                onChange={(e) => handleChange('nav_link_3_label', e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-stone-700 block mb-1">Header Button Label</label>
                        <input
                            type="text"
                            value={formData.nav_cta_button_text || ''}
                            onChange={(e) => handleChange('nav_cta_button_text', e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* 2. Main Hero Content */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <h4 className="font-serif font-bold text-sm text-emerald-950 border-b border-stone-100 pb-2 flex items-center gap-2">
                    <Type className="w-4 h-4 text-amber-600" />
                    <span>Hero Card & Tagline Content</span>
                </h4>

                <div className="space-y-4 text-xs">
                    {/* Season Pill Badge Label + Icon Selector Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <div>
                            <label className="font-bold text-stone-700 block mb-1">Season Pill Badge Text</label>
                            <input
                                type="text"
                                value={formData.hero_season_badge_text || ''}
                                onChange={(e) => handleChange('hero_season_badge_text', e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                            />
                        </div>

                        <div>
                            <label className="font-bold text-stone-700 block mb-1">
                                Badge Icon (Event Place Themes)
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-emerald-900/10 border border-emerald-900/20 flex items-center justify-center text-emerald-900 shrink-0">
                                    <SelectedSeasonIconComponent className="w-5 h-5 text-amber-600" />
                                </div>
                                <select
                                    value={formData.hero_season_badge_icon || 'Sparkles'}
                                    onChange={(e) => handleChange('hero_season_badge_icon', e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-bold text-stone-800"
                                >
                                    {VENUE_ICON_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-stone-700 block mb-1">Headline Main (First Line)</label>
                            <input
                                type="text"
                                value={formData.hero_headline_main || ''}
                                onChange={(e) => handleChange('hero_headline_main', e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                            />
                        </div>
                        <div>
                            <label className="font-bold text-stone-700 block mb-1">Headline Highlight (Italic Second Line)</label>
                            <input
                                type="text"
                                value={formData.hero_headline_highlight || ''}
                                onChange={(e) => handleChange('hero_headline_highlight', e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-stone-700 block mb-1">Subtitle / Description</label>
                        <textarea
                            rows={3}
                            value={formData.hero_subtitle || ''}
                            onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-stone-700 block mb-1">Hero CTA Button Label</label>
                            <input
                                type="text"
                                value={formData.hero_cta_button_text || ''}
                                onChange={(e) => handleChange('hero_cta_button_text', e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                            />
                        </div>
                        <div>
                            <label className="font-bold text-stone-700 block mb-1">Scroll Indicator Label</label>
                            <input
                                type="text"
                                value={formData.hero_scroll_label || ''}
                                onChange={(e) => handleChange('hero_scroll_label', e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. NEW: Social Proof Trust Bar Section (Editable & Toggleable) */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h4 className="font-serif font-bold text-sm text-emerald-950 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span>Social Proof Trust Bar</span>
                    </h4>

                    {/* Show/Hide Section Toggle Switch */}
                    <button
                        type="button"
                        onClick={() => handleChange('show_social_proof_bar', !formData.show_social_proof_bar)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            formData.show_social_proof_bar
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-stone-100 text-stone-500 border border-stone-200'
                        }`}
                    >
                        {formData.show_social_proof_bar ? (
                            <>
                                <Eye className="w-3.5 h-3.5 text-emerald-800" />
                                <span>Visible on Landing Page</span>
                            </>
                        ) : (
                            <>
                                <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                                <span>Hidden from Landing Page</span>
                            </>
                        )}
                    </button>
                </div>

                {formData.show_social_proof_bar ? (
                    <div className="space-y-4 text-xs pt-1">
                        {/* Proof Item 1 */}
                        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                            <span className="font-bold text-stone-700 block">Trust Highlight #1</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                <div className="sm:col-span-2">
                                    <input
                                        type="text"
                                        value={formData.proof_1_text || ''}
                                        onChange={(e) => handleChange('proof_1_text', e.target.value)}
                                        placeholder="Proof text (e.g., 4.9★ Rated Venue in Pangasinan)"
                                        className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-950 flex items-center justify-center text-amber-400 shrink-0">
                                        {React.createElement(getProofIconComponent(formData.proof_1_icon || 'Star'), { className: 'w-4 h-4' })}
                                    </div>
                                    <select
                                        value={formData.proof_1_icon || 'Star'}
                                        onChange={(e) => handleChange('proof_1_icon', e.target.value)}
                                        className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-bold text-stone-800 text-xs"
                                    >
                                        {PROOF_ICON_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Proof Item 2 */}
                        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                            <span className="font-bold text-stone-700 block">Trust Highlight #2</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                <div className="sm:col-span-2">
                                    <input
                                        type="text"
                                        value={formData.proof_2_text || ''}
                                        onChange={(e) => handleChange('proof_2_text', e.target.value)}
                                        placeholder="Proof text (e.g., 100% In-House Buffet Catering)"
                                        className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-950 flex items-center justify-center text-amber-400 shrink-0">
                                        {React.createElement(getProofIconComponent(formData.proof_2_icon || 'Award'), { className: 'w-4 h-4' })}
                                    </div>
                                    <select
                                        value={formData.proof_2_icon || 'Award'}
                                        onChange={(e) => handleChange('proof_2_icon', e.target.value)}
                                        className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-bold text-stone-800 text-xs"
                                    >
                                        {PROOF_ICON_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Proof Item 3 */}
                        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                            <span className="font-bold text-stone-700 block">Trust Highlight #3</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                <div className="sm:col-span-2">
                                    <input
                                        type="text"
                                        value={formData.proof_3_text || ''}
                                        onChange={(e) => handleChange('proof_3_text', e.target.value)}
                                        placeholder="Proof text (e.g., 1,200+ Celebrations Hosted)"
                                        className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-medium"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-950 flex items-center justify-center text-amber-400 shrink-0">
                                        {React.createElement(getProofIconComponent(formData.proof_3_icon || 'Users2'), { className: 'w-4 h-4' })}
                                    </div>
                                    <select
                                        value={formData.proof_3_icon || 'Users2'}
                                        onChange={(e) => handleChange('proof_3_icon', e.target.value)}
                                        className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-bold text-stone-800 text-xs"
                                    >
                                        {PROOF_ICON_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-4 text-center bg-stone-50 rounded-xl border border-stone-200 text-stone-500 text-xs">
                        The social proof bar is currently hidden. Click "Hidden from Landing Page" above to enable it.
                    </div>
                )}
            </div>
        </form>
    );
};