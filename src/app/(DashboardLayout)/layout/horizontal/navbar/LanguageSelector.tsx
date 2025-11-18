"use client";
import React, { useContext, useEffect } from "react";
import { useTranslation } from 'react-i18next'
import { CustomizerContext } from "@/app/context/CustomizerContext";
import Image from "next/image";
import { Button, Dropdown, DropdownItem } from "flowbite-react";
import { Icon } from "@iconify/react";

const Languages = [
  {
    flagname: "عربي (Arabic)",
    icon: "/images/flag/icon-flag-sa.svg",
    value: "ar",
  },
  {
    flagname: "English (UK)",
    icon: "/images/flag/icon-flag-en.svg",
    value: "en",
  },
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { isLanguage, setIsLanguage, setActiveDir } = useContext(CustomizerContext);
  
  const currentLang = Languages.find((_lang) => _lang.value === isLanguage) || Languages[0];

  useEffect(() => {
    i18n.changeLanguage(isLanguage);
    // Change layout direction based on language
    const direction = isLanguage === "en" ? "ltr" : "rtl";
    setActiveDir(direction);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-direction', direction);
    }
  }, [isLanguage, setActiveDir]);

  return (
    <div className="flex items-center">
      <Dropdown
        label=""
        className="w-56 rounded-sm"
        dismissOnClick={false}
        renderTrigger={() => (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-lightprimary cursor-pointer">
            <Image
              src={currentLang.icon}
              height={20}
              width={20}
              alt="language"
              className="rounded-full h-5 w-5 object-cover"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentLang.value.toUpperCase()}
            </span>
            <Icon 
              icon="solar:alt-arrow-down-linear" 
              className="text-gray-500" 
              height={16} 
            />
          </div>
        )}
      >
        {Languages.map((item, index) => (
          <DropdownItem
            className="flex gap-3 items-center py-3 w-full"
            key={index}
            onClick={() => {
              setIsLanguage(item.value);
              // Change direction immediately when language is selected
              const direction = item.value === "en" ? "ltr" : "rtl";
              setActiveDir(direction);
              // Save to localStorage immediately
              if (typeof window !== 'undefined') {
                localStorage.setItem('app-language', item.value);
                localStorage.setItem('app-direction', direction);
              }
            }}
          >
            <Image
              src={item.icon}
              alt="flag"
              height={24}
              width={24}
              className="rounded-full object-cover h-6 w-6"
            />
            <span>{item.flagname}</span>
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
};
