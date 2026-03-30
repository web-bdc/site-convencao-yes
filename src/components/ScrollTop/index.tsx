"use client";
import { ChevronUp } from "lucide-react";
import { useEffect } from "react";
import styles from "./styles.module.css";

export default function ScrollTop() {
  useEffect(() => {
    const handleScroll = () => {
      const scrollTopButton = document.getElementById("scroll-top") as HTMLElement;
      if (scrollTopButton) {
        if (window.scrollY > 90) {
          scrollTopButton.style.opacity = "1";
          scrollTopButton.style.visibility = "visible";
        } else {
          scrollTopButton.style.opacity = "0";
          scrollTopButton.style.visibility = "hidden";
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div id="scroll-top" className={styles.scrollTop}>
      <button className={styles.scrollButton} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <ChevronUp className={styles.scrollIcon} />
      </button>
    </div>
  );
}
