import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const publicPaths = ['/login']
  const path = request.nextUrl.pathname

  const protectedApiPaths = ['/api']

  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Si la ruta es pública, dejamos pasar
  if (publicPaths.some(apiPath => path.startsWith(apiPath))) {
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

  // Revisar token de cookies
  const token = request.cookies.get('token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(jpg|jpeg|png|gif|svg)).*)'
}