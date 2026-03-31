"use client";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { inscricaoSchema, type Inscricao, type Participante } from "@/lib/schemas";
import { onlyDigits } from "@/lib/validators";
import { enviarInscricao } from "@/services/convencaoService";
import { calcSubtotalCents } from "@/services/pricing/pricing";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FormConvidados from "../_components/InscricaoUnica/FormConvidados";
import FormResponsavel from "../_components/InscricaoUnica/FormResponsavel";
import Subtotal from "../_components/InscricaoUnica/Subtotal";
import style from "./page.module.css";

interface Props {
    session: any;
}

export default function InscricaoExtraClient({ session }: Props) {
    const [dados, setDados] = useState<Partial<Inscricao>>({
        acomodacao: "Dupla",
        participantes: [],
        forma_pagamento: 3,
        parcelas: 10,
        installments: 10
    });

    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [modalSpinLoading, setModalSpinLoading] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [shake, setShake] = useState(false);

    // Validação reativa do formulário
    const validation = useMemo(() => {
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

        if (!result.success) {
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
                nome_participante: "Nome do participante",
                cpf_participante: "CPF do participante",
                rg_participante: "RG do participante",
                data_nascimento_participante: "Data de nascimento",
                cargo_participante: "Cargo",
                tamanho_camisa_participante: "Tamanho da camisa",
                unidade_id_participante: "Escola",
            };

            for (const it of issues) {
                const path = it.path;
                if (path[0] === "participantes" && typeof path[1] === "number") {
                    const idx = path[1] as number;
                    const field = String(path[2] ?? "campo") as keyof Participante;
                    if (!errorsGuests[idx]) errorsGuests[idx] = {};
                    const msg = normalizeMessage(it.message);
                    if (!errorsGuests[idx][field]) errorsGuests[idx][field] = msg;
                    const label = guestLabels[field as string] ?? String(field);
                    messages.push(`Convidado ${idx + 1}: ${label} - ${msg}`);
                } else {
                    const key = String(path[0] ?? "") as keyof Inscricao;
                    const msg = normalizeMessage(it.message);
                    if (key && !errorsTop[key]) errorsTop[key] = msg;
                    const label = topLabels[key as string] ?? String(key || "campo");
                    messages.push(`${label}: ${msg}`);
                }
            }
            return { ok: false, errorsTop, errorsGuests, messages };
        }

        return { ok: true, data: result.data as Inscricao, messages: [] };
    }, [dados]);

    const doSubmit = async () => {
        setLoading(true);
        setModalSpinLoading(true);
        setServerError(null);
        try {
            const unidadeIdNum = Number(dados.unidade_id);
            const payload = {
                ...dados,
                dividir_quarto_aceite: false,
                unidade_id: unidadeIdNum,
                data_nascimento_responsavel: dados.data_nascimento_responsavel || "",
                forma_pagamento: Number(dados.forma_pagamento ?? 3),
                quantidade_parcelas: Number(dados.parcelas || dados.installments || 10),
                participantes: (dados.participantes || []).map((p, i) => ({
                    ...p,
                    cpf_participante: onlyDigits(p.cpf_participante || ""),
                    rg_participante: onlyDigits(p.rg_participante || ""),
                    unidade_id_participante: Number(p.unidade_id_participante || unidadeIdNum || 0),
                })),
            } as Inscricao;

            const subtotalCents = calcSubtotalCents({
                acomodacao: payload.acomodacao,
                valor: payload.valor,
                data_nascimento_responsavel: payload.data_nascimento_responsavel,
                participantes: payload.participantes,
                ignoreResponsible: true,
            });

            const payloadWithTotals = {
                ...payload,
                subtotal_cents: subtotalCents,
                subtotal: Number((subtotalCents / 100).toFixed(2)),
                cpf_responsavel: onlyDigits(String(payload.cpf_responsavel || "")),
                rg: onlyDigits(String(payload.rg || "")),
                telefone: onlyDigits(String(payload.telefone || "")),
            };

            const resp = await enviarInscricao(payloadWithTotals, { debug: true });
            if (resp?.link) {
                window.location.href = resp.link;
            } else {
                setServerError(`Resposta inesperada: ${JSON.stringify(resp)}`);
            }
        } catch (e: any) {
            setServerError(e?.message || String(e));
        } finally {
            setLoading(false);
            setModalSpinLoading(false);
        }
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const onSubmit = async () => {
        setServerError(null);
        setShowValidation(true);

        if (!validation.ok) {
            triggerShake();
            return;
        }

        if (!dados.participantes || dados.participantes.length === 0) {
            setServerError('Adicione pelo menos um Participante Extra.');
            triggerShake();
            return;
        }

        await doSubmit();
    };

    return (
        <>
            <Header />
            <main className={style.mainContainer}>
                <section className={style.sectionMain}>
                    <h2>Inscrição Participante Extra</h2>
                    <p>Preencha os dados do responsável financeiro (pagante) e adicione os participantes extras abaixo.</p>

                    {/* Resumo de Erros no Topo */}
                    {showValidation && !validation.ok && (
                        <div className={style.errorSummary}>
                            <h4><AlertCircle size={20} /> Ops! Revise o formulário</h4>
                            <ul className={style.errorList}>
                                {validation.messages.map((m, i) => (
                                    <li key={i} className={style.errorItem}>
                                        <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                                        {m}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <section className={style.formSection}>
                        <h3 className={style.formTitle}>Responsável Financeiro</h3>
                        <FormResponsavel
                            value={dados}
                            onChange={(next) => setDados(next)}
                            errors={showValidation && !validation.ok ? validation.errorsTop : {}}
                        />
                    </section>

                    <section className={style.formSection}>
                        <h3 className={style.formTitle}>Participantes Extras</h3>
                        <FormConvidados
                            value={Array.isArray(dados.participantes) ? (dados.participantes as Participante[]) : []}
                            onChange={(list) => setDados({ ...dados, participantes: list })}
                            unidadeId={Number(dados.unidade_id) || undefined}
                            errors={showValidation && !validation.ok ? validation.errorsGuests : []}
                        />
                    </section>

                    <section className={style.formSection}>
                        <h3 className={style.formTitle}>Forma de Pagamento</h3>
                        <div style={{ display: "grid", gap: 12, paddingTop: 10 }}>
                            {[
                                { id: 3, label: "PIX (5% Desconto)" },
                                { id: 1, label: "Cartão de Crédito" },
                                { id: 2, label: "Boleto Bancário" }
                            ].map((opt) => (
                                <label key={opt.id} style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer", fontSize: "1rem" }}>
                                    <input
                                        type="radio"
                                        name="forma_pagamento"
                                        style={{ accentColor: "var(--color-yes)", width: 18, height: 18 }}
                                        checked={(dados.forma_pagamento ?? 3) === opt.id}
                                        onChange={() => setDados({ ...dados, forma_pagamento: opt.id })}
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className={style.formSection}>
                        <Subtotal dados={dados as Record<string, unknown>} ignoreResponsible={true} />
                    </section>

                    {serverError && (
                        <div className={`${style.errorSummary} ${shake ? style.shake : ""}`}>
                            <h4><AlertCircle size={20} /> Erro ao processar</h4>
                            <p className={style.errorItem}>{serverError}</p>
                        </div>
                    )}

                    <div className={style.buttonContainer}>
                        <button
                            onClick={onSubmit}
                            className={`${style.buttonSend} ${shake ? style.shake : ""}`}
                            disabled={loading}
                        >
                            {loading ? "Processando..." : "Finalizar Inscrição Extra"}
                        </button>
                    </div>

                    {modalSpinLoading && (
                        <section className={style.modalOverlay}>
                            <div className={style.modalBoxSpin}>
                                <div className={style.spinner}></div>
                                <p>Validando dados e preparando pagamento...</p>
                            </div>
                        </section>
                    )}
                </section>
            </main>
            <Footer />
        </>
    );
}
