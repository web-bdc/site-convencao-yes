"use client";
import { useRouter } from "next/navigation";

import Footer from "@/components/Footer/page";
import Header from "@/components/Header";
import style from "./page.module.css";

export default function InscricaoPage() {

  const router = useRouter();

  const handleInscricao = () => {
    router.push("/inscricao-extra");
  }

  return (
    <>
      <Header />
      <main className={style.main}>
        <section className={style.container}>
          <h1>Inscrição Convenção 2026</h1>
          <div className={style.divCards}>
            <ul className={style.list}>



              <li className={`${style.listItem} ${style.emBreve}`}>
                <div className={style.listItemContent}>
                  <h2>2026 Pré-venda</h2>
                  <p>R$ 2.199,00 p/pessoa</p>
                  <p>Até 31/10</p>
                  <button
                    disabled
                    className={style.buttonOver}
                  >
                    Esgotado
                  </button>
                </div>
              </li>

              <li className={`${style.listItem} ${style.emBreve}`}>
                <div className={style.listItemContent}>
                  <h2>1º Lote 2026</h2>
                  <p>R$ 2.899,00 p/pessoa</p>
                  <p>01/11 a 31/12</p>
                  <button className={style.buttonOver} disabled>
                    Esgotado
                  </button>
                </div>
              </li>

              <li className={`${style.listItem} ${style.emBreve}`}>
                <div className={style.listItemContent}>
                  <h2>2º Lote 2026</h2>
                  <p>R$ 3.700,00 p/pessoa</p>
                  <span className={style.span}>
                    A partir de 01/01/2026, envio automático de <br /> 10 boletos de R$ 370,00
                  </span>
                </div>
              </li>

              <li className={`${style.listItem}`}>
                <div className={style.listItemContent}>
                  <h2>Inscrição Extra</h2>
                  <p>Até 31/05</p>
                  <p>R$ 3.700,00 p/pessoa</p>
                  <button
                    className={style.button}
                    onClick={handleInscricao}
                  >
                    Incriação
                  </button>
                </div>
              </li>
            </ul>

            <span className={style.obs}>
              <ul>
                <li><strong style={{ color: "red" }}>Atenção:</strong> Menores de 12 anos não pagam valor de inscrição.</li>
                <li><strong style={{ color: "red" }}>Atenção:</strong>  Franqueados que não efetuaram a compra receberão o boleto automaticamente</li>
              </ul>
            </span>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
