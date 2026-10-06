"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function TrustStrip() {
  const { lang } = useLanguage();

  return (
    <section className="w-full bg-surface border-y border-outline-variant/30 py-6 px-margin-mobile lg:px-margin-desktop">
      <div className="max-w-max-width mx-auto flex flex-wrap justify-center lg:justify-between items-center gap-8">
        <div className="flex items-center gap-3 group">
          <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
            school
          </span>
          <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
            {lang === "si" ? "11 ශ්‍රේණි" : "Grades 1 - 11"}
          </span>
        </div>
        <div className="hidden lg:block w-px h-8 bg-outline-variant/30"></div>

        <div className="flex items-center gap-3 group">
          <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
            menu_book
          </span>
          <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
            {lang === "si" ? "20+ විෂයන්" : "20+ Subjects"}
          </span>
        </div>
        <div className="hidden lg:block w-px h-8 bg-outline-variant/30"></div>

        <div className="flex items-center gap-3 group">
          <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
            translate
          </span>
          <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
            Sinhala + English Medium
          </span>
        </div>
        <div className="hidden lg:block w-px h-8 bg-outline-variant/30"></div>

        <div className="flex items-center gap-3 group">
          <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
            payments
          </span>
          <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
            {lang === "si" ? "රු. 1,000 සිට මාසිකව" : "From Rs. 1,000 Monthly"}
          </span>
        </div>
      </div>
    </section>
  );
}
