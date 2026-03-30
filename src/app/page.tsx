import BannerHome from "@/components/BannerHome";
import Footer from "@/components/Footer/page";
import Header from "@/components/Header";
import Main from "@/components/Main";
import ScrollTop from "@/components/ScrollTop";

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
