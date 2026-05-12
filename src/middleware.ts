import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname


  if (
    path.startsWith('/_next/static') ||
    path.startsWith('/_next/image') ||
    path.startsWith('/favicon.ico') ||
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.png') ||
    path.endsWith('.gif') ||
    path.endsWith('.svg')
  ) {
    return NextResponse.next()
  }

  const publicPaths = ['/login']
  const protectedApiPaths = ['/api']

  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (publicPaths.includes(path)) {
    return NextResponse.next()
  }

  if (protectedApiPaths.some(apiPath => path.startsWith(apiPath))) {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/:path*'] 
}
