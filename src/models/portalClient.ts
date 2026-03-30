export interface PortalClientModel {
  id_clients: string;
  email: string;
  unidade_id: string;
  nome_unidade: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cnpj: string;
  inscricao_estadual?: string;
}
