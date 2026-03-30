export function onlyDigits(s: string) {
    return String(s || "").replace(/\D+/g, "");
}

export function formatCPF(input?: string) {
    const s = onlyDigits(String(input || ""));
    if (!s) return "";
    if (s.length <= 3) return s;
    if (s.length <= 6) return `${s.slice(0, 3)}.${s.slice(3)}`;
    if (s.length <= 9) return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6)}`;
    return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9, 11)}`;
}

export function formatRg(input?: string) {
    const s = onlyDigits(String(input || ""));
    if (!s) return "";
    if (s.length <= 2) return s;
    if (s.length <= 5) return `${s.slice(0, 2)}.${s.slice(2)}`;
    if (s.length <= 8) return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5)}`;
    if (s.length <= 9) return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}-${s.slice(8, 9)}`;
    // Novo RG: até 10 dígitos
    return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}-${s.slice(8, 10)}`;
}


export function formatPhone(input?: string) {
    const s = onlyDigits(String(input || ""));
    if (!s) return "";
    // Brasil: DDD (2) + number (8 ou 9)
    if (s.length <= 2) return s;
    if (s.length <= 6) return `${s.slice(0, 2)} ${s.slice(2)}`;
    if (s.length <= 10) return `${s.slice(0, 2)} ${s.slice(2, 6)}-${s.slice(6)}`;
    // 11+ digits (treat as DDD + 9-digit number)
    return `${s.slice(0, 2)} ${s.slice(2, 7)}-${s.slice(7, 11)}`;
}


/**
 * Valida CPF usando o algoritmo de dígitos verificadores
 * @param cpf - CPF com ou sem formatação
 * @returns true se o CPF é válido, false caso contrário
 */
export function isValidCPF(cpf: string): boolean {
    const digits = onlyDigits(cpf);

    // CPF deve ter exatamente 11 dígitos
    if (digits.length !== 11) return false;

    // Rejeita CPFs com todos os dígitos iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(digits)) return false;

    // Calcula o primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(digits.charAt(i)) * (10 - i);
    }
    let firstDigit = 11 - (sum % 11);
    if (firstDigit >= 10) firstDigit = 0;

    // Verifica o primeiro dígito
    if (parseInt(digits.charAt(9)) !== firstDigit) return false;

    // Calcula o segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(digits.charAt(i)) * (11 - i);
    }
    let secondDigit = 11 - (sum % 11);
    if (secondDigit >= 10) secondDigit = 0;

    // Verifica o segundo dígito
    return parseInt(digits.charAt(10)) === secondDigit;
}

const validators = { onlyDigits, formatCPF, formatRg, formatPhone, isValidCPF };
export default validators;
