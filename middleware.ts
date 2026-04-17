import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedRoutes = ['/orders', '/messages', '/profile', '/admin'];
const cookOnlyRoutes = ['/dashboard'];
const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!token;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isCookRoute = cookOnlyRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isCookRoute && token?.role !== 'COOK') {
    return NextResponse.redirect(new URL('/discover', req.nextUrl));
  }

  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  if (isAdminRoute && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/discover', req.nextUrl));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/discover', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
