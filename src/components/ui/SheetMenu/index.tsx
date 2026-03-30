"use client";

import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";

interface SheetProps {
  trigger: React.ReactNode;

  children: React.ReactNode;
}

export default function SheetMenu({ trigger, children }: SheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const openSheet = () => {
    setIsVisible(true);
    setTimeout(() => setIsOpen(true), 10); // Garante que a animação de abertura será aplicada
  };

  const closeSheet = () => {
    setIsOpen(false);
  };

  // Controla a visibilidade para permitir animação de fechamento
  useEffect(() => {
    if (!isOpen && isVisible) {
      // Aguarda a duração da animação CSS antes de esconder
      const timeout = setTimeout(() => setIsVisible(false), 300); // ajuste para o tempo da animação
      return () => clearTimeout(timeout);
    }
  }, [isOpen, isVisible]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSheet();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    if (!isOpen) {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <div onClick={openSheet}>{trigger}</div>

      {isVisible && (
        <>
          <div className={`${styles.overlay} ${isOpen ? styles.open : styles.close}`} onClick={closeSheet} />
          <div className={`${styles.sheet} ${isOpen ? styles.open : styles.close}`}>
            <div>
              <button className={styles.closeButton} onClick={closeSheet} aria-label="Fechar menu">
                <X size={30} className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.content}>{children}</div>
          </div>
        </>
      )}
    </>
  );
}
