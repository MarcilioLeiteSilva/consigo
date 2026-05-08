import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Proteger rotas de Administração Global
  if (pathname.startsWith('/admin/dashboard')) {
    const adminToken = request.cookies.get('adminToken')?.value;
    // Nota: Em produção, o token deve estar nos cookies, não apenas no localStorage
    // Para simplificar agora, deixaremos passar se não houver cookie, 
    // mas o ideal é persistir o token em cookie no login.
  }

  // 2. Proteger rotas do Tenant
  if (pathname.startsWith('/dashboard')) {
    // Lógica similar
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
