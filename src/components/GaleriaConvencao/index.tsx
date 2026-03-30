"use client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import style from "./styles.module.css";

const imagensData = [
  { id: 1, url: "/momentos/best-moments-0122.jpg" },
  { id: 2, url: "/momentos/best-moments-0375.jpg" },
  { id: 3, url: "/momentos/best-moments-0468.jpg" },
  { id: 4, url: "/momentos/best-moments-0843.jpg" },
  { id: 5, url: "/momentos/best-moments-1172.jpg" },
  { id: 6, url: "/momentos/best-moments-1514.jpg" },
  { id: 7, url: "/momentos/best-moments-6828.jpg" },
  { id: 8, url: "/momentos/best-moments-6840.jpg" },
  { id: 9, url: "/momentos/best-moments-7169.jpg" },
  { id: 10, url: "/momentos/best-moments-9179.jpg" },
  { id: 12, url: "/momentos/best-moments-6947.jpg" },
  { id: 13, url: "/momentos/best-moments-7399.jpg" },
  { id: 14, url: "/momentos/best-moments-7962.jpg" },
  { id: 15, url: "/momentos/best-moments-8112.jpg" },
  { id: 16, url: "/momentos/best-moments-8272.jpg" },
  { id: 17, url: "/momentos/best-moments-9065.jpg" },
];

export default function GaleriaConvencao() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  // Swipe refs - carrossel
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const isSwipingRef = useRef(false);
  const blockClickRef = useRef(false);

  // Swipe refs - modal
  const mStartXRef = useRef<number | null>(null);
  const mStartYRef = useRef<number | null>(null);
  const mIsSwipingRef = useRef(false);
  const SWIPE_THRESHOLD = 50; // px

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imagensData.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + imagensData.length) % imagensData.length);
  };

  const openModal = () => {
    if (blockClickRef.current) {
      // Evita abrir modal após um swipe
      blockClickRef.current = false;
      return;
    }
    setModalIndex(currentIndex);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const modalNext = () => setModalIndex((p) => (p + 1) % imagensData.length);
  const modalPrev = () => setModalIndex((p) => (p - 1 + imagensData.length) % imagensData.length);

  // Teclado e scroll do body para modal
  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") modalNext();
      if (e.key === "ArrowLeft") modalPrev();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isModalOpen]);

  // Handlers de swipe - carrossel
  const onTouchStartCarousel = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    startXRef.current = t.clientX;
    startYRef.current = t.clientY;
    isSwipingRef.current = false;
  };

  const onTouchMoveCarousel = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startXRef.current === null || startYRef.current === null) return;
    const t = e.touches[0];
    const dx = t.clientX - startXRef.current;
    const dy = t.clientY - startYRef.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      isSwipingRef.current = true;
      // opcional: e.preventDefault(); // pode bloquear scroll, use se necessário
    }
  };

  // Para melhor direção, também adicionamos um handler em touchend com changedTouches
  const onTouchEndCarouselWithEvent = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startXRef.current === null || startYRef.current === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startXRef.current;
    const dy = t.clientY - startYRef.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) {
        goToNext();
      } else {
        goToPrev();
      }
      blockClickRef.current = true;
    }
    startXRef.current = null;
    startYRef.current = null;
    isSwipingRef.current = false;
  };

  // Handlers de swipe - modal
  const onTouchStartModal = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    mStartXRef.current = t.clientX;
    mStartYRef.current = t.clientY;
    mIsSwipingRef.current = false;
  };

  const onTouchMoveModal = (e: React.TouchEvent<HTMLDivElement>) => {
    if (mStartXRef.current === null || mStartYRef.current === null) return;
    const t = e.touches[0];
    const dx = t.clientX - mStartXRef.current;
    const dy = t.clientY - mStartYRef.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      mIsSwipingRef.current = true;
    }
  };

  const onTouchEndModal = (e: React.TouchEvent<HTMLDivElement>) => {
    if (mStartXRef.current === null || mStartYRef.current === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - mStartXRef.current;
    const dy = t.clientY - mStartYRef.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) {
        modalNext();
      } else {
        modalPrev();
      }
    }
    mStartXRef.current = null;
    mStartYRef.current = null;
    mIsSwipingRef.current = false;
  };

  return (
    <div className={style.carousel}>
      <div className={style.carouselContent}>
        <h2 className={style.title}>
          Veja os <strong>melhores momentos</strong> das edições anteriores!
        </h2>

        <div className={style.carouselContainer}>
          {/* Imagem atual */}
          <div
            className={style.imageContainer}
            onClick={openModal}
            onTouchStart={onTouchStartCarousel}
            onTouchMove={onTouchMoveCarousel}
            onTouchEnd={onTouchEndCarouselWithEvent}
            role="button"
            tabIndex={0}
            aria-label="Ampliar imagem"
          >
            <Image
              src={imagensData[currentIndex].url}
              alt={`Convenção ${imagensData[currentIndex].id}`}
              width={1200}
              height={1200}
              className={style.image}
              priority
            />
          </div>

          {/* Botões de navegação */}
          <button className={`${style.navButton} ${style.prevButton}`} onClick={goToPrev} aria-label="Imagem anterior">
            <ChevronLeft />
          </button>

          <button className={`${style.navButton} ${style.nextButton}`} onClick={goToNext} aria-label="Próxima imagem">
            <ChevronRight />
          </button>
        </div>

        {isModalOpen && (
          <div className={style.modalOverlay} onClick={closeModal}>
            <div
              className={style.modalContent}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStartModal}
              onTouchMove={onTouchMoveModal}
              onTouchEnd={onTouchEndModal}
            >
              <button className={style.closeModal} onClick={closeModal} aria-label="Fechar">
                <X />
              </button>

              <Image
                src={imagensData[modalIndex].url}
                alt={`Convenção ${imagensData[modalIndex].id}`}
                width={1600}
                height={1000}
                className={style.modalImage}
                priority
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
