import { z } from "zod";
import { isValidCPF } from "./validators";

export const acomodacaoEnum = z.enum(["Individual", "Dupla", "Tripla"]);
export const tamanhoCamisaEnum = z.enum(["PP", "P", "M", "G", "GG", "XG"]);

export const participanteSchema = z.object({
  nome_participante: z.string().min(1, "Informe o nome"),
  cpf_participante: z.string().optional(),
  rg_participante: z.string().optional(),
  data_nascimento_participante: z.string().optional(), // YYYY-MM-DD
  cargo_participante: z.string().default("Participante"),
  tamanho_camisa_participante: tamanhoCamisaEnum.default("M"),
  unidade_id_participante: z.number().int().nonnegative().optional(),
  nome_responsavel_participante: z.string().optional(),
  cpf_responsavel_participante: z.string().optional(),
});

export const responsavelSchema = z.object({
  nome_responsavel: z.string().min(1, "Informe o nome do responsável"),
  cpf_responsavel: z.string().min(11, "CPF inválido"),
  rg: z.string().optional(),
  data_nascimento: z.string().optional(),
  data_nascimento_responsavel: z.string().min(1, "Informe a data de nascimento"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido"),
  unidade_id: z.number().int().positive({ message: "Selecione a escola" }),
  acomodacao: z.enum(["Individual", "Dupla", "Tripla"], { message: "Selecione a acomodação" }),
  tamanho_camisa: z.string().optional(),
});


// Baseamos a inscrição no schema do responsável (campos obrigatórios bem definidos)
export const inscricaoSchema = z.object({
  // responsável
  nome_responsavel: z.string().min(1, "Nome do responsável é obrigatório"),
  cpf_responsavel: z.string().min(11, "CPF do responsável é obrigatório").refine(
    (cpf) => isValidCPF(cpf),
    { message: "CPF inválido. Verifique os dígitos." }
  ),
  rg: z.string().optional(),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido"),
  data_nascimento_responsavel: z.string().min(1, "Data de nascimento é obrigatória"),
  unidade_id: z.number().int().positive("Selecione a escola"),
  tamanho_camisa: tamanhoCamisaEnum.optional(),

  // acomodação e pagamento
  acomodacao: acomodacaoEnum,
  forma_pagamento: z.number().int().optional(),
  valor: z.number().optional(),
  parcelas: z.number().int().min(1).max(10).optional(),
  installments: z.number().int().min(1).max(12).optional(),
  quantidade_parcelas: z.number().int().min(1).max(10).optional(),
  max_installments_value: z.number().int().min(12).max(12).optional(),

  // convidados e aceite
  participantes: z.array(participanteSchema).default([]),
  dividir_quarto_aceite: z.boolean().default(false),
})
  .superRefine((val, ctx) => {
    const isShared = val.acomodacao === "Dupla" || val.acomodacao === "Tripla";
    const noGuests = (val.participantes?.length ?? 0) === 0;
    if (isShared && noGuests && !val.dividir_quarto_aceite) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dividir_quarto_aceite"],
        message: "É necessário aceitar dividir quarto quando não houver convidados.",
      });
    }
  });

export type Inscricao = z.infer<typeof inscricaoSchema>;
export type Participante = z.infer<typeof participanteSchema>;

