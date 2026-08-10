import Link from 'next/link';
import { Sparkles, MapPin, ArrowRight, Utensils, Trees, Heart, ShieldCheck } from 'lucide-react';
import { getVenues } from '@/modules/events/actions/venueActions';
import { VenueGrid } from '@/modules/events/components/VenueGrid';

export default async function HomePage() {
    const venuesResponse = await getVenues();
    const venues = venuesResponse.data || [];

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans">
            {/* Location Bar */}
            <div className="bg-emerald-950 py-2.5 px-4 text-center text-xs text-amber-200 font-medium flex items-center justify-center gap-2 tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Maramba Blvd., Libsong West, Lingayen, Pangasinan — Online Date & Slot Reservation</span>
            </div>

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 px-6 border-b border-stone-200 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-stone-50 to-stone-50 overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-emerald-900/10 border border-emerald-900/20 px-4 py-1.5 rounded-full text-emerald-900 text-xs font-semibold uppercase tracking-widest">
                        <Trees className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Regina’s Garden and Restaurant</span>
                    </div>

                    {/* Tagline Card Overlay */}
                    <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-stone-200 shadow-xl max-w-4xl mx-auto space-y-4">
                        <h1 className="font-serif text-4xl md:text-6xl font-bold text-emerald-950 tracking-tight leading-tight">
                            “It’s not a celebration, <br className="hidden md:inline" />
                            <span className="text-amber-600 font-serif italic">unless it’s Regina’s.”</span>
                        </h1>

                        <p className="text-stone-600 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-sans">
                            Host your grand garden weddings, 18th debuts, baptismal receptions, and corporate banquets nestled in Lingayen’s premier garden venue.
                        </p>

                        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/venues"
                                className="bg-emerald-900 hover:bg-emerald-950 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-emerald-900/20 text-sm flex items-center gap-2"
                            >
                                <span>Reserve an Event Space</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brand Highlights */}
            <section className="py-12 bg-white border-b border-stone-200">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80">
                        <Trees className="w-6 h-6 text-emerald-800 mx-auto mb-2" />
                        <h4 className="font-serif font-bold text-base text-stone-900">Garden Pavilions</h4>
                        <p className="text-xs text-stone-500 mt-1">Lush Al Fresco & Covered Settings</p>
                    </div>
                    <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80">
                        <Utensils className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                        <h4 className="font-serif font-bold text-base text-stone-900">In-House Catering</h4>
                        <p className="text-xs text-stone-500 mt-1">Authentic Filipino Buffet Feasts</p>
                    </div>
                    <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80">
                        <Heart className="w-6 h-6 text-emerald-800 mx-auto mb-2" />
                        <h4 className="font-serif font-bold text-base text-stone-900">Weddings & Debuts</h4>
                        <p className="text-xs text-stone-500 mt-1">Full Staging & Lights Styling</p>
                    </div>
                    <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80">
                        <ShieldCheck className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                        <h4 className="font-serif font-bold text-base text-stone-900">Instant Downpayment</h4>
                        <p className="text-xs text-stone-500 mt-1">GCash, Maya & Bank Transfers</p>
                    </div>
                </div>
            </section>

            {/* Venue Exploration Grid */}
            <section className="py-16 px-6 max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-end">
                    <div>
            <span className="text-emerald-800 text-xs font-bold uppercase tracking-widest block mb-1">
              Event Spaces & Function Halls
            </span>
                        <h2 className="font-serif text-3xl font-bold text-stone-900">Explore Our Venues</h2>
                    </div>
                    <Link href="/venues" className="text-xs text-emerald-800 hover:text-emerald-950 flex items-center gap-1 font-semibold">
                        <span>View All Venues</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <VenueGrid venues={venues} />
            </section>
        </div>
    );
}