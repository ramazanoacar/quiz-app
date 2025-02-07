import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('auth');
  const isAuthPage = request.nextUrl.pathname === '/';
  
  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is authenticated and trying to access login page
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/questions', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/questions/:path*', '/api/questions/:path*']
}; 