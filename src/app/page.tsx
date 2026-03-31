import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ScrollTop from "@/components/layout/ScrollTop";
import BannerHome from "@/components/sections/BannerHome";
import Main from "@/components/sections/Main";

export default function Home() {
  return (
    <div>
      <Header />
      <BannerHome />
      <Main />
      <ScrollTop />
      <Footer />
    </div>
  );
}
