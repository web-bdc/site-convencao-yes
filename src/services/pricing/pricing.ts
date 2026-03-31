export const EVENT_REF_DATE = new Date("2025-12-31");

// Seus valores já em centavos
export const PRICING = {
  individualCents: Number(3700) * 100,
  adultCents: Number(3700) * 100,
  between12and17Cents: Number(3700) * 100,
  under12Cents: Number(0) * 100,
};


// Helper: Converte datas em string para um formato ISO seguro (YYYY-MM-DD)
function parseDateString(dateStr: string): string {
  // 1. Checa se está no formato "DD/MM/YYYY"
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    // 2. Converte para "YYYY-MM-DD"
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }

  // 3. Se não for DD/MM/YYYY, retorna a string original
  return dateStr;
}


// Calcula a idade de uma pessoa em uma data de referência.

export function ageAt(dateStr?: string | null, ref: Date = EVENT_REF_DATE): number | null {
  if (!dateStr) {
    return null;
  }

  // 1. Limpa a string da data para garantir o formato correto
  const safeDateStr = parseDateString(String(dateStr));

  // 2. Cria a data a partir da string segura
  const birthDate = new Date(safeDateStr);

  // 3. Verifica se a data é válida
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  // 4. Lógica de cálculo da idade
  let age = ref.getFullYear() - birthDate.getFullYear();
  const m = ref.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && ref.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export function calcSubtotalCents(data: {
  acomodacao?: string;
  valor?: number | string;
  data_nascimento?: string | null;
  data_nascimento_responsavel?: string | null;
  participantes?: Array<{ data_nascimento_participante?: string | null }>;
  ignoreResponsible?: boolean;
}): number {
  if (!data) return 0;
  const participantes = Array.isArray(data.participantes) ? data.participantes : [];
  const responsibleBirth = data.data_nascimento_responsavel || data.data_nascimento || null;

  // Se ignoreResponsible for true, não adiciona o responsável na lista de cobrança
  const all = data.ignoreResponsible
    ? [...participantes]
    : [{ data_nascimento_participante: responsibleBirth }, ...participantes];

  const acomodacao = String(data.acomodacao || "Individual").toLowerCase();
  const valorUnitFront = Number(data.valor) || 0;
  const baseAdultCents = valorUnitFront > 0 ? Math.round(valorUnitFront * 100) : PRICING.adultCents;
  const isIndividual = acomodacao.includes("individual");
  const priceForAdultCents = isIndividual ? PRICING.individualCents : baseAdultCents;

  let total = 0;
  for (const p of all) {
    const age = ageAt(p?.data_nascimento_participante ?? undefined);
    if (age === null) total += priceForAdultCents;
    else if (age < 12) total += PRICING.under12Cents;
    else if (age >= 12 && age <= 17) total += PRICING.between12and17Cents;
    else total += priceForAdultCents;
  }
  return total;
}
