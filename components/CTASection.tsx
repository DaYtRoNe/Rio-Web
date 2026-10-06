"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function CTASection() {
  const { lang } = useLanguage();

  return (
    <section
      id="cta"
      className="w-full py-24 px-margin-mobile lg:px-margin-desktop bg-tertiary relative overflow-hidden"
    >
      {/* Abstract Shapes */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg
          className="absolute top-0 right-0 w-full h-full object-cover"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path d="M0,100 L100,0 L100,100 Z" fill="currentColor"></path>
        </svg>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-8 relative z-10">
        <h2 className="font-headline-lg text-headline-lg text-on-tertiary leading-tight">
          {lang === "si"
            ? "ඔබේ දරුවා Rio සමඟ ඉගෙනීම ආරම්භ කිරීමට සූදානම්ද?"
            : "Ready for Your Child to Start Learning with Rio?"}
        </h2>
        <p className="font-body-lg text-on-tertiary/80 max-w-2xl">
          {lang === "si"
            ? "අදම ලියාපදිංචි වී සම්පූර්ණ අන්තර්ජාල පාසලක අත්දැකීම ලබාගන්න."
            : "Register today and experience a complete online school environment."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
          <button className="bg-surface text-tertiary px-8 py-4 rounded-xl font-label-md shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto cursor-pointer">
            {lang === "si" ? "දැන් ලියාපදිංචි වන්න" : "Register Now"}
          </button>
          <a
            href="https://wa.me/94764401300"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-transparent border border-on-tertiary/30 text-on-tertiary px-8 py-4 rounded-xl font-label-md hover:bg-on-tertiary/10 transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
          >
            <span className="material-symbols-outlined">forum</span>
            <span>{lang === "si" ? "WhatsApp කරන්න" : "WhatsApp Us"}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
