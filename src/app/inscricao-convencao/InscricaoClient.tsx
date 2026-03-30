"use client";

import Countdown from "@/components/Countdown";


import Footer from "@/components/Footer/page";
import Header from "@/components/Header";
import FormConvidados from "@/components/InscricaoUnica/FormConvidados";
import FormResponsavel from "@/components/InscricaoUnica/FormResponsavel";
import Subtotal from "@/components/InscricaoUnica/Subtotal";
import { calcSubtotalCents } from "@/lib/pricing";
import { inscricaoSchema, type Inscricao, type Participante } from "@/lib/schemas";
import { onlyDigits } from "@/lib/validators";
import { enviarInscricao } from "@/services/convecaoService";
import { useEffect, useMemo, useState } from "react";
import style from "./page.module.css";

interface InscricaoClientProps {
    targetDate: string;
}

export default function InscricaoClient({ targetDate }: InscricaoClientProps) {
    const [dados, setDados] = useState<Partial<Inscricao>>({
        acomodacao: "Dupla",
        participantes: [],
        forma_pagamento: 3,
        parcelas: 10,
        installments: 10
    });
    // erros agregados (mensagem única para simplicidade)
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [shareOpen, setShareOpen] = useState(false);
    const [modalSpinLoading, setModalSpinLoading] = useState(false);
    const [shareAccepted, setShareAccepted] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    // validação reativa com Zod + coleta de mensagens por campo
    const zodResult = useMemo((): {
        ok: true; data: Inscricao;
        errorsTop: Partial<Record<keyof Inscricao, string>>;
        errorsGuests: Array<Partial<Record<keyof Participante, string>>>;
        messages: string[];
    } | {
        ok: false; error: unknown;
        errorsTop: Partial<Record<keyof Inscricao, string>>;
        errorsGuests: Array<Partial<Record<keyof Participante, string>>>;
        messages: string[];
    } => {
        const errorsTop: Partial<Record<keyof Inscricao, string>> = {};
        const errorsGuests: Array<Partial<Record<keyof Participante, string>>> = [];
        const messages: string[] = [];

        const normalizeMessage = (raw: string): string => {
            const s = String(raw || "");
            if (s === "Required" || /received undefined/i.test(s)) return "Campo obrigatório";
            if (/Invalid input/i.test(s) && /expected string/i.test(s)) return "Informe um texto válido";
            if (/String must contain at least 1 character/i.test(s)) return "Campo obrigatório";
            return s;
        };

        const input = {
            ...dados,
            unidade_id: typeof dados.unidade_id === "string" ? Number(dados.unidade_id) : dados.unidade_id,
            participantes: Array.isArray(dados.participantes) ? dados.participantes : [],
        } as Partial<Inscricao>;
        const result = inscricaoSchema.partial({ valor: true, forma_pagamento: true }).safeParse(input);
        if (result.success) {
            return { ok: true as const, data: result.data as Inscricao, errorsTop, errorsGuests, messages };
        }
        const issues = result.error.issues ?? [];
        const topLabels: Record<string, string> = {
            nome_responsavel: "Nome do responsável",
            cpf_responsavel: "CPF do responsável",
            email: "Email do responsável",
            telefone: "Telefone do responsável",
            unidade_id: "Escola do responsável",
            data_nascimento_responsavel: "Data de nascimento do responsável",
            acomodacao: "Acomodação",
            forma_pagamento: "Forma de pagamento",
        };
        const guestLabels: Record<string, string> = {
            nome_participante: "Nome do convidado",
            cpf_participante: "CPF do convidado",
            rg_participante: "RG do convidado",
            data_nascimento_participante: "Data de nascimento do convidado",
            cargo_participante: "Cargo do convidado",
            tamanho_camisa_participante: "Tamanho da camisa do convidado",
            unidade_id_participante: "Escola do convidado",
        };
        for (const it of issues) {
            const path = Array.isArray(it.path) ? it.path : [];
            if (path[0] === "participantes" && typeof path[1] === "number") {
                const idx = path[1] as number;
                const field = String(path[2] ?? "campo") as keyof Participante;
                if (!errorsGuests[idx]) errorsGuests[idx] = {};
                const msg = normalizeMessage(it.message);
                if (!errorsGuests[idx][field]) errorsGuests[idx][field] = msg;
                const label = guestLabels[field as string] ?? String(field);
                messages.push(`• Convidado ${idx + 1} - ${label}: ${msg}`);
            } else {
                const key = String(path[0] ?? "") as keyof Inscricao;
                const msg = normalizeMessage(it.message);
                if (key && !errorsTop[key]) errorsTop[key] = msg;
                const label = topLabels[key as string] ?? String(key || "campo");
                messages.push(`• ${label}: ${msg}`);
            }
        }
        return { ok: false as const, error: result.error, errorsTop, errorsGuests, messages };
    }, [dados]);

    const isValid = zodResult.ok === true;

    // mostra convidados somente para Duplo/Triplo
    const showConvidados = (dados.acomodacao === "Dupla" || dados.acomodacao === "Tripla");

    // opções de pagamento dinâmicas
    const paymentOptions = useMemo(() => (
        [
            { value: 3, label: "PIX" },
            { value: 1, label: "Cartão de Crédito" },
            { value: 2, label: "Boleto" },
        ]
    ), []);

    // quando acomodação trocar para Individual, limpar participantes
    const handleChangeResponsavel = (next: Partial<Inscricao>) => {
        if (next?.acomodacao === "Individual" && (dados.acomodacao !== "Individual")) {
            setDados({ ...next, participantes: [] });
            setShareAccepted(false);
            return;
        }
        setDados(next);
    };

    const doSubmit = async (acceptedOverride?: boolean) => {
        setLoading(true);
        setModalSpinLoading(true);
        try {
            const unidadeIdNum = Number(dados.unidade_id);
            const dataResp = dados.data_nascimento_responsavel || "";

            if (!dados.nome_responsavel || !dados.cpf_responsavel || !unidadeIdNum || !dataResp) {
                setMsg("Preencha Nome, CPF, Escola e Data de nascimento do responsável.");
                setLoading(false);
                return;
            }

            const accepted = typeof acceptedOverride === "boolean" ? acceptedOverride : (shareAccepted || false);

            const payload = {
                ...dados,
                dividir_quarto_aceite: accepted,
                unidade_id: unidadeIdNum,
                data_nascimento_responsavel: dados.data_nascimento_responsavel || "",
                forma_pagamento: Number(dados.forma_pagamento ?? 3),
                quantidade_parcelas: Number(dados.parcelas || dados.installments || 10),
                participantes: (dados.participantes || []).map((p, i) => ({
                    nome_participante: p.nome_participante || `Participante ${i + 1}`,
                    cpf_participante: onlyDigits(p.cpf_participante || ""),
                    rg_participante: onlyDigits(p.rg_participante || ""),
                    data_nascimento_participante: p.data_nascimento_participante || "",
                    unidade_id_participante: Number(p.unidade_id_participante || unidadeIdNum || 0),
                })),
            } as Inscricao;

            const subtotalCents = calcSubtotalCents({
                acomodacao: payload.acomodacao,
                valor: payload.valor,
                data_nascimento: payload.data_nascimento_responsavel,
                data_nascimento_responsavel: payload.data_nascimento_responsavel,
                participantes: payload.participantes,
            } as unknown as {
                acomodacao?: string;
                valor?: number | string;
                data_nascimento?: string | null;
                data_nascimento_responsavel?: string | null;
                participantes?: Array<{ data_nascimento_participante?: string | null }>;
            });

            const payloadWithTotals: Inscricao & { subtotal_cents?: number; subtotal?: number } = payload as Inscricao & {
                subtotal_cents?: number;
                subtotal?: number;
            };
            payloadWithTotals.subtotal_cents = subtotalCents;
            payloadWithTotals.subtotal = Number((subtotalCents / 100).toFixed(2));

            // Normalizações finais: remova formatação antes de enviar
            payloadWithTotals.cpf_responsavel = onlyDigits(String(payloadWithTotals.cpf_responsavel || ""));
            payloadWithTotals.rg = onlyDigits(String(payloadWithTotals.rg || ""));
            payloadWithTotals.telefone = onlyDigits(String(payloadWithTotals.telefone || ""));

            const resp = await enviarInscricao(payloadWithTotals, { debug: true });
            if (resp && typeof resp === "object" && "link" in (resp as Record<string, unknown>)) {
                const link = (resp as Record<string, unknown>).link as string;
                if (link) window.location.href = link;
            } else {
                setMsg(`Resposta do servidor: ${JSON.stringify(resp)}`);
            }
        } catch (e: unknown) {
            setMsg(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
            setModalSpinLoading(false);
        }
    };

    const onSubmit = async () => {
        setMsg(null);
        setShowErrors(true);
        if (!isValid) {
            setMsg('Existem campos obrigatórios pendentes.');
            return;
        }
        const noGuests = !Array.isArray(dados.participantes) || dados.participantes.length === 0;
        if ((dados.acomodacao === "Dupla" || dados.acomodacao === "Tripla") && noGuests && !shareAccepted) {
            setShareOpen(true);
            return;
        }
        await doSubmit();
    };



    // Prevent background scroll when modal is open
    useEffect(() => {
        if (typeof window === "undefined") return;
        const prev = document.body.style.overflow;
        if (modalSpinLoading) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = prev || "";
        }
        return () => {
            document.body.style.overflow = prev || "";
        };
    }, [modalSpinLoading]);

    return (
        <>
            <Header />
            <main className={style.mainContainer}>
                {/* Countdown inserido acima do conteúdo principal */}
                <Countdown targetDate={targetDate} />
                <section className={style.sectionMain}>
                    <h2>Cadastro do Responsável</h2>
                    <p>Preencha os informações de acordo com os campos abaixo.</p>
                    <section className={style.formSection}>
                        <h3 className={style.formTitle}>Responsável</h3>
                        <FormResponsavel value={dados} onChange={handleChangeResponsavel} errors={showErrors && zodResult.ok === false ? zodResult.errorsTop : ({} as Partial<Record<keyof Inscricao, string>>)} />
                    </section>

                    {showConvidados && (
                        <section className={style.formSection}>
                            <h3 className={style.formTitle}>Convidados</h3>
                            <FormConvidados
                                value={Array.isArray(dados.participantes) ? (dados.participantes as unknown as Participante[]) : []}
                                onChange={(list) => setDados({ ...dados, participantes: list })}
                                unidadeId={Number(dados.unidade_id) || undefined}

                            />
                        </section>
                    )}
                    <section className={style.formSection}>
                        <h3 className={style.formTitle}>Forma de pagamento</h3>
                        <div style={{ display: "grid", gap: 8 }}>
                            {paymentOptions.map((opt) => (
                                <label key={opt.value} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <input
                                        type="radio"
                                        name="forma_pagamento"
                                        checked={(dados.forma_pagamento ?? 3) === opt.value}
                                        onChange={() => setDados({ ...dados, forma_pagamento: opt.value })}
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </section>
                    <section className={style.formSection}>
                        <Subtotal dados={dados as unknown as Record<string, unknown>} />
                    </section>



                    {msg && (
                        <div style={{ marginTop: 16, color: "#b00", whiteSpace: "pre-line", fontWeight: "bold" }}>{msg}</div>
                    )}

                    <div className={style.buttonContainer}>
                        <button onClick={onSubmit} className={style.buttonSend} >
                            {loading ? "Processando..." : "Finalizar Inscrição"}
                        </button>
                    </div>

                    {shareOpen && (
                        <div className={style.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="dlg-title">
                            <div className={style.modalBox}>
                                <h4 id="dlg-title">Aceitar dividir quarto?</h4>
                                <p>
                                    Você selecionou acomodação {dados.acomodacao}.
                                    Como não adicionou convidados, você entrará em uma lista
                                    para divisão aleatória de quarto com outros participantes. Confirma?
                                </p>
                                <div className={style.modalActions}>
                                    <button className={style.buttonCancel} onClick={() => { setShareOpen(false); setShareAccepted(false); }}>Cancelar</button>
                                    <button className={style.buttonSend} onClick={async () => { setShareAccepted(true); setShareOpen(false); await doSubmit(true); }}>Aceito e continuar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {
                        modalSpinLoading && (
                            <section className={style.modalOverlay} role="alert" aria-live="assertive">
                                <div className={style.modalBoxSpin}>
                                    <div className={style.spinner} aria-hidden="true"></div>
                                    <p>Enviando inscrição, para pagamento.</p>
                                </div>
                            </section>
                        )
                    }

                </section>

            </main>
            <Footer />
        </>
    );
}
