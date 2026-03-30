"use client";
import type { Participante } from "@/lib/schemas";
import { formatCPF, formatRg } from "@/lib/validators";
import { Trash2 } from "lucide-react";
import style from "./FormConvidados.module.css";

type Props = {
  value: Participante[];
  onChange: (next: Participante[]) => void;
  unidadeId?: number;
  errors?: Array<Partial<Record<keyof Participante, string>>>;
};

export default function FormConvidados({ value, onChange, unidadeId, errors }: Props) {
  const list = Array.isArray(value) ? value : [];
  const errs = Array.isArray(errors) ? errors : [];

  const add = () => {
    onChange([
      ...list,
      {
        nome_participante: "",
        cpf_participante: "",
        rg_participante: "",
        data_nascimento_participante: "",
        cargo_participante: "Participante",
        tamanho_camisa_participante: "M",
        unidade_id_participante: unidadeId,
      },
    ]);
  };

  const remove = (i: number) => {
    onChange(list.filter((_, idx) => idx !== i));
  };

  const set = (i: number, k: keyof Participante, v: unknown) => {
    const next = list.slice();
    // @ts-expect-error indexing safe here
    next[i][k] = v;
    onChange(next);
  };

  return (
    <div className={style.formGrid}>
      {list.map((c, i) => {
        const e = (errs[i] || {}) as Partial<Record<keyof Participante, string>>;
        return (
          <div key={i} className={style.formItem}>
            <div className={style.formHeader}>
              <strong className={style.formTitle}>Participante {i + 1}</strong>
              <button type="button" className={style.removeButton} onClick={() => remove(i)}><Trash2 /></button>
            </div>
            <div className={style.formBody}>
              <input
                className={style.input}
                placeholder="Nome completo"
                value={c.nome_participante}
                aria-invalid={Boolean(e.nome_participante) || undefined}
                style={e.nome_participante ? { borderColor: "#b00" } : undefined}
                onChange={(e) => set(i, "nome_participante", e.target.value)}
              />
              {e.nome_participante && (
                <small style={{ color: "#b00" }}>{e.nome_participante}</small>
              )}
              <input
                className={style.input}
                placeholder="CPF"
                value={c.cpf_participante || ""}
                aria-invalid={Boolean(e.cpf_participante) || undefined}
                style={e.cpf_participante ? { borderColor: "#b00" } : undefined}
                onChange={(e) => set(i, "cpf_participante", formatCPF(e.target.value))}
              />
              {e.cpf_participante && (
                <small style={{ color: "#b00" }}>{e.cpf_participante}</small>
              )}
              <input
                className={style.input}
                placeholder="RG"
                value={c.rg_participante || ""}
                aria-invalid={Boolean(e.rg_participante) || undefined}
                style={e.rg_participante ? { borderColor: "#b00" } : undefined}
                onChange={(e) => set(i, "rg_participante", formatRg(e.target.value))}
              />
              {e.rg_participante && (
                <small style={{ color: "#b00" }}>{e.rg_participante}</small>
              )}
              <input
                type="date"
                className={style.input}
                placeholder="Data de nascimento"
                value={c.data_nascimento_participante || ""}
                aria-invalid={Boolean(e.data_nascimento_participante) || undefined}
                style={e.data_nascimento_participante ? { borderColor: "#b00" } : undefined}
                onChange={(e) => set(i, "data_nascimento_participante", e.target.value)}
              />
              {e.data_nascimento_participante && (
                <small style={{ color: "#b00" }}>{e.data_nascimento_participante}</small>
              )}
              <input
                className={style.input}
                placeholder="Cargo / Parentesco"
                value={c.cargo_participante || "Participante"}
                aria-invalid={Boolean(e.cargo_participante) || undefined}
                style={e.cargo_participante ? { borderColor: "#b00" } : undefined}
                onChange={(e) => set(i, "cargo_participante", e.target.value)}
              />
              {e.cargo_participante && (
                <small style={{ color: "#b00" }}>{e.cargo_participante}</small>
              )}
              <select
                className={style.input}
                value={c.tamanho_camisa_participante || "M"}
                onChange={(e) => set(i, "tamanho_camisa_participante", e.target.value)}
              >
                <option value="PP">PP</option>
                <option value="P">P</option>
                <option value="M">M</option>
                <option value="G">G</option>
                <option value="GG">GG</option>
                <option value="XG">XG</option>
              </select>
              {e.tamanho_camisa_participante && (
                <small style={{ color: "#b00" }}>{e.tamanho_camisa_participante}</small>
              )}
            </div>
          </div>
        );
      })}
      <button type="button" className={style.addButton} onClick={add}>+ Adicionar Participante</button>
    </div>
  );
}
