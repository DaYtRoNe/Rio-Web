"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import GradePackages from "@/components/GradePackages";
import WhyRio from "@/components/WhyRio";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <LanguageProvider>
      <Header />
      <main className="w-full pt-20">
        <div className="flex flex-col w-full font-body-md text-on-background relative overflow-hidden bg-surface">
          <HeroSection />
          <TrustStrip />
          <GradePackages />
          <WhyRio />
          <CTASection />
        </div>
      </main>
      <Footer />
    </LanguageProvider>
  );
}
