import { createSession } from "../lib/session";
import { portalHttpClient } from "./api/portalHttpClient";

export class AccessControlService {
  /**
   * Recebe um client ID (vindo da URL do Portal), checa se ele existe
   * na base real e, em caso afirmativo, crava a Sessão no navegador.
   *
   * @param cliendId O identificador passado no fim da URL
   * @returns Booleano indicando se foi sucesso ou se o ID era falso
   */

  async validateAndSetSession(clientId: string): Promise<boolean> {
    try {
      const clientDetails = await portalHttpClient.getClientById(clientId);

      if (!clientDetails) {
        console.warn(`Tentativa falha de acesso ao Client_ID Inválido: ${clientId}`);
        return false;
      }

      // Se achou, o cliente existe e a escola está habilitada (SSO aprovado)
      // Guardamos ele na sessão (Cookie)
      await createSession(clientDetails);
      return true;

    } catch (error) {
      console.error("Erro no AccessControlService:", error);
      return false;
    }
  }
}

export const accessControlService = new AccessControlService();
