"use client";
import unidades from "@/db/escolas.json";
import type { Inscricao } from "@/lib/schemas";
import { formatCPF, formatPhone, formatRg, isValidCPF, onlyDigits } from "@/lib/validators";
import { useMemo, useState } from "react";
import style from "./FormResponsavel.module.css";


type Props = {
  value: Partial<Inscricao>;
  onChange: (next: Partial<Inscricao>) => void;
  errors?: Partial<Record<keyof Inscricao, string>>;
  hideAccommodation?: boolean;
};

export default function FormResponsavel({ value, onChange, errors, hideAccommodation }: Props) {
  const v = value || {};
  const errs = errors || {};

  // Estado local para validação dinâmica de CPF
  const [cpfError, setCpfError] = useState<string | null>(null);

  const escolasOrdenadas = useMemo(() => {
    return unidades.escolas.slice().sort((a, b) => a.nome.localeCompare(b.nome));
  }, []);

  // Validação dinâmica de CPF
  const handleCpfBlur = () => {
    const cpf = v.cpf_responsavel;
    if (!cpf) {
      setCpfError("CPF é obrigatório");
      return;
    }

    const digits = onlyDigits(cpf);
    if (digits.length < 11) {
      setCpfError("CPF incompleto");
      return;
    }

    if (!isValidCPF(cpf)) {
      setCpfError("CPF inválido. Verifique os dígitos.");
      return;
    }

    setCpfError(null);
  };

  // Limpa erro ao digitar
  const handleCpfChange = (value: string) => {
    setCpfError(null);
    onChange({ ...v, cpf_responsavel: formatCPF(value) });
  };


  return (
    <div className={style.formSection}>
      <form className={style.formGrid}>
        <label className={style.formLabel}>
          <h3>Nome do responsável</h3>
          <input
            value={v.nome_responsavel ?? ""}
            className={style.input}
            placeholder="Nome completo"
            aria-invalid={Boolean(errs.nome_responsavel) || undefined}
            style={errs.nome_responsavel ? { borderColor: "#b00" } : undefined}
            onChange={(e) => onChange({ ...v, nome_responsavel: e.target.value })}
            required
          />
          {errs.nome_responsavel && (
            <small style={{ color: "#b00" }}>{errs.nome_responsavel}</small>
          )}

        </label>
        <label className={style.formLabel}>
          <h3>CPF</h3>
          <input
            value={v.cpf_responsavel ?? ""}
            className={style.input}
            placeholder="000.000.000-00"
            aria-invalid={Boolean(errs.cpf_responsavel || cpfError) || undefined}
            style={(errs.cpf_responsavel || cpfError) ? { borderColor: "#b00" } : undefined}
            onChange={(e) => handleCpfChange(e.target.value)}
            onBlur={handleCpfBlur}
            required
          />
          {(cpfError || errs.cpf_responsavel) && (
            <small style={{ color: "#b00", fontWeight: "bold" }}>
              {cpfError || errs.cpf_responsavel}
            </small>
          )}

        </label>
        <label className={style.formLabel}>
          <h3>RG</h3>
          <input
            value={v.rg ?? ""}
            className={style.input}
            placeholder="00.000.000-0"
            aria-invalid={Boolean(errs.rg) || undefined}
            style={errs.rg ? { borderColor: "#b00" } : undefined}
            onChange={(e) => onChange({ ...v, rg: formatRg(e.target.value) })}
          />
          {errs.rg && (
            <small style={{ color: "#b00" }}>{errs.rg}</small>
          )}

        </label>
        <label className={style.formLabel}>
          <h3>Data de nascimento</h3>
          <input
            type="date"
            value={v.data_nascimento_responsavel ?? ""}
            className={style.inputData}
            aria-invalid={Boolean(errs.data_nascimento_responsavel) || undefined}
            style={errs.data_nascimento_responsavel ? { borderColor: "#b00" } : undefined}
            onChange={(e) => onChange({ ...v, data_nascimento_responsavel: e.target.value })}
            required
          />
          {errs.data_nascimento_responsavel && (
            <small style={{ color: "#b00" }}>{errs.data_nascimento_responsavel}</small>
          )}

        </label>
        <label className={style.formLabel}>
          <h3>Telefone</h3>
          <input
            value={v.telefone ?? ""}
            className={style.input}
            placeholder="21 99999-9999"
            aria-invalid={Boolean(errs.telefone) || undefined}
            style={errs.telefone ? { borderColor: "#b00" } : undefined}
            onChange={(e) => onChange({ ...v, telefone: formatPhone(e.target.value) })}
            required
          />
          {errs.telefone && (
            <small style={{ color: "#b00" }}>{errs.telefone}</small>
          )}

        </label>
        <label className={style.formLabel}>
          <h3>Email</h3>
          <input
            value={v.email ?? ""}
            className={style.input}
            placeholder="email@exemplo.com"
            aria-invalid={Boolean(errs.email) || undefined}
            style={errs.email ? { borderColor: "#b00" } : undefined}
            onChange={(e) => onChange({ ...v, email: e.target.value })}
            required
          />
          {errs.email && (
            <small style={{ color: "#b00" }}>{errs.email}</small>
          )}

        </label>
        <label className={style.formLabel}>
          <h3>Escola</h3>
          <select
            value={v.unidade_id ?? ""}
            className={style.inputEscolas}
            aria-invalid={Boolean(errs.unidade_id) || undefined}
            style={errs.unidade_id ? { borderColor: "#b00" } : undefined}
            onChange={(e) => onChange({ ...v, unidade_id: Number(e.target.value) })}
            required
          >
            <option value="">Selecione...</option>
            {escolasOrdenadas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
          {errs.unidade_id && (
            <small style={{ color: "#b00" }}>{errs.unidade_id}</small>
          )}

        </label>
        {/* Ocultar acomocação se solicitado (ex: inscrição extra)
        {!hideAccommodation && (
          <label className={style.formLabel}>
            <h3>Acomodação</h3>
            <select
              value={v.acomodacao ?? ""}
              className={style.inputAcomodacao}
              aria-invalid={Boolean(errs.acomodacao) || undefined}
              style={errs.acomodacao ? { borderColor: "#b00" } : undefined}
              onChange={(e) =>
                onChange({ ...v, acomodacao: e.target.value as "Individual" | "Dupla" | "Tripla" })
              }
              required
            >
              <option value="">Selecione...</option>
              <option value="Individual">Individual</option>
              <option value="Dupla">Dupla</option>
              <option value="Tripla">Tripla</option>
            </select>
            {errs.acomodacao && (
              <small style={{ color: "#b00" }}>{errs.acomodacao}</small>
            )}

          </label>
        )}*/}
        {/*<label className={style.formLabel}>
          <h3>Tamanho da camisa</h3>
          <select
            value={v.tamanho_camisa ?? ""}
            className={style.inputTamanhoCamisa}
            aria-invalid={Boolean(errs.tamanho_camisa) || undefined}
            style={errs.tamanho_camisa ? { borderColor: "#b00" } : undefined}
            onChange={(e) => onChange({ ...v, tamanho_camisa: e.target.value as "PP" | "P" | "M" | "G" | "GG" })}
            required
          >
            <option value="">Selecione...</option>
            <option value="PP">PP</option>
            <option value="P">P</option>
            <option value="M">M</option>
            <option value="G">G</option>
            <option value="GG">GG</option>
            <option value="XG">XG</option>
          </select>
          {errs.tamanho_camisa && (
            <small style={{ color: "#b00" }}>{errs.tamanho_camisa}</small>
          )}

        </label> */}

      </form>
    </div>
  );
}
