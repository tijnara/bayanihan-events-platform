import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Must explicitly export the function named "middleware"
export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to match your .env.local file
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // This safely refreshes the session and gets the user
    const { data: { user } } = await supabase.auth.getUser();

    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isLoginPage = request.nextUrl.pathname === '/admin/login';

    // 1. Unauthenticated users trying to access protected admin routes -> Redirect to Login
    if (isAdminRoute && !isLoginPage && !user) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // 2. Authenticated users trying to access Login page -> Redirect to Admin Dashboard
    if (isLoginPage && user) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    return response;
}

// Ensure the matcher is exported correctly
export const config = {
    matcher: [
        /*
         * Match all request paths inside /admin
         * Excludes API routes, static files, and images
         */
        '/admin/:path*',
    ],
};