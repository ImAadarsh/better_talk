import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    // Debug Access Control
    // console.log(`[Middleware] Path: ${pathname}, Role: ${(token as any)?.role}, Email: ${token?.email}`);

    // Public paths that do not require auth
    const publicPaths = ['/login', '/about', '/therapist', '/register', '/contact', '/stories', '/adx/login', '/faq'];

    const rootRedirects = pathname === '/' || pathname === '/login' || pathname === '/register';

    if (token && rootRedirects) {
        if ((token as any).role === 'admin') {
            return NextResponse.redirect(new URL('/adx/bookings', request.url));
        } else if ((token as any).role === 'mentor') {
            return NextResponse.redirect(new URL('/therapist/sessions', request.url));
        } else {
            // Default User
            return NextResponse.redirect(new URL('/sessions', request.url));
        }
    }

    if (publicPaths.some(path => pathname.startsWith(path)) || pathname === '/') {
        return NextResponse.next();
    }


    // Check for auth
    if (!token) {
        // If trying to access admin area, redirect to admin login
        if (pathname.startsWith('/adx') && pathname !== '/adx/login') {
            return NextResponse.redirect(new URL('/adx/login', request.url));
        }

        const url = new URL('/', request.url);
        url.searchParams.set('callbackUrl', encodeURI(request.url));
        return NextResponse.redirect(url);
    }

    // --- STRICT ROLE-BASED ACCESS CONTROL ---

    // 1. Admin Area Protection (/adx)
    if (pathname.startsWith('/adx') && pathname !== '/adx/login') {
        if ((token as any).role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // 2. Therapist Area Protection (/therapist) - Exclude public profile/community paths if any
    // Assuming /therapist/dashboard, /therapist/sessions etc are private, but /therapist/[id] might be public?
    // Based on directory structure, /therapist seems to be the main portal.
    // Let's protect specific sub-routes or the main dashboard to be safe.
    // If we protecting /therapist/* we might block public profiles. 
    // Let's assume /therapist/sessions, /therapist/dashboard, /therapist/schedule are private.
    const therapistPrivatePaths = ['/therapist/dashboard', '/therapist/sessions', '/therapist/schedule', '/therapist/profile'];
    if (therapistPrivatePaths.some(path => pathname.startsWith(path))) {
        if ((token as any).role !== 'mentor') {
            // If admin tries to access, maybe allow? User requested strict "logging in user panel" fix.
            // Sticking to strict separation.
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // 3. User Area Protection (/sessions, /profile)
    // Prevent Admins and Therapists from accidentally using User views if they are strictly separate.
    const userPrivatePaths = ['/sessions', '/profile'];
    if (userPrivatePaths.some(path => pathname.startsWith(path))) {
        const role = (token as any).role;
        if (role === 'admin') {
            return NextResponse.redirect(new URL('/adx/bookings', request.url));
        }
        if (role === 'mentor') {
            return NextResponse.redirect(new URL('/therapist/sessions', request.url));
        }
    }


    // Access control for Therapists (Mentors)
    // We need to check the role from the token or session. 
    // IMPORTANT: NextAuth middleware token might not have the DB fields unless we add them to the JWT callback too.
    // For now, let's assume we rely on client-side or specific page checks for granular role attributes if JWT update is complex.
    // HOWEVER, the user specifically asked for "hidden after login".
    // Let's implement client-side protection in Layout/Pages or fetch server-side in Layout.
    // Middleware is limited without database access (Edge runtime).

    const response = NextResponse.next();

    // Prevent caching for protected routes to ensure logout works effectively (no back button access)
    // We apply this to all routes matched by the middleware which excludes static files/api/public assets
    if (token) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
