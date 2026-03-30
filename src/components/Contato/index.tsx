import { Headset, Mail } from "lucide-react";
import styles from "./styles.module.css";
export default function Contato() {
  return (
    <div className={styles.contatoContainer}>
      <div className={styles.contatoContent}>
        <h2 className={styles.contatoTitle}>Ficou com Dúvidas?</h2>
        <p className={styles.contatoDescription}>
          Sinta-se à vontade para entrar em contato conosco através dos canais
        </p>
        <ul className={styles.contatoList}>
          <li className={styles.contatoListItem}>
            <a className={styles.contatoLink} href="mailto:safy@yes.com.br">
              <Mail className={styles.contatoIcon} size={50} />
            </a>
          </li>
          <li className={styles.contatoListItem}>
            <a className={styles.contatoLink} href="tel:+552124831000">
              <Headset className={styles.contatoIcon} size={50} />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
