import escolasDb from "@/db/escolas.json";
import { inscricaoSchema } from "@/lib/schemas";
import { appendInscricaoRow, type SheetRow } from "@/services/sheetsService";
import { NextResponse } from "next/server";

const UPSTREAM = "https://api.yes.com.br/api/ApiConvecao/convecao";
const FETCH_TIMEOUT = 15000;

const PRICING = {
  individual: Number(3700),
  adult: Number(3700),
  between12and17: Number(3700),
  under12: Number(0),
};


function minExtrasPorAcomodacao(acomodacao?: string) {
  if (!acomodacao) return 1;
  const a = String(acomodacao).toLowerCase();
  if (a.includes("individual")) return 0;
  if (a.includes("duplo")) return 1;
  if (a.includes("triplo")) return 2;
  return 1;
}

function toISODate(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr; // Já é ISO
  const parts = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!parts) return dateStr; // Formato desconhecido, deixa como está
  // parts = ["30/09/2000", "30", "09", "2000"]
  return `${parts[3]}-${parts[2]}-${parts[1]}`;
}

// calcula idade em data de referência (31/12/2025)
function getAgeAtReference(dateStr?: string, refDate?: Date) {
  if (!dateStr) return null;
  const isoDateStr = toISODate(String(dateStr));
  const birth = new Date(isoDateStr);
  if (Number.isNaN(birth.getTime())) return null;
  const reference = refDate ?? new Date("2025-12-31");
  let age = reference.getFullYear() - birth.getFullYear();
  const monthDiff = reference.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Helper: converte 'YYYY-MM-DD' -> 'DD/MM/YYYY' quando aplicável
function toBRDate(dateStr?: string) {
  if (!dateStr) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr; // já está no formato
  const d = new Date(String(dateStr));
  if (Number.isNaN(d.getTime())) return String(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Arredonda para cima com 2 casas decimais
function roundUp2(n: number) {
  return Math.ceil(n * 100) / 100;
}

// Traduz código de pagamento para nome legível
function paymentName(code?: number | string) {
  const n = Number(code);
  switch (n) {
    case 1:
      return "Cartão de Crédito";
    case 2:
      return "Boleto";
    case 3:
      return "PIX";
    default:
      return String(code ?? "");
  }
}

// Resolve nome da escola pelo ID
function escolaNomeById(id?: number | string) {
  const n = Number(id);
  const found = (escolasDb as { escolas: Array<{ id: number; nome: string }> }).escolas.find((e) => e.id === n);
  return found?.nome || "";
}

// Tipo auxiliar para mapear participantes sem usar 'any'
type UpParticipant = {
  nome_participante?: string;
  cpf_participante?: string;
  rg_participante?: string;
  data_nascimento_participante?: string;
  data_nascimento?: string;
  cargo_participante?: string;
  tamanho_camisa_participante?: string;
  unidade_id_participante?: number | string;
  nome_responsavel_participante?: string;
  cpf_responsavel_participante?: string;
  // aliases que também populamos durante normalização
  nome?: string;
  cpf?: string;
  rg?: string;
  tamanho_camisa?: string;
  cargo?: string;
};

export async function POST(req: Request) {

  try {
    const body = await req.json();
    console.log("Request recebido em /api/convecao");
    // console.log("Request body:", JSON.stringify(body, null, 2)); // REMOVIDO POR SEGURANÇA (PII)

    // VALIDAÇÃO DE SEGURANÇA (ZOD)
    const validation = inscricaoSchema.safeParse(body);
    if (!validation.success) {
      console.error("[VALIDATION ERROR]", validation.error.format());
      return NextResponse.json(
        {
          error: "Dados de inscrição inválidos",
          details: validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      );
    }


    // Normaliza tamanho da camisa do responsável:
    // - trima strings
    // - considera string vazia como undefined
    const normalizeSize = (v: unknown): string | undefined => {
      if (typeof v === "string") {
        const t = v.trim();
        return t === "" ? undefined : t;
      }
      return typeof v === "undefined" ? undefined : String(v);
    };

    const tamanhoResponsavel = normalizeSize(body.tamanho_camisa);

    // Validações mínimas
    // aceita data_nascimento_responsavel OU data_nascimento (alguns clientes usam nomes diferentes)
    if (!body.nome_responsavel || !body.cpf_responsavel || !(body.data_nascimento_responsavel || body.data_nascimento) || !body.unidade_id) {
      return NextResponse.json({ error: "nome_responsavel, cpf_responsavel, data_nascimento_responsavel|data_nascimento e unidade_id são obrigatórios" }, { status: 400 });
    }

    const acomodacao = body.acomodacao || "";
    const participantes = Array.isArray(body.participantes) ? body.participantes : [];
    const dividirAceite = Boolean(body.dividir_quarto_aceite);

    // normalize participants: garante propriedades esperadas pelo upstream (evita notices no PHP)
    const normalizedParticipants = (participantes || []).map((p: unknown) => {
      const pp = p as Record<string, unknown>;
      const dataNascPart =
        (pp.data_nascimento_participante as string | undefined) ??
        (pp.data_nascimento as string | undefined) ??
        (body.data_nascimento_responsavel as string | undefined) ??
        (body.data_nascimento as string | undefined) ??
        "";
      const rgPart = (pp.rg_participante as string | undefined) ?? (pp.rg as string | undefined) ?? "";
      const cpfPart = (pp.cpf_participante as string | undefined) ?? (pp.cpf as string | undefined) ?? "";
      const nomePart = (pp.nome_participante as string | undefined) ?? (pp.nome as string | undefined) ?? "";
      const tamanhoPart = (pp.tamanho_camisa_participante as string | undefined) ?? (pp.tamanho_camisa as string | undefined) ?? "";
      const emailPart = (pp.email_aluno as string | undefined) ?? (pp.email as string | undefined) ?? (body.email as string | undefined) ?? "";
      // Endereço do participante (alias para compatibilidade com upstream)
      const cepAluno = (pp.cep_aluno as string | undefined) ?? (pp.cep as string | undefined) ?? (body.cep_aluno as string | undefined) ?? (body.cep as string | undefined) ?? "";
      const enderecoAluno = (pp.endereco_aluno as string | undefined) ?? (pp.endereco as string | undefined) ?? (body.endereco_aluno as string | undefined) ?? (body.endereco as string | undefined) ?? "";
      const numeroAluno = (pp.numero_aluno as string | undefined) ?? (pp.numero as string | undefined) ?? (body.numero_aluno as string | undefined) ?? (body.numero as string | undefined) ?? "";
      const complementoAluno = (pp.complemento_aluno as string | undefined) ?? (pp.complemento as string | undefined) ?? (body.complemento_aluno as string | undefined) ?? (body.complemento as string | undefined) ?? "";
      const bairroAluno = (pp.bairro_aluno as string | undefined) ?? (pp.bairro as string | undefined) ?? (body.bairro_aluno as string | undefined) ?? (body.bairro as string | undefined) ?? "";
      const cidadeAluno = (pp.cidade_aluno as string | undefined) ?? (pp.cidade as string | undefined) ?? (body.cidade_aluno as string | undefined) ?? (body.cidade as string | undefined) ?? "";
      const estadoAluno = (pp.estado_aluno as string | undefined) ?? (pp.estado as string | undefined) ?? (body.estado_aluno as string | undefined) ?? (body.estado as string | undefined) ?? "";
      return {
        ...pp,
        nome_participante: nomePart,
        cpf_participante: cpfPart,
        rg_participante: rgPart,
        data_nascimento_participante: dataNascPart,
        // alias para compatibilidade com possíveis leituras no upstream
        data_nascimento: dataNascPart,
        nome: nomePart,
        cpf: cpfPart,
        rg: rgPart,
        email_aluno: emailPart,
        email: emailPart,
        cep_aluno: cepAluno,
        cep: cepAluno,
        endereco_aluno: enderecoAluno,
        endereco: enderecoAluno,
        numero_aluno: numeroAluno,
        numero: numeroAluno,
        complemento_aluno: complementoAluno,
        complemento: complementoAluno,
        bairro_aluno: bairroAluno,
        bairro: bairroAluno,
        cidade_aluno: cidadeAluno,
        cidade: cidadeAluno,
        estado_aluno: estadoAluno,
        estado: estadoAluno,
        cargo_participante: (pp.cargo_participante as string | undefined) ?? (pp.cargo as string | undefined) ?? "Participante",
        tamanho_camisa_participante: tamanhoPart,
        tamanho_camisa: tamanhoPart,
        unidade_id_participante: Number((pp.unidade_id_participante as number | string | undefined) ?? body.unidade_id ?? 0),
      };
    });

    // Se nenhum participante, adiciona o próprio responsável como participante
    const participantsToSend: UpParticipant[] = normalizedParticipants.length > 0
      ? normalizedParticipants
      : [];

    // Validações relacionadas a participantes e acomodação
    body.participantes = participantsToSend;
    const minExtras = minExtrasPorAcomodacao(acomodacao);

    // Permite Dupla/Tripla sem convidados quando houver aceite para dividir quarto
    if (minExtras > 0 && participantes.length < minExtras) {
      if (!dividirAceite) {
        return NextResponse.json(
          { error: `Para a acomodação "${acomodacao}" é necessário aceitar dividir quarto quando não houver convidados.` },
          { status: 400 }
        );
      }
      // aceite presente: permitir seguir com 0 convidados
    }

    // VALIDAÇÃO: Dados obrigatórios dos convidados
    if (participantes.length > 0) {
      for (let i = 0; i < participantes.length; i++) {
        const convidado = participantes[i] as Record<string, unknown>;

        // Nome obrigatório
        if (!convidado.nome_participante && !convidado.nome) {
          return NextResponse.json(
            { error: "Nome é obrigatório para convidado" },
            { status: 400 }
          );
        }

        // CPF obrigatório
        if (!convidado.cpf_participante && !convidado.cpf) {
          return NextResponse.json(
            { error: "CPF é obrigatório para convidado" },
            { status: 400 }
          );
        }
        // RG obrigatório
        if (!convidado.rg_participante && !convidado.rg) {
          return NextResponse.json(
            { error: "RG é obrigatório para convidado" },
            { status: 400 }
          );
        }
        // Data de nascimento obrigatória
        if (!convidado.data_nascimento_participante && !convidado.data_nascimento) {
          return NextResponse.json(
            { error: "Data de nascimento é obrigatória para convidado" },
            { status: 400 }
          );
        }
      }
    }

    // determina preço base (frontend pode enviar valor unitário em body.valor)
    const valorUnitarioFront = typeof body.valor === "string" ? Number(body.valor) : body.valor;
    const baseAdult = Number.isFinite(valorUnitarioFront) && valorUnitarioFront > 0 ? valorUnitarioFront : PRICING.adult;
    const isIndividual = String(acomodacao).toLowerCase().includes("individual");
    const priceForAdult = isIndividual ? PRICING.individual : baseAdult;

    // Helper: sincroniza dois campos (bidirecional) e garante que ambos existam
    const syncFields = (field1: string, field2: string, defaultVal = "") => {
      if (!body[field1] && body[field2]) body[field1] = body[field2];
      if (!body[field2] && body[field1]) body[field2] = body[field1];
      if (typeof body[field1] === 'undefined') body[field1] = body[field2] || defaultVal;
      if (typeof body[field2] === 'undefined') body[field2] = body[field1] || defaultVal;
    };

    // Aliases top-level para compatibilidade com upstream
    const dataResp = body.data_nascimento_responsavel || body.data_nascimento || "";
    body.data_nascimento_responsavel = dataResp; // Garante que o campo principal esteja preenchido
    if (!body.data_nascimento && dataResp) body.data_nascimento = dataResp;
    if (!body.nome && body.nome_responsavel) body.nome = body.nome_responsavel;
    if (!body.cpf && body.cpf_responsavel) body.cpf = body.cpf_responsavel;
    if (typeof body.rg === 'undefined') body.rg = "";

    // Sincroniza campos de endereço bidirecionalmente
    syncFields('email_aluno', 'email');
    syncFields('cep_aluno', 'cep', '00000-000');
    syncFields('endereco_aluno', 'endereco');
    syncFields('numero_aluno', 'numero');
    syncFields('complemento_aluno', 'complemento');
    syncFields('bairro_aluno', 'bairro');
    syncFields('cidade_aluno', 'cidade');
    syncFields('estado_aluno', 'estado');

    // monta lista para cálculo local sem duplicar responsável
    const responsibleBirth = body.data_nascimento_responsavel || body.data_nascimento || undefined;
    const all = normalizedParticipants.length > 0
      ? normalizedParticipants
      : [{ data_nascimento_participante: responsibleBirth }];

    // Ponte: se o cliente enviou subtotal_cents, usamos ele como fonte da verdade
    const subtotalCentsFromClient = Number.isFinite(Number(body.subtotal_cents)) ? Number(body.subtotal_cents) : null;
    let total = 0;
    for (const p of all) {
      // calcular idade considerando ano de referência (função getAgeAtReference)
      const age = getAgeAtReference((p as Record<string, unknown>)?.data_nascimento_participante as string | undefined);
      let price = priceForAdult;
      if (age === null) {
        price = priceForAdult; // se sem data, cobra adulto
      } else if (age < 12) {
        price = PRICING.under12;
      } else if (age >= 12 && age < 18) {
        price = PRICING.between12and17;
      } else {
        price = priceForAdult;
      }
      total += price;
      // quantidade não é usada; gateway recebe quantidade 1 e valor como subtotal
    }

    // garante campos enviados ao upstream (valor_material como subtotal)
    const totalFromCalc = Number(total.toFixed(2));
    const desiredSubtotal = subtotalCentsFromClient !== null ? Number((subtotalCentsFromClient / 100).toFixed(2)) : totalFromCalc;
    body.valor_material = desiredSubtotal;
    body.quantidade_livros = 1; // evitar multiplicação no gateway
    body.valor = desiredSubtotal; // valor unitário = subtotal

    // COMPENSAÇÃO DE DESCONTO PIX
    try {
      const COMPENSATE_PIX = String(process.env.COMPENSATE_PIX || "true").toLowerCase() === "true";
      const PIX_PAYMENT_CODE = Number(process.env.PIX_PAYMENT_CODE ?? 3);
      const PIX_DISCOUNT = Number(process.env.PIX_DISCOUNT ?? 0.05);


      if (COMPENSATE_PIX && Number(body.forma_pagamento) === PIX_PAYMENT_CODE && PIX_DISCOUNT > 0) {
        // usar o subtotal calculado localmente como base desejada
        const desired = Number((Number(desiredSubtotal) || Number(body.valor_material) || 0).toFixed(2));
        // Lógica explícita solicitada: Se PIX e base for 3700 => 3894.74
        let adjusted: number;
        if (desired === 3700) {
          adjusted = 3894.74;
        } else {
          // Para outros valores, mantém a proporção matemática
          adjusted = roundUp2(desired / (1 - PIX_DISCOUNT));
        }

        // guardar o valor original para auditoria
        body._valor_material_original = desired;
        body.valor_material = adjusted;
        body.valor = adjusted;
        // opcional: marque que foi compensado
        body._pix_compensado = true;
      }
    } catch {
      // Falha silenciosa - não bloquear operação
    }

    // Monta payload no formato esperado pelo upstream (conforme "stats" fornecidas)
    const quantidadeParcelas = Number(body.quantidade_parcelas || body.parcelas || body.installments || 10);
    const formaPagamento = Number(body.forma_pagamento || 3);
    const unidadeIdNum = Number(body.unidade_id || 1001);

    const payload = {
      nome_responsavel: body.nome_responsavel,
      numero_pedido: body.numero_pedido || String(Date.now()),
      id_participante: body.id_participante || "1",
      cpf_responsavel: body.cpf_responsavel,
      rg: body.rg,
      data_nascimento: toBRDate(body.data_nascimento || body.data_nascimento_responsavel || "01/01/2000"),
      tamanho_camisa: tamanhoResponsavel || "M",
      cargo: body.cargo || "Participante",
      cep_aluno: body.cep_aluno || body.cep || "22640-100",
      rua: body.rua || body.endereco || body.endereco_aluno || "Avenida das Américas",
      complemento: `${body.complemento_responsavel || body.complemento || ""} [Ref Unidade: ${unidadeIdNum}]`.substring(0, 100),
      numero: body.numero_responsavel || "500",
      bairro: body.bairro_responsavel || "Barra da Tijuca",
      cidade: body.cidade_responsavel || "Rio de Janeiro",
      uf: body.uf_responsavel || "RJ",
      email_aluno: body.email || "[EMAIL_ADDRESS]",
      telefone: body.telefone ? body.telefone.replace(/\D/g, "") : "21999999999",
      status_venda: "Pendente",
      // Restored: Prioriza body.valor_material (compensação PIX)
      valor_material: Number(body.valor_material) || Number(((subtotalCentsFromClient ?? 0) / 100).toFixed(2)) || 0,
      forma_pagamento: formaPagamento,
      quantidade_parcelas: quantidadeParcelas,
      credit_card: {
        active: true,
        installments: true,
        max_installments_value: 10
      },
      plataforma: 2, // 1 = App, 2 = Site
      gateway_pagamento: 3, // IUGO2
      url_boleto: "",
      data_hora_venda: new Date().toISOString(),
      quantidade_livros: 1,
      valor_frete: 0,
      unidade_id: 1, // HARDCODED SAFE UNIT (Pátio)
      client_id: body.client_id || "9999",
      iugo_fatura_id: body.iugo_fatura_id || "000000000",
      acomodacao: String(body.acomodacao || "individual").toLowerCase(),
      participantes: (participantsToSend || []).map((p: Record<string, unknown>, index: number) => {
        const pp = p as unknown as UpParticipant;
        return {
          nome_participante: pp.nome_participante || `Participante ${index + 1}`,
          cpf_participante: pp.cpf_participante || "000.000.000-00",
          rg_participante: pp.rg_participante || "0000000",
          data_nascimento_participante: toBRDate(pp.data_nascimento_participante || pp.data_nascimento || "01/01/2000"),
          cargo_participante: pp.cargo_participante || "Participante",
          tamanho_camisa_participante: pp.tamanho_camisa_participante || "M",
          unidade_id_participante: Number(pp.unidade_id_participante || unidadeIdNum || 1001),
          nome_responsavel_participante: pp.nome_responsavel_participante || body.nome_responsavel || "Responsável",
          cpf_responsavel_participante: pp.cpf_responsavel_participante || body.cpf_responsavel || "000.000.000-00",
        };
      }),
    };




    console.log("Payload para o upstream:", JSON.stringify(payload, null, 2));

    const maxAttempts = Number(process.env.UPSTREAM_RETRIES ?? 2);
    let attempt = 0;
    let lastError: unknown = null;
    let response: Response | undefined;

    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    while (attempt <= maxAttempts) {
      attempt += 1;
      console.log(`[UPSTREAM] Tentativa ${attempt}/${maxAttempts + 1} de conexão com ${UPSTREAM}`);
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
      try {
        response = await fetch(UPSTREAM, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(id);

        console.log(`[UPSTREAM] Status da resposta: ${response.status}`);

        // se status 5xx, tentar novamente (até maxAttempts)
        if (response.status >= 500 && attempt <= maxAttempts) {
          console.log(`[UPSTREAM] Erro 5xx recebido. Aguardando para nova tentativa...`);
          try {
            // Clone response to read text without consuming original
            const errBody = await response.clone().text();
            console.log("[UPSTREAM] Corpo do erro 500:", errBody);
          } catch (e) { /* ignore */ }
          const backoff = 300 * attempt;
          await sleep(backoff);
          continue;
        }

        // para outros status (incluindo 4xx) não tentamos novamente
        break;
      } catch (err) {
        clearTimeout(id);
        lastError = err;
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[UPSTREAM] Erro na tentativa ${attempt}:`, errorMsg);

        // se for AbortError ou erro de rede, tenta novamente até maxAttempts
        if (attempt <= maxAttempts) {
          console.log(`[UPSTREAM] Aguardando para nova tentativa...`);
          const backoff = 300 * attempt;
          await sleep(backoff);
          continue;
        }
        break;
      }
    }

    if (!response) {
      const msg = String(lastError ?? 'Sem resposta do upstream');
      console.error('[UPSTREAM] Todas as tentativas falharam. Último erro:', msg);
      // retorna erro 502 para indicar gateway/proxy down
      return NextResponse.json({
        message: 'Serviço temporariamente indisponível',
        exception: 'O sistema de pagamento está fora do ar. Por favor, tente novamente em alguns minutos.',
        details: msg
      }, { status: 502 });
    }

    const text = await response.text();

    try {
      const json = JSON.parse(text);

      // Dispara append na planilha (não bloqueia a resposta se falhar)
      try {
        const j = json as unknown as Record<string, unknown>;
        const linkStr = typeof j.link === "string" ? j.link : "";
        const statusStr = typeof j.status === "string" ? j.status : String(response.status);

        // Subtotal que o usuário viu no UI (antes de compensação PIX)
        const uiSubtotal =
          typeof body.subtotal_cents === "number"
            ? Number((body.subtotal_cents / 100).toFixed(2))
            : typeof body.subtotal === "number"
              ? Number(body.subtotal.toFixed(2))
              : typeof body.valor_material === "number"
                ? Number(body.valor_material.toFixed(2))
                : undefined;

        const formaNome = paymentName(body.forma_pagamento);


        const participantesArr = (body.participantes as Array<Record<string, unknown>>) || [];
        const hasGuests = participantesArr.length > 0;
        const isIndividual = String(body.acomodacao || "").toLowerCase().includes("individual");
        const aceitarCompartilhar = Boolean(body.dividir_quarto_aceite);



        const buildBaseRow = (extras?: Partial<UpParticipant>) => {
          const unidadeIdPart = (extras?.unidade_id_participante as number | string | undefined) ?? body.unidade_id;
          const unidadeNome = escolaNomeById(unidadeIdPart);
          return {
            timestamp: new Date().toISOString(),
            nome_responsavel: String(body.nome_responsavel || ""),
            cpf_responsavel: String(body.cpf_responsavel || ""),
            rg_responsavel: String(body.rg || ""),
            email: String(body.email || ""),
            telefone: String(body.telefone || ""),
            data_nascimento_responsavel: String(body.data_nascimento_responsavel || ""),

            unidade_id: body.unidade_id,
            unidade_id_participante: unidadeIdPart,
            unidade_nome: unidadeNome,
            acomodacao: String(body.acomodacao || ""),
            dividir_quarto_aceite: Boolean(body.dividir_quarto_aceite),
            subtotal: uiSubtotal,
            forma_pagamento_nome: formaNome,
            gateway_link: linkStr,
            status: statusStr,
            nome_participante: String(extras?.nome_participante || extras?.nome || ""),
            cpf_participante: String(extras?.cpf_participante || extras?.cpf || ""),
            rg_participante: String(extras?.rg_participante || extras?.rg || ""),
            data_nascimento_participante: String(extras?.data_nascimento_participante || extras?.data_nascimento || ""),
            // se extras não tem tamanho, usamos o tamanho normalizado do responsável (se houver)
            tamanho_camisa_participante: String(extras?.tamanho_camisa_participante || extras?.tamanho_camisa || tamanhoResponsavel || ""),
            cargo_participante: String(extras?.cargo_participante || extras?.cargo || "Participante"),
          };
        };

        // Regras simplificadas:
        // - Individual OU aceitar compartilhar SEM convidados = apenas responsável
        // - Caso contrário = agregar convidados
        const join = (arr: string[]) => arr.filter(Boolean).map((s) => String(s).trim()).filter(Boolean).join("\n");

        let rowToWrite: SheetRow;

        if (isIndividual || (aceitarCompartilhar && !hasGuests)) {
          // Somente responsável
          rowToWrite = buildBaseRow() as SheetRow;
          rowToWrite.nome_participante = "";
          rowToWrite.cpf_participante = "";
          rowToWrite.rg_participante = "";
          rowToWrite.data_nascimento_participante = String(body.data_nascimento_responsavel ?? "");
          rowToWrite.tamanho_camisa_participante = String(tamanhoResponsavel ?? "");
          rowToWrite.unidade_id_participante = String(body.unidade_id ?? "");
          rowToWrite.unidade_nome = escolaNomeById(rowToWrite.unidade_id_participante);
        } else {
          // Tem convidados - agregar dados
          const nomes = join(participantesArr.map((p) => {
            const pp = p as UpParticipant;
            return pp.nome_participante || pp.nome || "";
          }));
          const cpfs = join(participantesArr.map((p) => {
            const pp = p as UpParticipant;
            return pp.cpf_participante || pp.cpf || "";
          }));
          const rgs = join(participantesArr.map((p) => {
            const pp = p as UpParticipant;
            return pp.rg_participante || pp.rg || "";
          }));
          const datas = join([
            String(body.data_nascimento_responsavel ?? ""),
            ...participantesArr.map((p) => {
              const pp = p as UpParticipant;
              return pp.data_nascimento_participante || pp.data_nascimento || "";
            }),
          ]);
          // incluir também o tamanho do responsável no início da lista de camisas
          const camisas = join([
            String(tamanhoResponsavel ?? ""),
            ...participantesArr.map((p) => {
              const pp = p as UpParticipant;
              return pp.tamanho_camisa_participante || pp.tamanho_camisa || "";
            }),
          ]);
          const unidadeIds = join(participantesArr.map((p) => {
            const pp = p as UpParticipant;
            return String((pp.unidade_id_participante as number | string | undefined) ?? body.unidade_id ?? "");
          }));
          const unidadeNomes = join(participantesArr.map((p) => {
            const pp = p as UpParticipant;
            const uid = (pp.unidade_id_participante as number | string | undefined) ?? body.unidade_id;
            return escolaNomeById(uid);
          }));

          const cargos = join(participantesArr.map((p) => {
            const pp = p as UpParticipant;
            return pp.cargo_participante || pp.cargo || "Participante";
          }));

          rowToWrite = buildBaseRow() as SheetRow;
          rowToWrite.nome_participante = nomes;
          rowToWrite.cpf_participante = cpfs;
          rowToWrite.rg_participante = rgs;
          rowToWrite.data_nascimento_participante = datas;
          rowToWrite.tamanho_camisa_participante = camisas;
          rowToWrite.cargo_participante = cargos;
          rowToWrite.unidade_id_participante = unidadeIds;
          rowToWrite.unidade_nome = unidadeNomes;
        }

        // Grava na planilha (aguarda conclusão para garantir que no Vercel a operação complete)
        // Grava na planilha (aguarda conclusão para garantir que no Vercel a operação complete)
        console.log("[SHEET] Preparando para gravar na planilha...");
        // console.log("[SHEET] Dados a serem gravados:", JSON.stringify(rowToWrite, null, 2)); // REMOVIDO POR SEGURANÇA (PII)

        try {
          console.log("[SHEET] Iniciando gravação na planilha...");
          await appendInscricaoRow(rowToWrite);
          console.log("[SHEET] Planilha gravada com sucesso!");
        } catch (e) {
          // Log do erro mas não bloqueia resposta (apenas registra)
          console.error("[SHEET ERROR] Erro ao gravar na planilha:", e instanceof Error ? e.message : String(e));
          console.error("[SHEET ERROR] Stack trace:", e instanceof Error ? e.stack : "N/A");
          // Não lança o erro para não bloquear a resposta ao usuário
        }
      } catch (e) {
        // Erro ao montar dados da planilha - não bloqueia
        console.error("[SHEET ERROR] Erro ao preparar dados da planilha:", e instanceof Error ? e.message : String(e));
        console.error("[SHEET ERROR] Stack trace:", e instanceof Error ? e.stack : "N/A");
      }

      // repassa o status upstream quando possível
      return NextResponse.json(json, { status: response.status });
    } catch {
      // texto livre (não-JSON)
      return new NextResponse(text, { status: response.status, headers: { "Content-Type": "text/plain" } });
    }


    // retorne normalmente a resposta ao cliente
  } catch (error: unknown) {
    console.error("Erro na rota /api/convecao:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message ?? "Erro interno" }, { status: 500 });
  }
}
