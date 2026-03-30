import Image from "next/image";
import Link from "next/link";
import style from "./style.module.css";

const imagensData = [
  { id: 1, url: "/banner/Banner-01.png" },
  { id: 2, url: "/banner/Banner-02.png" },
  { id: 3, url: "/banner/Banner-03.png" },
  { id: 4, url: "/banner/Banner-04.png" },

];

export default function BannerHome() {
  const intervalSeconds = 5; // tempo de exibição por slide
  const durationSeconds = imagensData.length * intervalSeconds;
  return (
    <div id="home" className={style.bannerContainer}>
      {/* Carrossel de background */}
      <div className={style.carouselWrapper}>
        {imagensData.map((img, idx) => (
          <div
            key={img.id}
            className={style.slide}
            style={{
              backgroundImage: `url(${img.url})`,
              animationDuration: `${durationSeconds}s`,
              animationDelay: `${idx * intervalSeconds}s`,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className={style.bannerContent}>
        <Image className={style.logo} src="/logos/logo-convecao-2026-1.svg" alt="YES Convenção 2026" width={600} height={300} />
        <h2 className={style.bannerSubtitle}>19, 20, 21 e 22 de Outubro de 2026</h2>
        <Link className={style.bannerButton} href="/inscricao">
          INSCREVA-SE
        </Link>
      </div>
    </div>
  );
}
