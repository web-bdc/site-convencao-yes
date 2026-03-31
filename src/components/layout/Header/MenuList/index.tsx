"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./styles.module.css";

const menuItems = [
  { id: "home", href: "/", label: "Home" },
  { id: "inscricao", href: "/inscricao", label: "Inscrições" },
  { id: "programacao", href: "/programacao", label: "Programação" },
  { id: "palestrantes", href: "/palestrantes", label: "Palestrantes" },
  { id: "galeria", href: "/#galeria", label: "Galeria" },
  { id: "local", href: "/#local", label: "Local" },
  { id: "faq", href: "/#faq", label: "FAQ" },
  { id: "contato", href: "/#contato", label: "Contato" },
];

export default function MenuList() {
  const pathname = usePathname();

  const handleMenuClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    let targetId = "";

    if (href.startsWith("#")) {
      targetId = href;
    } else if (href.startsWith("/#") && pathname === "/") {
      targetId = href.substring(1);
    }

    if (!targetId) return;

    const target = document.querySelector(targetId) as HTMLElement | null;
    if (!target) return;

    e.preventDefault();
    const header = document.querySelector('header');
    const headerHeight = header?.offsetHeight ?? 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
    window.scrollTo({ top, behavior: "smooth" });

    // Fecha o menu simulando ESC
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  };

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.menuLinks}>
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
        </div>
        <Image className={styles.logo} src="/logos/logo-convecao-2026-2.svg" alt="Logo" width={80} height={40} priority />
      </nav >
    </>
  );
}
