export const dynamic = "force-dynamic";

import Footer from "@/components/layout/Footer/page";
import Header from "@/components/layout/Header";
import InscricaoClient from "./InscricaoClient";
import style from "./page.module.css";

export default function InscricaoPage() {
  // Data limite: 01 de Janeiro de 2026
  const deadlineIso = "2026-01-01T00:00:00";
  const deadline = new Date(deadlineIso).getTime();
  const now = new Date().getTime();

  const isExpired = now >= deadline;

  if (isExpired) {
    return (
      <div className={style.container}>
        <Header />
        <main className={style.mainContainer}>
          <section className={style.sectionMain}>
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#333" }}>
              <h2 style={{ fontSize: "2.5rem", color: "#be123c", marginBottom: "1rem" }}>
                Inscrições Encerradas
              </h2>
              <p style={{ fontSize: "1.2rem" }}>
                A data limite para inscrições (01/01/2026) foi alcançada
              </p>
              <p style={{ marginTop: "1rem" }}>
                Entre em contato com o SAFY para mais informações
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return <InscricaoClient targetDate={deadlineIso} />;
}
