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
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-amber-200 selection:text-emerald-950 overflow-x-hidden w-full">
            {/* 1. Top Location Banner */}
            <div className="bg-emerald-950 py-2 px-4 text-center text-[10px] sm:text-xs text-amber-200 font-medium flex items-center justify-center gap-1.5 border-b border-emerald-900/60 tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate max-w-[340px] sm:max-w-none">
          Maramba Blvd., Libsong West, Lingayen, Pangasinan — Now Booking 2026/2027 Seasons
        </span>
            </div>

            {/* 2. Bright Floating Header */}
            <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-sm transition-all">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                    <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-900 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm group-hover:bg-emerald-950 transition-all">
                            <Trees className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
              <span className="font-serif font-bold text-sm sm:text-base text-emerald-950 tracking-wide block leading-none">
                Regina’s Garden
              </span>
                            <span className="text-[9px] sm:text-[10px] text-amber-700 font-sans tracking-widest uppercase block mt-0.5 font-bold">
                & Restaurant
              </span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-stone-600">
                        <a href="#venues-section" className="hover:text-emerald-900 transition-colors">
                            Event Spaces
                        </a>
                        <a href="#feature-cards" className="hover:text-emerald-900 transition-colors">
                            Services & Catering
                        </a>
                        <a href="#venues-section" className="hover:text-emerald-900 transition-colors">
                            Our Ambiance
                        </a>
                    </nav>

                    {/* Action Button */}
                    <Link
                        href="/venues"
                        className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs transition-all shadow-md hover:shadow-emerald-900/20 flex items-center gap-1.5 shrink-0"
                    >
                        <Calendar className="w-3.5 h-3.5 text-amber-300" />
                        <span>Check Availability</span>
                    </Link>
                </div>
            </header>

            {/* 3. Bright, Sunlit Hero Section with Glass Card */}
            <section className="relative min-h-[82vh] sm:min-h-[88vh] w-full flex flex-col justify-center items-center px-4 sm:px-6 py-8 overflow-hidden">
                {/* Widescreen Venue Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2000&q=85')`,
                    }}
                />
                {/* Soft, Light Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-stone-900/40 to-stone-900/20" />

                {/* Floating Light Glass Card */}
                <div className="relative z-10 max-w-3xl w-full text-center my-auto py-6 sm:py-8">
                    <div className="bg-white/92 backdrop-blur-md p-6 sm:p-10 md:p-12 rounded-3xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] space-y-4 sm:space-y-6 mx-auto">

                        {/* Live Season Badge */}
                        <div className="inline-flex items-center gap-2 bg-emerald-900/10 border border-emerald-900/20 px-3.5 py-1.5 rounded-full text-emerald-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
                            <span>📅 Booking 2026 / 2027 Seasons</span>
                        </div>

                        {/* Serif Title */}
                        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight">
                            “It’s not a celebration, <br />
                            <span className="text-amber-700 italic font-serif font-bold">
                unless it’s Regina’s.”
              </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-stone-600 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-xl mx-auto tracking-wide">
                            Host your dream garden wedding, 18th debut, baptismal reception, or corporate banquet nestled in Lingayen’s premier pavilion venue.
                        </p>

                        {/* CTA Button */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href="/venues"
                                className="group relative w-full sm:w-auto bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-emerald-900/20 text-xs sm:text-sm flex items-center justify-center gap-2.5 active:scale-95"
                            >
                                <span>Reserve an Event Space</span>
                                <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <a
                    href="#feature-cards"
                    className="relative z-10 mt-4 mb-2 flex flex-col items-center gap-1 text-stone-700 hover:text-emerald-950 transition-colors animate-bounce text-[10px] sm:text-[11px] font-bold tracking-widest uppercase"
                >
                    <span>Scroll to Explore</span>
                    <ChevronDown className="w-4 h-4 text-emerald-800" />
                </a>
            </section>

            {/* 4. Bright Feature Cards Section */}
            <section id="feature-cards" className="py-12 sm:py-16 bg-white border-y border-stone-200/80">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                        { title: 'Lush Garden Pavilions', desc: 'Open-Air & Glass Function Spaces', icon: Trees },
                        { title: 'In-House Buffet Catering', desc: 'Signature Pangasinan Filipino Feasts', icon: Utensils },
                        { title: 'Weddings & Debuts', desc: 'Full Stage & Ambient DMX Lighting', icon: Heart },
                        { title: 'Instant Downpayment', desc: 'GCash, Maya & Bank Transfers', icon: ShieldCheck },
                    ].map((item, idx) => (
                        <a
                            key={idx}
                            href="#venues-section"
                            className="group p-6 sm:p-8 bg-stone-50/80 rounded-3xl border border-stone-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-emerald-800/30 transition-all duration-300 text-center space-y-3 cursor-pointer"
                        >
                            <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 mx-auto group-hover:scale-110 transition-transform" />
                            <h4 className="font-serif font-bold text-base text-stone-900 group-hover:text-emerald-900 transition-colors">
                                {item.title}
                            </h4>
                            <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                        </a>
                    ))}
                </div>
            </section>

            {/* 5. Clean Venue Selection Grid */}
            <section id="venues-section" className="py-12 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-6 sm:space-y-10 bg-stone-50">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200 pb-4">
                    <div>
            <span className="text-emerald-800 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest block mb-1">
              FUNCTION HALLS & GARDEN GROUNDS
            </span>
                        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
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