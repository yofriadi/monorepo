import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const publicRoutes = ['/signin', '/signup'];

const isPublicPath = (path: string) => {
  return publicRoutes.some(publicPath => path.startsWith(publicPath));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get('auth_token');

  const isAuthenticated = !!authToken;

  const isPublic = isPublicPath(pathname);

  if (!isPublic && !isAuthenticated) {
    const redirectUrl = new URL('/signin', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isPublic && isAuthenticated) {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthenticated) {
    const role = request.cookies.get('user_role')?.value;

    if (role !== 'admin' && pathname.startsWith('/users')) {
      const redirectUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
  ]
}
