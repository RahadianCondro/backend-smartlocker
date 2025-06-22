import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Header Keamanan
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' https://app.sandbox.midtrans.com");
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // CORS
  const allowedOrigins = [process.env.NEXT_PUBLIC_BACKEND_URL];
  const origin = request.headers.get('origin');
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

export const config = {
  matcher: '/api/:path*'
};