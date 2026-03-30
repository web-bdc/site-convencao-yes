"use client";
import UseWindowWidth from "@/hook/useWindowWidth";
import HeaderDesktop from "./HeaderDesktop";
import HeaderMobile from "./HeaderMobile";

export default function Header() {
  const windowWidth = UseWindowWidth();
  return <>{windowWidth > 1024 ? <HeaderDesktop /> : <HeaderMobile />}</>;
}
