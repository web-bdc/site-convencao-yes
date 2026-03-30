import style from "./styles.module.css";
export default function EdicaoAnteriorVideo() {
  return (
    <div className={style.containerVideo}>
      <div className={style.contentVideo}>
        <h2 className={style.title}>
          Confira o que <strong>te espera!</strong>
        </h2>
        <iframe
          className={style.video}
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/G9e_BFlaVGI?si=cFgkMnJ3feUesCH2"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; looping"
        ></iframe>
      </div>
    </div>
  );
}



