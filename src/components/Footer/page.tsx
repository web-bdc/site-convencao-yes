import Image from "next/image";
import styles from "./styles.module.css";
export default function Footer() {
  const dataAno = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Image src="/logos/logo-branca.png" alt="Logo YES Convenção" width={90} height={50} />
        <span className={styles.copy}>© {dataAno} - Grupo BDC | Todos os direitos reservados</span>
      </div>
    </footer>
  );
}
