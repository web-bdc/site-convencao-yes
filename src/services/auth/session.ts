import { cookies } from "next/headers";
import { PortalClientModel } from "../../models/portalClient";

const SESSION_COOKIE_NAME = "yes_convencao_client_session";

export async function createSession(clientInfo: PortalClientModel) {
  const sessionData = {
    id: clientInfo.id_clients,
    unidadeId: clientInfo.unidade_id,
    nome: clientInfo.nome_unidade,
    cnpj: clientInfo.cnpj,
    cidade: clientInfo.cidade,
    uf: clientInfo.uf
  };

  const encodedData = Buffer.from(JSON.stringify(sessionData)).toString("base64");

  // ATUALIZAÇÃO NEXT 15+: cookies() agora retorna uma Promise
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, encodedData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24h
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie || !sessionCookie.value) return null;

  try {
    const rawData = Buffer.from(sessionCookie.value, "base64").toString("utf-8");
    return JSON.parse(rawData);
  } catch (err) {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
