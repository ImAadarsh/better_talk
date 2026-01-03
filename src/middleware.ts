import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    // Public paths that do not require auth
    const publicPaths = ['/login', '/about', '/therapist', '/register', '/contact', '/stories', '/adx/login', '/faq'];
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

    // Role-based access for Admin area
    if (pathname.startsWith('/adx') && pathname !== '/adx/login') {
        if ((token as any).role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }


    // Access control for Therapists (Mentors)
    // We need to check the role from the token or session. 
    // IMPORTANT: NextAuth middleware token might not have the DB fields unless we add them to the JWT callback too.
    // For now, let's assume we rely on client-side or specific page checks for granular role attributes if JWT update is complex.
    // HOWEVER, the user specifically asked for "hidden after login".
    // Let's implement client-side protection in Layout/Pages or fetch server-side in Layout.
    // Middleware is limited without database access (Edge runtime).

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
