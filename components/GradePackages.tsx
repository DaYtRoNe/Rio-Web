"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function GradePackages() {
  const { lang } = useLanguage();

  return (
    <section
      id="packages"
      className="w-full py-24 px-margin-mobile lg:px-margin-desktop bg-surface-container-low relative"
    >
      <div className="max-w-max-width mx-auto flex flex-col gap-12">
        <div className="text-center flex flex-col gap-4 max-w-2xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            {lang === "si"
              ? "ඔබේ ශ්‍රේණියට ගැළපෙන package එක තෝරන්න"
              : "Choose the Perfect Package for Your Grade"}
          </h2>
          <p className="font-body-md text-on-surface-variant">
            {lang === "si"
              ? "සියලුම විෂයන් සඳහා එකම මාසික ගාස්තුවක්. සඟවා ඇති ගාස්තු නොමැත."
              : "Single monthly fee for all subjects. No hidden charges."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
          {/* Package 1: Grade 1-5 (Enhanced Visual Prominence) */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-lg border border-outline-variant/30 flex flex-col gap-6 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>

            <div className="flex justify-between items-start border-b border-outline-variant/20 pb-6">
              <div>
                <h3 className="font-headline-md text-on-surface">Grade 1-5</h3>
                <span className="font-label-sm text-secondary font-medium tracking-wide mt-1 block">
                  {lang === "si" ? "සිංහල මාධ්‍යය" : "Sinhala Medium"}
                </span>
              </div>
              <div className="text-right">
                <div className="font-display-lg text-primary leading-none">
                  Rs. 1,000
                </div>
                <span className="font-label-sm text-on-surface-variant">
                  {lang === "si" ? "/ මාසිකව" : "/ month"}
                </span>
              </div>
            </div>

            <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/20 mb-2">
              <p className="font-title-lg text-secondary text-center font-semibold">
                {lang === "si"
                  ? "සියලුම විෂයන් ඇතුළත් වේ!"
                  : "All Subjects Included!"}
              </p>
            </div>

            <ul className="flex flex-col gap-4 flex-grow">
              <li className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-secondary text-xl mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="font-body-md text-on-surface">
                  {lang === "si"
                    ? "සියලුම ප්‍රධාන විෂයන්"
                    : "All Main Subjects"}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-secondary text-xl mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="font-body-md text-on-surface">
                  Spoken English
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-secondary text-xl mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="font-body-md text-on-surface">
                  {lang === "si"
                    ? "ශිෂ්‍යත්ව පෙරහුරු ප්‍රශ්න පත්‍ර"
                    : "Scholarship Practice Papers"}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-secondary text-xl mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="font-body-md text-on-surface">
                  Live Zoom Classes
                </span>
              </li>
            </ul>

            <a
              href="#cta"
              className="w-full bg-secondary text-on-secondary font-label-md py-4 rounded-xl mt-4 text-center font-medium shadow-sm hover:shadow-md hover:bg-on-secondary-fixed-variant transition-all cursor-pointer block"
            >
              {lang === "si" ? "ලියාපදිංචි වන්න" : "Get Started"}
            </a>
          </div>

          {/* Package 2: Grade 6-11 (Popular ribbon removed as requested) */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-xl border-2 border-primary relative flex flex-col gap-6 hover:-translate-y-1 transition-all group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>

            <div className="flex justify-between items-start border-b border-outline-variant/20 pb-6">
              <div>
                <h3 className="font-headline-md text-on-surface">Grade 6-11</h3>
                <span className="font-label-sm text-secondary font-medium tracking-wide mt-1 block">
                  {lang === "si" ? "සිංහල සහ English මාධ්‍යයෙන්" : "Sinhala + English Medium"}
                </span>
              </div>
              <div className="text-right pr-2">
                <div className="font-display-lg text-primary leading-none">
                  Rs. 1,500
                </div>
                <span className="font-label-sm text-on-surface-variant">
                  {lang === "si" ? "/ මාසිකව" : "/ month"}
                </span>
              </div>
            </div>

            <div className="bg-primary rounded-xl p-4 mb-2 shadow-inner">
              <p className="font-title-lg text-on-primary text-center font-semibold">
                {lang === "si"
                  ? "සියලුම විෂයන් ඇතුළත් වේ!"
                  : "All Subjects Included!"}
              </p>
            </div>

            <ul className="flex flex-col gap-4 flex-grow">
              <li className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-primary text-xl mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="font-body-md text-on-surface">
                  {lang === "si"
                    ? "සියලුම ප්‍රධාන විෂයන්"
                    : "All Main Subjects"}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-primary text-xl mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="font-body-md text-on-surface">
                  Sinhala & English Medium
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-primary text-xl mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="font-body-md text-on-surface">
                  {lang === "si"
                    ? "Paper Classes (ප්‍රශ්න පත්‍ර පන්ති)"
                    : "Paper Classes & Discussion"}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-primary text-xl mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="font-body-md text-on-surface">
                  Exam Prep & Revision
                </span>
              </li>
            </ul>

            <a
              href="#cta"
              className="w-full bg-primary text-on-primary font-label-md py-4 rounded-xl mt-4 shadow-md hover:shadow-lg text-center font-medium transition-all cursor-pointer block"
            >
              {lang === "si" ? "ලියාපදිංචි වන්න" : "Get Started"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
