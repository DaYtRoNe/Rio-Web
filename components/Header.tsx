"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang } = useLanguage();

  const navItems = {
    si: [
      { name: "මුල් පිටුව", href: "#" },
      { name: "පන්ති", href: "#packages" },
      { name: "ගුරුවරුන්", href: "#why-rio" },
      { name: "කාලසටහන", href: "#packages" },
      { name: "අප ගැන", href: "#why-rio" },
      { name: "සම්බන්ධ වන්න", href: "#cta" },
    ],
    en: [
      { name: "Home", href: "#" },
      { name: "Classes", href: "#packages" },
      { name: "Teachers", href: "#why-rio" },
      { name: "Timetable", href: "#packages" },
      { name: "About", href: "#why-rio" },
      { name: "Contact", href: "#cta" },
    ],
  };

  const currentNav = navItems[lang];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 w-full px-margin-mobile lg:px-margin-desktop flex items-center justify-between">
        {/* Brand Logo & Name */}
        <a href="#" className="flex items-center gap-md group">
          <img
            alt="Rio Online School Logo"
            className="h-14 lg:h-16 w-auto object-contain transition-transform group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida/AP1WRLsKnGqOQDBrNxe3rGhXTZ9dxqkKey3EIsQIp-1bbmP3n1-dTbZn7ytc9MQupQzPdIPpoiKr_jbESSFnDzP-ygAf97eAnhPV98ETwJ8RZTHYWCnDx7rb5OkXkxrfDO5UrMTD4LAnpvgTSFAVhVH1bVRsyaxC5EGWhfU-qFEiddQBXFRSaE1Jv9hOMFOcjaC9Ff0bs3WQD_vTzpmAWB4YJFOBqb8VUqx5PSUCnMFH3ewCXJUMcr7DRhr7VTA6EO-g6OxbT43ohec"
          />
          <span className="font-title-lg text-title-lg lg:text-2xl font-bold text-primary tracking-tight">
            Rio Online School
          </span>
        </a>

        {/* Desktop Navigation - Increased font size to text-base (16px) */}
        <nav className="hidden lg:flex items-center gap-xl">
          {currentNav.map((item, idx) => (
            <a
              key={idx}
              className={`text-base font-medium transition-colors ${
                idx === 0
                  ? "text-primary font-semibold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
              href={item.href}
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Right CTA Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-md">
          <a
            href="#cta"
            className="hidden lg:inline-flex bg-tertiary text-on-tertiary px-lg py-2.5 rounded-xl text-base font-medium hover:bg-on-tertiary-fixed-variant transition-all shadow-sm cursor-pointer"
          >
            {lang === "si" ? "ලියාපදිංචි වන්න" : "Register Now"}
          </a>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-on-surface-variant p-2 rounded-lg hover:bg-surface-variant/50 transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-t border-outline-variant/20 px-margin-mobile py-4 flex flex-col gap-3 shadow-lg animate-[fadeUp_0.3s_ease-out_forwards]">
          {currentNav.map((item, idx) => (
            <a
              key={idx}
              className={`text-base font-medium py-2 border-b border-outline-variant/10 ${
                idx === 0
                  ? "text-primary font-semibold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <a
            href="#cta"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full bg-tertiary text-on-tertiary py-3 rounded-xl text-base font-medium text-center mt-2 shadow-sm"
          >
            {lang === "si" ? "ලියාපදිංචි වන්න" : "Register Now"}
          </a>
        </div>
      )}
    </header>
  );
}
