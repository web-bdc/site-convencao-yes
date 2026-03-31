import { portalHttpClient } from "./api/portalHttpClient";
import { createSession } from "./auth/session";

export class AccessControlService {
  /**
   * Recebe um client ID (vindo da URL do Portal), checa se ele existe
   * na base real e, em caso afirmativo, crava a Sessão no navegador.
   *
   * @param cliendId O identificador passado no fim da URL
   * @returns Booleano indicando se foi sucesso ou se o ID era falso
   */
  async validateAndSetSession(clientId: string, providedToken: string | null): Promise<boolean> {
    try {
      if (!providedToken) {
        console.warn(`Tentativa falha de acesso: Client_ID ${clientId} não enviou o token.`);
        return false;
      }

      const clientDetails = await portalHttpClient.getClientById(clientId);

      if (!clientDetails) {
        console.warn(`Tentativa falha de acesso ao Client_ID Inválido: ${clientId}`);
        return false;
      }

      // NOVO BLOQUEIO: Verificando se a senha (Token Bcrypt) atrelada à escola é igual à provida na URL
      if (clientDetails.password !== providedToken) {
        console.warn(`Proteção Ativa: Tentativa com Token inválido para o Client_ID: ${clientId}`);
        return false;
      }

      // Retiramos a senha da memória após ela ser validada com sucesso, por segurança
      delete clientDetails.password;

      // Se achou, o cliente existe e a escola está habilitada (SSO aprovado)
      // Guardamos ele na sessão (Cookie) sem a senha
      await createSession(clientDetails);
      return true;

    } catch (error) {
      console.error("Erro no AccessControlService:", error);
      return false;
    }
  }
}

export const accessControlService = new AccessControlService();
