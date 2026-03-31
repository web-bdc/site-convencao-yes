/* eslint-disable @typescript-eslint/no-explicit-any */
export async function enviarInscricao(
  datas: any,
  opts?: { retries?: number; timeoutMs?: number; debug?: boolean }
) {
  const retries = Number(opts?.retries ?? 2);
  const timeoutMs = Number(opts?.timeoutMs ?? 15000);
  const debug = String(opts?.debug ?? "false").toLowerCase() === "true";

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  let attempt = 0;
  let lastErr: unknown = null;

  const payload = typeof datas === "string" ? datas : JSON.stringify(datas);

  while (attempt <= retries) {
    attempt += 1;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch("/api/convecao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        signal: controller.signal,
      });
      clearTimeout(id);

      const text = await response.text();

      // tenta parsear JSON quando possível
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = null;
      }

      if (!response.ok) {
        // 5xx: pode ser transitório — retentar
        if (response.status >= 500 && attempt <= retries) {
          lastErr = new Error(`Upstream error ${response.status}: ${text}`);
          // backoff simples
          await sleep(200 * attempt);
          continue;
        }

        // Extrai apenas a mensagem de erro do objeto JSON
        const errorMessage = parsed && typeof parsed === 'object' && 'error' in parsed
          ? String(parsed.error)
          : (typeof parsed === 'object' ? JSON.stringify(parsed) : text);

        const err = new Error(errorMessage);
        // attach parsed body for callers who want more detail
        (err as any).status = response.status;
        (err as any).body = parsed ?? text;
        throw err;
      }

      // ok
      return parsed ?? text;
    } catch (error) {
      clearTimeout(id);
      lastErr = error;
      // abort or network error: tentar novamente até esgotar
      if (attempt <= retries) {
        if (debug) {
          console.warn(`enviarInscricao: tentativa ${attempt} falhou, retrying...`, error);
        }
        await sleep(200 * attempt);
        continue;
      }
      // esgotou tentativas
      if (debug) {
        console.error("enviarInscricao - falha final:", error);
      }
      throw error;
    }
  }

  // se saiu do loop sem resposta
  throw lastErr ?? new Error("Falha ao enviar inscrição: sem resposta");
}
