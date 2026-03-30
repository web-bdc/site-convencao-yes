import styles from "./styles.module.css";
export default function PageBuild() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <h1 className={styles.title}>Em Desenvolvimento</h1>
      <p className={styles.text}>Esta página está sendo desenvolvida.</p>
      <p className={styles.text}>Em breve, você terá acesso a todo o conteúdo!</p>
    </div>
  );
}
