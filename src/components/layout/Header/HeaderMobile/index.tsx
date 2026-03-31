"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import DropMenu from "../../../ui/DropMenu";
import styles from "./styles.module.css";

export default function HeaderMobile() {
  const pathname = usePathname();

  const handleMenuClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    let targetId = "";
    if (href.startsWith("#")) targetId = href;
    else if (href.startsWith("/#") && pathname === "/") targetId = href.substring(1);

    if (!targetId) return;
    const target = document.querySelector(targetId) as HTMLElement | null;
    if (!target) return;

    e.preventDefault();
    const header = document.querySelector('header');
    const headerHeight = header?.offsetHeight ?? 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">
            <Image src="/logos/logo-horizontal-branca.svg" alt="Logo" width={120} height={40} priority />
          </Link>
        </div>
        <div className={styles.menuContainer}>
          <DropMenu />
        </div>
      </div>
    </header>
  );
}
