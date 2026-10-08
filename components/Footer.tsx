"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="w-full bg-surface-container-low pt-xl pb-lg border-t border-outline-variant/20">
      <div className="w-full px-margin-mobile lg:px-margin-desktop grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
        {/* Column 1: Brand */}
        <div className="flex flex-col gap-md">
          <div className="flex items-center gap-sm">
            <img
              alt="Rio Online School"
              className="h-10 w-auto"
              src="/logo-mark.png"
            />
            <span className="font-title-lg text-title-lg text-primary font-bold">
              Rio Online School
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {lang === "si"
              ? "අනාගත පරපුරට විශිෂ්ට අන්තර්ජාල අධ්‍යාපනයක්."
              : "Inspiring Lifelong Learners, Online."}
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="flex flex-col gap-md">
          <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">
            {lang === "si" ? "ඉක්මන් පිවිසුම්" : "Quick Links"}
          </h4>
          <nav className="flex flex-col gap-sm">
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              href="#"
            >
              {lang === "si" ? "මුල් පිටුව" : "Home"}
            </a>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              href="#why-rio"
            >
              {lang === "si" ? "අප ගැන" : "About"}
            </a>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              href="#packages"
            >
              {lang === "si" ? "පන්ති" : "Classes"}
            </a>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              href="#why-rio"
            >
              {lang === "si" ? "ගුරුවරුන්" : "Teachers"}
            </a>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              href="#packages"
            >
              {lang === "si" ? "කාලසටහන" : "Timetable"}
            </a>
          </nav>
        </div>

        {/* Column 3: Programs */}
        <div className="flex flex-col gap-md">
          <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">
            {lang === "si" ? "පාඨමාලා" : "Programs"}
          </h4>
          <nav className="flex flex-col gap-sm">
            <a
              href="#packages"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              Grade 1-5
            </a>
            <a
              href="#packages"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              Grade 6-11
            </a>
          </nav>
        </div>

        {/* Column 4: Contact & Social Icons */}
        <div className="flex flex-col gap-md">
          <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">
            {lang === "si" ? "සම්බන්ධ වීමට" : "Contact"}
          </h4>
          <div className="flex flex-col gap-sm">
            <a
              href="tel:0764401300"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
              076 440 1300
            </a>

            {/* Clickable Social Media Links */}
            <div className="flex items-center gap-md text-on-surface-variant mt-2">
              {/* WhatsApp Link */}
              <a
                href="https://wa.me/94764401300"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all"
                title="WhatsApp: 076 440 1300"
              >
                <span className="material-symbols-outlined text-xl">chat</span>
              </a>

              {/* Facebook Link */}
              <a
                href="https://www.facebook.com/RioOnlineSchool/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all"
                title="Facebook: RioOnlineSchool"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* YouTube Link */}
              <a
                href="https://www.youtube.com/@rio_onlineschool"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all"
                title="YouTube: @rio_onlineschool"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-margin-mobile lg:px-margin-desktop border-t border-outline-variant/30 pt-lg text-center font-label-sm text-label-sm text-on-surface-variant">
        © 2026 Rio Online School. All rights reserved.
      </div>
    </footer>
  );
}
