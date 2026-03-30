import styles from "./styles.module.css";

const cardsData = [
  { title: "+500", description: "Parceiros" },
  { title: "+120", description: "Escolas Presente" },
  { title: "+3800", description: "Espectadores" },
  { title: "+3000", description: "Interações" },
  { title: "5", description: "Palestrantes" },
  { title: "4", description: "Dias de Evento" },
];

export default function CardsConvencao() {
  return (
    <div className={styles.cardsContainer}>
      <ul>
        {cardsData.map((card, index) => (
          <li key={index} className={styles.card}>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardDescription}>{card.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
