"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function HeroSection() {
  const { lang, setLang } = useLanguage();

  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center pt-16 lg:pt-24 pb-20 px-margin-mobile lg:px-margin-desktop overflow-hidden bg-surface-container-lowest">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] rounded-full bg-secondary/5 blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-max-width mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center relative z-10">
        {/* Text Content Column */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-6 lg:gap-8 opacity-0 translate-y-8 animate-[fadeUp_0.8s_ease-out_forwards]">
          
          {/* Top Row: Grade Tag & Segmented Language Switch */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-surface-container/70 text-xs font-medium text-primary tracking-wide border border-primary/10">
              {lang === "si" ? "1 සිට 11 ශ්‍රේණිය දක්වා" : "Grades 1 to 11"}
            </span>

            {/* Segmented Switch: සිංහල | English */}
            <div className="inline-flex items-center p-1 bg-surface-variant/70 border border-outline-variant/30 rounded-xl shadow-inner backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setLang("si")}
                className={`px-3.5 py-1 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer ${
                  lang === "si"
                    ? "bg-primary text-on-primary shadow-sm font-semibold"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                සිංහල
              </button>
              <span className="w-px h-3.5 bg-outline-variant/40 mx-1"></span>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3.5 py-1 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer ${
                  lang === "en"
                    ? "bg-primary text-on-primary shadow-sm font-semibold"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Hero Headline (High Visual Priority) */}
          <h1 className="font-display-lg text-display-lg text-on-surface leading-tight">
            {lang === "si" ? (
              <>
                ඔබේ දරුවාගේ අධ්‍යාපනයට සම්පූර්ණ{" "}
                <span className="text-primary relative inline-block">
                  Online School
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-secondary/30"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 10"
                  >
                    <path
                      d="M0 5 Q 50 10 100 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></path>
                  </svg>
                </span>{" "}
                එකක්.
              </>
            ) : (
              <>
                A Complete{" "}
                <span className="text-primary relative inline-block">
                  Online School
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-secondary/30"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 10"
                  >
                    <path
                      d="M0 5 Q 50 10 100 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></path>
                  </svg>
                </span>{" "}
                for Your Child&apos;s Education.
              </>
            )}
          </h1>

          {/* Hero Subtitle / Description */}
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed text-balance">
            {lang === "si"
              ? "එකම මාසික ගාස්තුවකට සියලුම විෂයන්, Live Online Classes, Paper Classes සහ විභාග සූදානම් කිරීම."
              : "All subjects included for a single monthly fee with Live Online Classes, Paper Classes, and Exam Preparation."}
          </p>

          {/* Less Prominent Inline Badges (Discreet styling so Heading + CTA stand out) */}
          <div className="flex flex-wrap gap-2.5 mt-1">
            <div className="flex items-center gap-1.5 text-on-surface-variant/80 text-xs font-medium bg-surface-container-low/50 px-2.5 py-1 rounded-md border border-outline-variant/20">
              <span className="material-symbols-outlined text-tertiary text-sm">
                check_circle
              </span>
              {lang === "si" ? "1 - 11 ශ්‍රේණි" : "Grade 1–11"}
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant/80 text-xs font-medium bg-surface-container-low/50 px-2.5 py-1 rounded-md border border-outline-variant/20">
              <span className="material-symbols-outlined text-tertiary text-sm">
                check_circle
              </span>
              {lang === "si" ? "සිංහල සහ English මාධ්‍යයෙන්" : "Sinhala & English Medium"}
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant/80 text-xs font-medium bg-surface-container-low/50 px-2.5 py-1 rounded-md border border-outline-variant/20">
              <span className="material-symbols-outlined text-tertiary text-sm">
                check_circle
              </span>
              {lang === "si" ? "සජීවී Online පන්ති" : "Live Online Classes"}
            </div>
          </div>

          {/* High Priority CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <a
              href="#packages"
              className="bg-primary text-on-primary px-8 py-4 rounded-xl text-base font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{lang === "si" ? "ශ්‍රේණිය තෝරන්න" : "Select Grade"}</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </a>
            <a
              href="https://wa.me/94764401300"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface text-primary border-2 border-primary/20 px-8 py-4 rounded-xl text-base font-medium hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined">forum</span>
              <span>{lang === "si" ? "WhatsApp කරන්න" : "WhatsApp Us"}</span>
            </a>
          </div>
        </div>

        {/* Hero Visual Column */}
        <div className="col-span-1 lg:col-span-6 relative mt-12 lg:mt-0 opacity-0 translate-y-8 animate-[fadeUp_0.8s_ease-out_0.2s_forwards]">
          <div className="relative w-full aspect-square max-w-[500px] mx-auto">
            {/* Decorative Circle */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-surface-container to-surface-container-low border border-white/50 shadow-inner"></div>

            {/* Main Image Grid */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-4 p-8 transform rotate-3 hover:rotate-0 transition-transform duration-700 ease-out">
              <div className="row-span-2 rounded-2xl overflow-hidden shadow-xl border-4 border-white transform -translate-y-4">
                <img
                  alt="Student learning"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMM6DYU67DTVBUyirll-kMjIPRslVhpk-HfCCo8pZsbVksNC34Tiwqh_vni8WymhSMSmCCPBBfGkErjQdd4nE28P8BC4GZEVGLvXVKoJWiAXoJxyRmPtrzFonmfV8zJ-e2FiRTcNzlf8Yc17KdxKVSv8Csii3D0vEsr31RN68Y8s-vHGo6Jr36UKebkovFeH6F1dYubwrK36r7aRqOcGOhbVOfvXioR0-e5K6pxYcWgoJfLK4JzAQ"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white transform translate-x-4 translate-y-2">
                <img
                  alt="Teacher"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPeMCkR7Yqtk0QBJMDVk0Eh9r7dI9ZLw4pafL2LyPi1SRnYIBEaqHuH_0PZ6O1yayHz9zDRRVdrU5XHxmj1vA_XUQTx1b0Nc2uJOdKoTPJL73Sa9lGqyhjc77R5jz-sTC334wEI3bqq1UQlasOxeHcBp1cyMAMGaad9yzvIcozWz9W54bpnlux-vCYwaHkfD86pYLSOKTmo-_s4Lfg6G6P_Ygu2RJGMi-EsC1N3jG2Qb0Z3FFWkv4"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-md border-4 border-white bg-tertiary/10 p-4 flex flex-col justify-center items-center gap-2 transform translate-x-2 -translate-y-2 backdrop-blur-sm">
                <span className="material-symbols-outlined text-4xl text-tertiary">
                  workspace_premium
                </span>
                <span className="font-title-lg text-tertiary text-center leading-tight">
                  {lang === "si" ? (
                    <>
                      ඉහළම<br />ප්‍රතිඵල
                    </>
                  ) : (
                    <>
                      Excellent<br />Results
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
