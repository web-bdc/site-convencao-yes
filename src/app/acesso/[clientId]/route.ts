import { accessControlService } from "@/services/accessControlService";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ clientId: string }>;

export async function GET(request: NextRequest, segmentData: { params: Params }) {
  // ATUALIZAÇÃO NEXT 15+: Parâmetros dinâmicos agora devem ser aguardados (Promise)
  const { clientId } = await segmentData.params;

  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  // Chamamos o serviço verificando o ID da URL primária e o Token do Query String
  const isValid = await accessControlService.validateAndSetSession(clientId, token);

  if (isValid) {
    // Escolas válidas são marcadas com Cookie e jogadas pra home
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = ""; // Sanitização explícita limpando parâmetros
    return NextResponse.redirect(redirectUrl);
  } else {
    // Se a escola não existir, o Cookie não é gerado e vai para tela de erro
    const urlErro = request.nextUrl.clone();
    urlErro.pathname = "/acesso-negado";
    urlErro.search = ""; // Sanitização explícita limpando parâmetros
    return NextResponse.redirect(urlErro);
  }
}

