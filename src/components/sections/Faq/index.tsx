"use client";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useState } from "react";
import styles from "./styles.module.css";

const faqData = [
  {
    id: 1,
    question: "Qual é o objetivo do evento?",
    answer:
      "O objetivo do evento é reunir a rede para compartilhar conhecimentos, novidades, experiências e inovações.",
  },
  {
    id: 2,
    question: "Onde será realizado o evento?",
    answer: "O evento será realizado no Vilarejo Praia Hotel, em Rio das Ostras - RJ.",
  },
  {
    id: 3,
    question: "Como posso me inscrever?",
    answer: "Você pode se inscrever através clicando em Inscrição no site oficial.",
  },
  {
    id: 4,
    question: "Qual é o público-alvo do evento?",
    answer: "O evento é voltado para os franqueados e colaboradores da rede Yes!",
  },
  {
    id: 5,
    question: "Haverá palestrantes convidados?",
    answer: "Sim, teremos diversos palestrantes renomados na área.",
  },
  {
    id: 6,
    question: "Qual a diferença entre o quarto individual e o quarto duplo?",
    answer: "No individual você ficará sozinho em uma acomodação. No quarto duplo, caso não leve um convidado, você irá dividir o quarto com outro franqueado.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.faqContainer}>
      <div className={styles.faqContent}>
        <h2 className={styles.faqTitle}>Perguntas Frequentes</h2>
        <div className={styles.faqList}>
          <ul className={styles.faqItems}>
            {faqData.slice(0).map((faq) => (
              <li key={faq.id} className={styles.faqItem}>
                <h3 className={styles.faqQuestion} onClick={() => toggleFAQ(faq.id)}>
                  {faq.question} {openIndex === faq.id ? <ChevronDown /> : <ChevronLeft />}
                </h3>
                <p className={`${styles.faqAnswer} ${openIndex === faq.id ? styles.open : ""}`}>{faq.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
