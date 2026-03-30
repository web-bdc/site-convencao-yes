"use client";
import { calcSubtotalCents } from "@/lib/pricing";
import style from "./SubTotal.module.css";

type Props = {
  dados: Record<string, unknown>;
  ignoreResponsible?: boolean;
};

export default function Subtotal({ dados, ignoreResponsible }: Props) {
  const cents = calcSubtotalCents({ ...dados, ignoreResponsible });
  const brl = (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return (
    <div className={style.subtotal}>
      <span className={style.label}>Subtotal</span>
      <strong className={style.value}>{brl}</strong>
    </div>
  );
}
