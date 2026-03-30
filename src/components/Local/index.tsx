import styles from "./styles.module.css";

export default function Local() {
  return (
    <div className={styles.local}>
      <div className={styles.localContent}>
        <h2>
          Localização da <strong>Convenção</strong>!
        </h2>
        <div className={styles.mapContainer}>
          <div className={styles.mapContent}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d117914.23026213948!2d-41.973955!3d-22.548426!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x97b4a51c35c5d1%3A0x6c23bfa78861e915!2sVilarejo%20Praia%20Hotel!5e0!3m2!1spt-BR!2sus!4v1760618657556!5m2!1spt-BR!2sus"
              width="250"
              height="250"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className={styles.mapIframe}
            />
          </div>
          <div className={styles.addressInfo}>
            <h3>Endereço da Convenção</h3>
            <h4>
              <a className={styles.hotelLink} href="https://www.hotelvilarejopraia.com.br/" target="_blank">
                Vilarejo Praia Hotel
              </a>
            </h4>
            <p> RJ-106, 1700 - Cidade Beira Mar, Rio das Ostras - RJ</p>
            <p>CEP: 28890-257</p>
          </div>
        </div>
      </div>
    </div>
  );
}
