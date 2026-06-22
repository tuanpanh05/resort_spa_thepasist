import React from "react";
import { Leaf } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function OurPhilosophy() {
  const { t } = useLanguage();

  return (
    <section
      id="philosophy"
      className="py-24 bg-[#fafbfa] text-sage-950 font-sans border-b border-sage-200/50"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-primary-600 block">
            {t("philosophy.tagline")}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-tight">
            {t("philosophy.title")}
          </h2>
          <div className="flex items-center justify-center space-x-3 mt-6">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-primary-300" />
            <Leaf className="h-3.5 w-3.5 text-primary-600/80" />
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-primary-300" />
          </div>
          <p className="text-sm sm:text-base text-sage-600 font-light leading-relaxed pt-2">
            {t("philosophy.desc")}
          </p>
        </div>

        {/* Philosophy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-8 lg:gap-16">
          {/* Than */}
          <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="w-12 h-12 bg-primary-100 flex items-center justify-center font-serif text-xl text-primary-800 rounded-none border border-primary-200">
              {t("philosophy.than")}
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-sage-900">
              {t("philosophy.thanTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-sage-650 font-light leading-relaxed">
              {t("philosophy.thanDesc")}
            </p>
            <ul className="text-left text-[11px] text-sage-500 font-medium space-y-2 pt-2 self-start md:self-auto">
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>{t("philosophy.thanList.0")}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>{t("philosophy.thanList.1")}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>{t("philosophy.thanList.2")}</span>
              </li>
            </ul>
          </div>

          {/* Tam */}
          <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="w-12 h-12 bg-primary-100 flex items-center justify-center font-serif text-xl text-primary-800 rounded-none border border-primary-200">
              {t("philosophy.tam")}
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-sage-900">
              {t("philosophy.tamTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-sage-650 font-light leading-relaxed">
              {t("philosophy.tamDesc")}
            </p>
            <ul className="text-left text-[11px] text-sage-500 font-medium space-y-2 pt-2 self-start md:self-auto">
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>{t("philosophy.tamList.0")}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>{t("philosophy.tamList.1")}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>{t("philosophy.tamList.2")}</span>
              </li>
            </ul>
          </div>

          {/* Tri */}
          <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="w-12 h-12 bg-primary-100 flex items-center justify-center font-serif text-xl text-primary-800 rounded-none border border-primary-200">
              {t("philosophy.tri")}
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-sage-900">
              {t("philosophy.triTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-sage-650 font-light leading-relaxed">
              {t("philosophy.triDesc")}
            </p>
            <ul className="text-left text-[11px] text-sage-500 font-medium space-y-2 pt-2 self-start md:self-auto">
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>{t("philosophy.triList.0")}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>{t("philosophy.triList.1")}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>{t("philosophy.triList.2")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
