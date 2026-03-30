"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";

const menuItems = [
  { href: "/#home", label: "Home" },
  { href: "/inscricao", label: "Inscrição" },
  { href: "/programacao", label: "Programação" },
  { href: "/palestrantes", label: "Palestrantes" },
  { href: "/#galeria", label: "Galeria" },
  { href: "/#local", label: "Local" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contato", label: "Contato" },
];

export default function HeaderDesktop() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Inicializa o estado correto no cliente
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  const handleMenuClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    let targetId = "";

    if (href.startsWith("#")) {
      targetId = href;
    } else if (href.startsWith("/#") && pathname === "/") {
      targetId = href.substring(1);
    }

    if (!targetId) return; // navegação normal para rotas

    const target = document.querySelector(targetId) as HTMLElement | null;
    if (!target) return; // sem alvo, deixa padrão

    e.preventDefault();
    const headerHeight = headerRef.current?.offsetHeight ?? 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8; // pequeno espaçamento
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <header ref={headerRef} className={`${styles.headerDesktop} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link className={styles.logoLink} href="/#home" onClick={(e) => handleMenuClick(e, "/#home")}>
            <Image src="/logos/logo-horizontal-branca.svg" alt="Logo YES! Idiomas" width={120} height={120} />
          </Link>
        </div>
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.menuLink}
              onClick={(e) => handleMenuClick(e, item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
