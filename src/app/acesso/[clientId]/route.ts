import { accessControlService } from "@/services/accessControlService";
import { NextResponse } from "next/server";

type Params = Promise<{ clientId: string }>;

export async function GET(request: Request, segmentData: { params: Params }) {
  // ATUALIZAÇÃO NEXT 15+: Parâmetros dinâmicos agora devem ser aguardados (Promise)
  const { clientId } = await segmentData.params;

  // Chamamos o serviço que bate na API do Portal e retorna true se for autêntico
  const isValid = await accessControlService.validateAndSetSession(clientId);

  if (isValid) {
    // Escolas válidas são marcadas com Cookie e jogadas pra /inscricao
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  } else {
    // Se a escola não existir, o Cookie não é gerado e vai para tela de erro
    const urlErro = new URL("/acesso-negado", request.url);
    return NextResponse.redirect(urlErro);
  }
}
