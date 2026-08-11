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
} from 'lucide-react';
import { getVenues } from '@/modules/events/actions/venueActions';
import { VenueGrid } from '@/modules/events/components/VenueGrid';

export default async function HomePage() {
    const venuesResponse = await getVenues();
    const venues = venuesResponse.data || [];

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-amber-200 selection:text-emerald-950">
            {/* 1. Slim Location Bar */}
            <div className="bg-emerald-950 py-1.5 px-4 text-center text-[11px] text-amber-200 font-medium flex items-center justify-center gap-2 tracking-wide border-b border-emerald-900/60">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Maramba Blvd., Libsong West, Lingayen, Pangasinan — Open for 2026/2027 Event Reservations</span>
            </div>

            {/* 2. Floating Navbar with Logo Gold Ring & Champagne Button */}
            <header className="sticky top-0 z-40 w-full bg-stone-900/85 backdrop-blur-md border-b border-stone-800/60 transition-all">
                <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        {/* Logo ring & subtle glow */}
                        <div className="w-9 h-9 rounded-xl bg-emerald-900 border border-amber-400/50 flex items-center justify-center text-amber-300 ring-1 ring-amber-400/30 shadow-md group-hover:bg-emerald-800 transition-all">
                            <Trees className="w-5 h-5" />
                        </div>
                        <div>
              <span className="font-serif font-bold text-base text-white tracking-wide block leading-none">
                Regina’s Garden
              </span>
                            <span className="text-[10px] text-amber-300/90 font-sans tracking-widest uppercase block mt-0.5">
                & Restaurant
              </span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-stone-300">
                        <a href="#venues-section" className="hover:text-amber-300 transition-colors">
                            Event Spaces
                        </a>
                        <a href="#feature-cards" className="hover:text-amber-300 transition-colors">
                            Catering & Packages
                        </a>
                        <a href="#about" className="hover:text-amber-300 transition-colors">
                            Our Ambiance
                        </a>
                    </nav>

                    {/* Champagne-Gold Action Button */}
                    <Link
                        href="/venues"
                        className="bg-amber-300 hover:bg-amber-400 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md hover:shadow-amber-400/20 flex items-center gap-2"
                    >
                        <Calendar className="w-3.5 h-3.5 text-stone-950" />
                        <span>Check Slot Availability</span>
                    </Link>
                </div>
            </header>

            {/* 3. Full-Bleed Hero Section */}
            <section className="relative min-h-[85vh] w-full flex flex-col justify-center items-center px-4 md:px-6 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2000&q=85')`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/40" />

                {/* Floating Glassmorphic Card */}
                <div className="relative z-10 max-w-3xl w-full text-center my-auto py-8">
                    <div className="bg-white/85 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6">
                        <div className="inline-flex items-center gap-2 bg-emerald-950/90 border border-amber-400/40 px-4 py-1.5 rounded-full text-amber-300 text-xs font-semibold tracking-wider uppercase shadow-inner">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span>📅 Currently booking for 2026/2027 seasons</span>
                        </div>

                        <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
                            “It’s not a celebration, <br />
                            <span className="text-amber-700 italic font-serif font-bold">
                unless it’s Regina’s.”
              </span>
                        </h1>

                        <p className="text-stone-700 text-sm md:text-base font-medium leading-relaxed max-w-xl mx-auto tracking-wide">
                            Host your dream garden wedding, 18th debut, baptismal reception, or corporate banquet nestled in Lingayen’s premiere pavilion venue.
                        </p>

                        <div className="pt-2 flex justify-center">
                            <Link
                                href="/venues"
                                className="group relative bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(4,120,87,0.35)] hover:scale-[1.02] text-sm flex items-center gap-2.5"
                            >
                                <span>Reserve an Event Space</span>
                                <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1.5 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Downward Scroll Cue */}
                <a
                    href="#feature-cards"
                    className="relative z-10 mb-6 flex flex-col items-center gap-1 text-amber-200/90 hover:text-amber-300 transition-colors animate-bounce text-[11px] font-bold tracking-widest uppercase"
                >
                    <span>Scroll to Explore</span>
                    <ChevronDown className="w-5 h-5 text-amber-400" />
                </a>
            </section>

            {/* 4. Clickable Floating Core Feature Cards */}
            <section id="feature-cards" className="py-16 bg-white border-b border-stone-200">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <a
                        href="#venues-section"
                        className="group p-8 bg-white rounded-3xl border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 text-center space-y-3 cursor-pointer"
                    >
                        <Trees className="w-8 h-8 text-amber-600 mx-auto group-hover:scale-110 transition-transform" />
                        <h4 className="font-serif font-bold text-base text-stone-900 group-hover:text-emerald-900 transition-colors">
                            Lush Garden Pavilions
                        </h4>
                        <p className="text-xs text-stone-500 leading-relaxed">
                            Open-Air & Glass Function Spaces
                        </p>
                    </a>

                    <a
                        href="#venues-section"
                        className="group p-8 bg-white rounded-3xl border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 text-center space-y-3 cursor-pointer"
                    >
                        <Utensils className="w-8 h-8 text-amber-600 mx-auto group-hover:scale-110 transition-transform" />
                        <h4 className="font-serif font-bold text-base text-stone-900 group-hover:text-emerald-900 transition-colors">
                            In-House Buffet Catering
                        </h4>
                        <p className="text-xs text-stone-500 leading-relaxed">
                            Signature Pangasinan Filipino Feasts
                        </p>
                    </a>

                    <a
                        href="#venues-section"
                        className="group p-8 bg-white rounded-3xl border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 text-center space-y-3 cursor-pointer"
                    >
                        <Heart className="w-8 h-8 text-amber-600 mx-auto group-hover:scale-110 transition-transform" />
                        <h4 className="font-serif font-bold text-base text-stone-900 group-hover:text-emerald-900 transition-colors">
                            Weddings & Debuts
                        </h4>
                        <p className="text-xs text-stone-500 leading-relaxed">
                            Full Stage & Ambient DMX Lighting
                        </p>
                    </a>

                    <a
                        href="#venues-section"
                        className="group p-8 bg-white rounded-3xl border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 text-center space-y-3 cursor-pointer"
                    >
                        <ShieldCheck className="w-8 h-8 text-amber-600 mx-auto group-hover:scale-110 transition-transform" />
                        <h4 className="font-serif font-bold text-base text-stone-900 group-hover:text-emerald-900 transition-colors">
                            Instant Downpayment
                        </h4>
                        <p className="text-xs text-stone-500 leading-relaxed">
                            GCash, Maya & Bank Transfers
                        </p>
                    </a>
                </div>
            </section>

            {/* 5. Aligned Venue Space Selection Grid */}
            <section id="venues-section" className="py-20 px-6 max-w-6xl mx-auto space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
                    <div>
            <span className="text-emerald-800 text-xs font-extrabold uppercase tracking-widest block mb-1">
              FUNCTION HALLS & GARDEN GROUNDS
            </span>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
                            Select Your Venue Space
                        </h2>
                    </div>

                    <Link
                        href="/venues"
                        className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1.5 underline underline-offset-4 shrink-0"
                    >
                        <span>View Full Directory</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <VenueGrid venues={venues} />
            </section>
        </div>
    );
}