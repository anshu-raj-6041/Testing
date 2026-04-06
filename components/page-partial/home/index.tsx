import Navbar from "@/components/layout/Navbar";
import Hero from "./Hero";
import Feature from "./Feature";
import Pricing from "./Pricing";
import CallToAction from "./CallToAction";
import Footer from "@/components/layout/Footer";
import SpaceBackground from "@/components/common/SpaceBackground";

export default function HomePagePartial() {
  return (
    <div className="min-h-screen bg-[#0a0a14] relative">
      <SpaceBackground />
      <Navbar />
      <Hero />
      <Feature />
      <Pricing />
      <CallToAction />
      <Footer />
    </div>
  );
}
