import { portalHttpClient } from '@/services/api/portalHttpClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clients = await portalHttpClient.getAllClients();
    const portaUrl = `localhost:3000`;

    let textDoc = `RELATÓRIO DE URLS DE ACESSO (SSO OCULTO)\n`;
    textDoc += `==============================================\n\n`;
    textDoc += `Configure estes links nos botões do Portal Administrativo da YES:\n\n`;

    clients.forEach(c => {
      // Como estamos no ambiente local/prd, usaremos um placeholder amigável
      const linkRoot = `https://${portaUrl}/acesso/${c.id_clients}`;
      textDoc += `ID Portal: ${c.id_clients} | Unidade: ${c.unidade_id} | Nome: ${c.nome_unidade.trim()}\n`;
      textDoc += `Link: ${linkRoot}\n`;
      textDoc += `--------------------------------------------------\n`;
    });

    return new NextResponse(textDoc, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
