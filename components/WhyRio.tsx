"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function WhyRio() {
  const { lang } = useLanguage();

  const features = {
    si: [
      {
        icon: "library_books",
        colorClass: "bg-primary/10 text-primary",
        title: "සියලුම විෂයන්",
        description: "එකම තැනකින් සියලුම විෂයන් ආවරණය කෙරේ.",
      },
      {
        icon: "video_camera_front",
        colorClass: "bg-secondary/10 text-secondary",
        title: "සජීවී Online පන්ති",
        description: "Zoom ඔස්සේ සජීවීව පන්ති පැවැත්වේ.",
      },
      {
        icon: "description",
        colorClass: "bg-tertiary/10 text-tertiary",
        title: "Paper Classes",
        description: "ප්‍රශ්න පත්‍ර සාකච්ඡා කිරීම මගින් පුහුණුව.",
      },
      {
        icon: "assignment_turned_in",
        colorClass: "bg-primary/10 text-primary",
        title: "විභාග සූදානම",
        description: "විභාග ඉලක්ක කරගත් විශේෂ වැඩසටහන්.",
      },
      {
        icon: "workspace_premium",
        colorClass: "bg-secondary/10 text-secondary",
        title: "පළපුරුදු ගුරු මණ්ඩලය",
        description: "පළපුරුදු සහ සුදුසුකම් ලත් ගුරු මණ්ඩලයක්.",
      },
      {
        icon: "savings",
        colorClass: "bg-tertiary/10 text-tertiary",
        title: "අඩු මාසික ගාස්තුව",
        description: "අවම මාසික ගාස්තුවකට උපරිම වටිනාකමක්.",
      },
    ],
    en: [
      {
        icon: "library_books",
        colorClass: "bg-primary/10 text-primary",
        title: "All Subjects",
        description: "Comprehensive coverage of all main curriculum subjects.",
      },
      {
        icon: "video_camera_front",
        colorClass: "bg-secondary/10 text-secondary",
        title: "Live Online Classes",
        description: "Interactive live streaming classes conducted via Zoom.",
      },
      {
        icon: "description",
        colorClass: "bg-tertiary/10 text-tertiary",
        title: "Paper Classes",
        description: "In-depth past paper and model paper discussions.",
      },
      {
        icon: "assignment_turned_in",
        colorClass: "bg-primary/10 text-primary",
        title: "Exam Preparation",
        description: "Focused revision sessions tailored for national exams.",
      },
      {
        icon: "workspace_premium",
        colorClass: "bg-secondary/10 text-secondary",
        title: "Qualified Teachers",
        description: "Experienced, qualified, and dedicated academic staff.",
      },
      {
        icon: "savings",
        colorClass: "bg-tertiary/10 text-tertiary",
        title: "Affordable Monthly Fee",
        description: "Maximum educational value at an affordable monthly fee.",
      },
    ],
  };

  const currentFeatures = features[lang];

  return (
    <section
      id="why-rio"
      className="w-full py-24 px-margin-mobile lg:px-margin-desktop bg-surface"
    >
      <div className="max-w-max-width mx-auto flex flex-col gap-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
            {lang === "si" ? "ඇයි Rio තෝරාගත යුත්තේ?" : "Why Choose Rio?"}
          </h2>
          <div className="w-16 h-1 bg-tertiary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentFeatures.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${item.colorClass}`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {item.icon}
                </span>
              </div>
              <h4 className="font-title-lg text-on-surface mb-2">
                {item.title}
              </h4>
              <p className="font-body-md text-on-surface-variant">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
