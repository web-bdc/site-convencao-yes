
import Contato from "../Contato";
import EdicaoAnteriorVideo from "../EdicaoAnteriorVideo";
import FAQ from "../Faq";
import GaleriaConvencao from "../GaleriaConvencao";
import Local from "../Local";
import styles from "./styles.module.css";

export default function Main() {
  return (
    <main className={styles.main}>
      <div className={styles.mainContent}>
        <h1>
          <strong className={styles.highlight}>12ª Convenção YES!</strong>
        </h1>

        <div id="galeria" className={styles.galeriaContainer}>
          <GaleriaConvencao />
        </div>
        <div className={styles.videoContainer}>
          <EdicaoAnteriorVideo />
        </div>
        <div id="local" className={styles.localContainer}>
          <Local />
        </div>
        <div id="faq" className={styles.faqContainer}>
          <FAQ />
        </div>
        <div id="contato" className={styles.contatoContainer}>
          <Contato />
        </div>
      </div>
    </main>
  );
}
