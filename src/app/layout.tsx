import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-serif',
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Regina's Garden and Restaurant | Venue Reservation & Catering",
    description: "It's not a celebration, unless it's Regina's. Reserve lush garden pavilions, air-conditioned function halls, and custom catering packages in Lingayen, Pangasinan.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
        <body className="bg-stone-50 text-stone-800 font-sans antialiased selection:bg-amber-200 selection:text-emerald-950">
        {children}
        </body>
        </html>
    );
}