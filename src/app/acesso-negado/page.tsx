import Image from "next/image";
import styles from "./page.module.css";

export default function AcessoNegadoPage() {
  return (
    <div className={styles.container}>
      <Image src="/logos/logo-convecao-2026-1.svg" alt="YES Convenção" width={200} height={100} className={styles.logo} />
      <div className={styles.content}>
        <h1 className={styles.title}>Acesso Inválido ou Negado</h1>
        <p className={styles.text1}>Este link expirou ou não pertence a uma escola válida.</p>
        <p className={styles.text2}>Por favor, retorne ao Portal da YES e clique no botão de convenção novamente.</p>
      </div>
    </div>
  );
}
