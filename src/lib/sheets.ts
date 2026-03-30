import { google } from "googleapis";

function getJwt() {
    console.log("[JWT] Configurando autenticação");
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || "";
    const rawKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY || "";

    console.log(`[JWT] Client email definido: ${!!clientEmail}`);
    console.log(`[JWT] Private key definida: ${!!rawKey}`);

    if (!clientEmail || !rawKey) {
        console.error("[JWT ERROR] Credenciais do Google Sheets ausentes");
        throw new Error("Credenciais do Google Sheets ausentes");
    }

    let privateKey = rawKey;

    // Tenta múltiplos formatos de chave
    if (privateKey.includes("\\n")) {
        privateKey = privateKey.replace(/\\n/g, "\n");
    }

    // Se for base64, decodifica
    if (!privateKey.includes("-----BEGIN") && /^[A-Za-z0-9+/=\s]+$/.test(privateKey.trim())) {
        try {
            const decoded = Buffer.from(privateKey.trim(), "base64").toString("utf8");
            if (decoded.includes("-----BEGIN")) {
                privateKey = decoded;
            }
        } catch {
            // não era base64, continua
        }
    }

    // Remove aspas
    privateKey = privateKey.replace(/^["']|["']$/g, "");

    // Valida formato
    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
        throw new Error("Private key com formato inválido");
    }

    console.log("[JWT] Criando instância JWT...");
    return new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
}

export type SheetRow = {
    // dados do responsável/inscrição
    timestamp: string;
    nome_responsavel: string;
    cpf_responsavel: string;
    rg_responsavel?: string;
    data_nascimento_responsavel?: string;
    email?: string;
    telefone?: string;

    // resumo da inscrição
    acomodacao?: string;
    dividir_quarto_aceite?: boolean | string;
    subtotal?: number | string;
    forma_pagamento_nome?: string; // traduzida
    gateway_link?: string;
    status?: string;

    // participante (pode ser vazio quando individual/aceite dividir quarto)
    nome_participante?: string;
    cpf_participante?: string;
    rg_participante?: string;
    data_nascimento_participante?: string;
    tamanho_camisa_participante?: string;
    cargo_participante?: string;

    // unidade/escola
    unidade_id?: number | string;
    unidade_id_participante?: number | string;
    unidade_nome?: string;
};

function normalizeAceite(v: boolean | string | undefined) {
    if (typeof v === "boolean") return v;
    const s = String(v ?? "").trim().toLowerCase();
    return ["1", "true", "sim", "yes", "y"].includes(s);
}

function rowToValues(row: SheetRow) {
    const dividir = normalizeAceite(row.dividir_quarto_aceite);
    return [
        // 1) básicos
        row.timestamp,
        row.nome_responsavel,
        row.cpf_responsavel,
        row.rg_responsavel || "",
        row.data_nascimento_responsavel || "",
        row.email || "",
        row.telefone || "",


        // 2) resumo e pagamento
        row.acomodacao || "",
        dividir ? "SIM" : "NÃO",
        row.subtotal ?? "",
        row.forma_pagamento_nome || "",
        row.gateway_link || "",
        row.status || "",

        // 3) participante
        row.nome_participante || "",
        row.cpf_participante || "",
        row.rg_participante || "",
        row.data_nascimento_participante || "",
        row.tamanho_camisa_participante || "",
        row.cargo_participante || "",

        // 4) escola
        String(row.unidade_id_participante ?? row.unidade_id ?? ""),
        row.unidade_nome || "",
    ];
}

async function getNextRowA(sheets: ReturnType<typeof google.sheets>, spreadsheetId: string, sheetName: string) {
    const colA = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueRenderOption: "UNFORMATTED_VALUE",
    });
    const filled = colA.data.values?.length ?? 0;
    return Math.max(2, filled + 1);
}

export async function appendInscricaoRows(rows: SheetRow[]) {
    console.log("[SHEETS] appendInscricaoRows - Iniciando");
    console.log(`[SHEETS] Número de linhas a inserir: ${rows?.length || 0}`);

    if (!rows || rows.length === 0) {
        console.log("[SHEETS] Nenhuma linha para inserir, retornando");
        return;
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
    const sheetName = "participantes";

    console.log(`[SHEETS] Configurações:
    - spreadsheetId: ${spreadsheetId}
    - sheetName: ${sheetName}`);

    if (!spreadsheetId) {
        throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID não configurado");
    }

    console.log("[SHEETS] Obtendo autenticação JWT...");
    const auth = getJwt();
    console.log("[SHEETS] JWT obtido com sucesso");

    console.log("[SHEETS] Criando cliente Google Sheets...");
    const sheets = google.sheets({ version: "v4", auth });

    console.log("[SHEETS] Obtendo próxima linha disponível...");
    const nextRow = await getNextRowA(sheets, spreadsheetId, sheetName);
    console.log(`[SHEETS] Próxima linha: ${nextRow}`);

    console.log("[SHEETS] Convertendo dados para valores...");
    const values = rows.map(rowToValues);
    // console.log(`[SHEETS] Valores convertidos: ${JSON.stringify(values, null, 2)}`); // REMOVIDO POR SEGURANÇA (PII)

    const endRow = nextRow + values.length - 1;
    const targetRange = `${sheetName}!A${nextRow}:U${endRow}`;
    console.log(`[SHEETS] Range de destino: ${targetRange}`);

    console.log("[SHEETS] Enviando dados para Google Sheets...");
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: targetRange,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            majorDimension: "ROWS",
            values,
        },
    });
    console.log("[SHEETS] Dados enviados com sucesso para Google Sheets!");
}

export async function appendInscricaoRow(row: SheetRow) {
    return appendInscricaoRows([row]);
}
