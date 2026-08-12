import Link from 'next/link';
import {
    MapPin,
    ArrowRight,
    Utensils,
    Trees,
    Heart,
    ShieldCheck,
    ChevronDown,
    Sparkles,
    Calendar,
    Star,
    Award,
    Users2,
    PartyPopper,
    Crown,
    Music,
    Flower2,
    Building2,
    BadgeCheck,
    ThumbsUp,
} from 'lucide-react';
import { getVenues } from '@/modules/events/actions/venueActions';
import { getSiteSettings } from '@/modules/admin/actions/adminActions';
import { VenueGrid } from '@/modules/events/components/VenueGrid';

// Dynamic Icon Map for Event Venue Themes & Social Proof
const ICON_MAP: Record<string, React.ElementType> = {
    Sparkles,
    PartyPopper,
    Trees,
    Heart,
    Crown,
    Calendar,
    Utensils,
    Music,
    Flower2,
    Building2,
    Star,
    Award,
    Users2,
    ShieldCheck,
    BadgeCheck,
    ThumbsUp,
    MapPin,
};

export default async function HomePage() {
    const [venuesResponse, settingsResponse] = await Promise.all([
        getVenues(),
        getSiteSettings(),
    ]);

    const venues = venuesResponse.data || [];
    const settings = settingsResponse.data || {
        top_banner_text: 'Maramba Blvd., Libsong West, Lingayen, Pangasinan — Open for 2026/2027 Event Reservations',
        business_name: 'Regina’s Garden',
        business_subtitle: '& Restaurant',
        nav_link_1_label: 'Event Spaces',
        nav_link_2_label: 'Services & Catering',
        nav_link_3_label: 'Our Ambiance',
        nav_cta_button_text: 'Check Availability',
        hero_season_badge_text: 'Booking 2026 / 2027 Seasons',
        hero_season_badge_icon: 'Sparkles',
        hero_headline_main: 'It’s not a celebration,',
        hero_headline_highlight: 'unless it’s Regina’s.',
        hero_subtitle: 'Host your dream garden wedding, 18th debut, baptismal reception, or corporate banquet nestled in Lingayen’s premier pavilion venue.',
        hero_cta_button_text: 'Reserve an Event Space',
        hero_scroll_label: 'SCROLL TO EXPLORE',
        show_social_proof_bar: true,
        proof_1_text: '4.9★ Rated Venue in Pangasinan',
        proof_1_icon: 'Star',
        proof_2_text: '100% In-House Buffet Catering',
        proof_2_icon: 'Award',
        proof_3_text: '1,200+ Celebrations Hosted',
        proof_3_icon: 'Users2',
    };

    // Resolve dynamic icon components
    const BadgeIconComponent = ICON_MAP[settings.hero_season_badge_icon || 'Sparkles'] || Sparkles;
    const Proof1IconComponent = ICON_MAP[settings.proof_1_icon || 'Star'] || Star;
    const Proof2IconComponent = ICON_MAP[settings.proof_2_icon || 'Award'] || Award;
    const Proof3IconComponent = ICON_MAP[settings.proof_3_icon || 'Users2'] || Users2;

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-amber-200 selection:text-emerald-950 overflow-x-hidden w-full">
            {/* 1. Top Location Banner */}
            <div className="bg-emerald-950 py-2 px-3 sm:px-4 text-center text-[10px] sm:text-xs text-amber-200 font-medium flex items-center justify-center gap-1.5 border-b border-emerald-900/60 tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate max-w-[340px] sm:max-w-none">
          {settings.top_banner_text}
        </span>
            </div>

            {/* 2. Responsive Header */}
            <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-sm transition-all">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
                    <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-900 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm group-hover:bg-emerald-950 transition-all">
                            <Trees className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
              <span className="font-serif font-bold text-sm sm:text-base text-emerald-950 tracking-wide block leading-none">
                {settings.business_name}
              </span>
                            <span className="text-[9px] sm:text-[10px] text-amber-700 font-sans tracking-widest uppercase block mt-0.5 font-bold">
                {settings.business_subtitle}
              </span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-stone-600">
                        <a href="#venues-section" className="hover:text-emerald-900 transition-colors">
                            {settings.nav_link_1_label}
                        </a>
                        <a href="#feature-cards" className="hover:text-emerald-900 transition-colors">
                            {settings.nav_link_2_label}
                        </a>
                        <a href="#venues-section" className="hover:text-emerald-900 transition-colors">
                            {settings.nav_link_3_label}
                        </a>
                    </nav>

                    {/* Header Action Button */}
                    <Link
                        href="/venues"
                        className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs transition-all shadow-md hover:shadow-emerald-900/20 flex items-center justify-center gap-1.5 shrink-0 leading-none"
                    >
                        <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span className="hidden sm:inline">{settings.nav_cta_button_text}</span>
                        <span className="sm:hidden">Reserve</span>
                    </Link>
                </div>
            </header>

            {/* 3. Hero Section */}
            <section className="relative min-h-[82vh] sm:min-h-[88vh] w-full flex flex-col justify-center items-center px-4 sm:px-6 py-6 sm:py-8 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2000&q=85')`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-50/90 via-stone-900/30 to-stone-900/20" />

                {/* Hero Card */}
                <div className="relative z-10 max-w-2xl w-full text-center my-auto">
                    <div className="bg-white/80 backdrop-blur-md p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-white/70 shadow-[0_15px_40px_rgba(0,0,0,0.12)] space-y-4 sm:space-y-5 mx-auto">

                        <div className="inline-flex items-center gap-1.5 bg-emerald-900/10 border border-emerald-900/20 px-3 py-1 rounded-full text-emerald-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                            <BadgeIconComponent className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
                            <span>{settings.hero_season_badge_text}</span>
                        </div>

                        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-snug sm:leading-tight">
                            <span className="text-amber-700/80 font-normal font-serif text-xl sm:text-3xl mr-0.5 inline-block -translate-y-1 sm:-translate-y-2">“</span>
                            {settings.hero_headline_main} <br className="hidden sm:inline" />
                            <span className="text-amber-700 italic font-serif font-bold">
                {settings.hero_headline_highlight}
              </span>
                            <span className="text-amber-700/80 font-normal font-serif text-xl sm:text-3xl ml-0.5 inline-block -translate-y-1 sm:-translate-y-2">”</span>
                        </h1>

                        <p className="text-stone-700 text-xs sm:text-sm font-medium leading-relaxed max-w-lg mx-auto tracking-wide">
                            {settings.hero_subtitle}
                        </p>

                        <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href="/venues"
                                className="group relative w-full sm:w-auto bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-7 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-emerald-900/20 text-xs sm:text-sm flex items-center justify-center gap-2.5 active:scale-95"
                            >
                                <span>{settings.hero_cta_button_text}</span>
                                <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="relative z-10 mt-3 mb-1 flex flex-col items-center gap-1 text-center">
                    <a
                        href={settings.show_social_proof_bar ? '#social-proof' : '#feature-cards'}
                        className="flex flex-col items-center gap-1 text-stone-700 hover:text-emerald-950 transition-colors animate-bounce text-[10px] sm:text-[11px] font-bold tracking-widest uppercase"
                    >
                        <span>{settings.hero_scroll_label}</span>
                        <ChevronDown className="w-4 h-4 text-emerald-800" />
                    </a>
                </div>
            </section>

            {/* 4. Social Proof Trust Bar (Conditionally Rendered) */}
            {settings.show_social_proof_bar !== false && (
                <section id="social-proof" className="py-5 bg-emerald-950 text-white border-y border-emerald-900">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs font-semibold">
                            <Proof1IconComponent className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{settings.proof_1_text}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs font-semibold border-t sm:border-t-0 sm:border-x border-emerald-900/80 pt-2 sm:pt-0">
                            <Proof2IconComponent className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{settings.proof_2_text}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs font-semibold border-t sm:border-t-0 border-emerald-900/80 pt-2 sm:pt-0">
                            <Proof3IconComponent className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{settings.proof_3_text}</span>
                        </div>
                    </div>
                </section>
            )}

            {/* 5. Clickable Feature Cards */}
            <section id="feature-cards" className="py-10 sm:py-16 bg-white border-b border-stone-200/80">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                        { title: 'Lush Garden Pavilions', desc: 'Open-Air & Glass Function Spaces', icon: Trees },
                        { title: 'In-House Buffet Catering', desc: 'Signature Pangasinan Filipino Feasts', icon: Utensils },
                        { title: 'Weddings & Debuts', desc: 'Full Stage & Ambient DMX Lighting', icon: Heart },
                        { title: 'Flexible Payments', desc: 'GCash, Maya & Bank Transfers', icon: ShieldCheck },
                    ].map((item, idx) => (
                        <a
                            key={idx}
                            href="#venues-section"
                            className="group p-5 sm:p-7 bg-stone-50/80 rounded-2xl sm:rounded-3xl border-0 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 text-center flex flex-col justify-between items-center cursor-pointer min-h-[150px]"
                        >
                            <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 mx-auto group-hover:scale-110 transition-transform duration-300 shrink-0" />
                            <div className="space-y-1.5 w-full">
                                <h4 className="font-serif font-bold text-sm sm:text-base leading-snug text-stone-900 group-hover:text-emerald-900 transition-colors">
                                    {item.title}
                                </h4>
                                <p className="text-[11px] sm:text-xs leading-relaxed text-stone-500 font-medium">
                                    {item.desc}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            {/* 6. Venue Selection Grid */}
            <section id="venues-section" className="py-10 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-8 sm:space-y-10 bg-stone-50">
                <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-emerald-800 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest block">
            FUNCTION HALLS & GARDEN GROUNDS
          </span>
                    <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
                        Select Your Venue Space
                    </h2>
                </div>

                <VenueGrid venues={venues} />

                <div className="pt-2 text-center">
                    <Link
                        href="/venues"
                        className="inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-900 hover:text-white text-emerald-950 font-bold px-8 py-3.5 sm:py-4 rounded-2xl border border-stone-200 shadow-md hover:shadow-xl transition-all duration-300 text-xs sm:text-sm group"
                    >
                        <span>View Full Venue Directory</span>
                        <ArrowRight className="w-4 h-4 text-amber-600 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
                    </Link>
                </div>
            </section>
        </div>
    );
}