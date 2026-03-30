import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  
  // 1. Liberamos SOMENTE a porta de entrada (a mágica do SSO), assets vitais e nossas APIs
  if (
    currentPath.startsWith('/_next') ||
    currentPath.startsWith('/api') ||
    currentPath.startsWith('/acesso/') || 
    currentPath === '/acesso-negado' ||
    currentPath.includes('.') // Permite carregar imagens como .png, .svg do layout
  ) {
    return NextResponse.next(); // catraca liberada sem checar
  }

  // 2. Qualquer tentativa de acessar a HOME ("/") ou INSCRIÇÃO ("/inscricao") pela URL pura cai aqui
  const sessionCookie = request.cookies.get('yes_convencao_client_session');

  // Se o cookie não existir (não passou pela API da YES), ele é expulso do site.
  if (!sessionCookie || !sessionCookie.value) {
    console.log(`[Segurança] Bloqueando acesso direto à rota pura: ${currentPath}`);
    return NextResponse.redirect(new URL('/acesso-negado', request.url));
  }

  // 3. Se ele tiver o Cookie gerado pelo acesso mágico, a navegação para qualquer tela é livre!
  return NextResponse.next();
}

// Diz para o Next rodar esse middleware e abater qualquer acesso no nascedouro (Performance máxima)
export const config = {
  matcher: [
    /*
     * Intercepta tudo exceto as rotas fixas internas do Next (estáticos, imagens e APIs)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
