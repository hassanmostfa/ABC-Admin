"use client";

import Logo from "@/app/(DashboardLayout)/layout/shared/logo/FullLogo";
import CardBox from "@/app/components/shared/CardBox";
import React from "react";
import BoxedAuthLogin from "../../authforms/BoxedAuthForms";
import BoxedAuthSlider from "../../authforms/BoxedAuthSlider";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "app-language";

const BoxedLogin = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const dir = isAr ? "rtl" : "ltr";

  const setLanguage = (lang: "ar" | "en") => {
    i18n.changeLanguage(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  };

  return (
    <>
      <div
        className="relative min-h-screen flex flex-col justify-center bg-cover bg-center bg-[url('/images/backgrounds/login-bg.jpg')]"
        dir={dir}
      >
        {/* Language switcher */}
        <div className="absolute top-4 end-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage("ar")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isAr
                ? "bg-primary text-white"
                : "bg-white/90 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {t("auth.langAr")}
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !isAr
                ? "bg-primary text-white"
                : "bg-white/90 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {t("auth.langEn")}
          </button>
        </div>

        <div className="flex h-full justify-center items-center px-4">
          <CardBox className="xl:max-w-6xl lg:max-w-3xl md:max-w-xl w-full border-none p-0">
            <div className="grid grid-cols-12">
              <div className={`xl:col-span-6 col-span-12 px-8 ${isAr ? "xl:border-e" : "xl:border-s"} border-ld`}>
                <div className="md:py-14 py-8 lg:px-6">
                  <Logo />
                  <h3 className="md:text-34 text-2xl md:my-8 my-5 text-dark dark:text-white">
                    {t("auth.login.subtitle")}
                  </h3>
                  <BoxedAuthLogin />
                </div>
              </div>
              <div className="xl:col-span-6 col-span-12 xl:block hidden">
                <BoxedAuthSlider />
              </div>
            </div>
          </CardBox>
        </div>
      </div>
    </>
  );
};

export default BoxedLogin;
