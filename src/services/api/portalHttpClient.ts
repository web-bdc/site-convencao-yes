import { PortalClientModel } from "../../models/portalClient";

export class PortalHttpClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;

  constructor() {
    this.baseUrl = process.env.PORTAL_API_URL || "https://portal.yes.com.br/api/clients";
    
    const user = process.env.PORTAL_API_USER || "";
    const pass = process.env.PORTAL_API_PASS || "";
    this.authHeader = `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
  }

  /**
   * Busca a listagem de todos os clientes registrados no portal.
   */
  async getAllClients(): Promise<PortalClientModel[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "GET",
        headers: {
          Authorization: this.authHeader,
          "Content-Type": "application/json",
        },
        // Removemos o cache temporariamente para garantir que dados de novas
        // franquias sempre entrem rápido no momento de logar no acesso sso.
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Falha na API: ${response.status} ${response.statusText}`);
      }

      const rawData = await response.json();
      
      // Validação caso a APi retorne os dados dentro de um nó "data" ou direto em array
      const items = Array.isArray(rawData) ? rawData : (rawData.data || []);
      
      // Retorna os dados completos (permitindo que o Auth Service leia a senha para a validação ?token)
      return items.map((item: any) => item as PortalClientModel);

    } catch (error) {
      console.error("[PortalHttpClient] Erro ao buscar dados:", error);
      return [];
    }
  }

  /**
   * Retorna os dados de apenas um cliente dado o seu ID do Portal.
   */
  async getClientById(clientId: string): Promise<PortalClientModel | null> {
    const clients = await this.getAllClients();
    return clients.find((client) => String(client.id_clients) === String(clientId)) || null;
  }
}

// Exportamos uma instância (Singleton approach) para uso prático.
export const portalHttpClient = new PortalHttpClient();
