import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const protectedRoutes = ['/orders', '/messages', '/profile'];
const cookOnlyRoutes = ['/dashboard'];
const authRoutes = ['/login', '/register'];

export default withAuth(
  function middleware(req) {
    const { nextUrl } = req;
    const token = req.nextauth?.token;
    const isLoggedIn = !!token;

    const isProtectedRoute = protectedRoutes.some(route =>
      nextUrl.pathname.startsWith(route)
    );
    const isCookRoute = cookOnlyRoutes.some(route =>
      nextUrl.pathname.startsWith(route)
    );
    const isAuthRoute = authRoutes.some(route =>
      nextUrl.pathname.startsWith(route)
    );

    if (isProtectedRoute && !isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }

    if (isCookRoute && token?.role !== 'COOK') {
      return NextResponse.redirect(new URL('/discover', nextUrl));
    }

    if (isAuthRoute && isLoggedIn) {
      return NextResponse.redirect(new URL('/discover', nextUrl));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle auth logic
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
