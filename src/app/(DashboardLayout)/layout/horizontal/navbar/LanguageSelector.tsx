"use client";
import React, { useContext, useEffect } from "react";
import { useTranslation } from 'react-i18next'
import { CustomizerContext } from "@/app/context/CustomizerContext";
import Image from "next/image";
import { Button, Dropdown, DropdownItem } from "flowbite-react";
import { Icon } from "@iconify/react";

const Languages = [
  {
    flagname: "English (UK)",
    icon: "/images/flag/icon-flag-en.svg",
    value: "en",
  },
  {
    flagname: "中国人 (Chinese)",
    icon: "/images/flag/icon-flag-cn.svg",
    value: "ch",
  },
  {
    flagname: "français (French)",
    icon: "/images/flag/icon-flag-fr.svg",
    value: "fr",
  },
  {
    flagname: "عربي (Arabic)",
    icon: "/images/flag/icon-flag-sa.svg",
    value: "ar",
  },
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { isLanguage, setIsLanguage } = useContext(CustomizerContext);
  
  const currentLang = Languages.find((_lang) => _lang.value === isLanguage) || Languages[0];

  useEffect(() => {
    i18n.changeLanguage(isLanguage);
  }, [isLanguage]);

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
            onClick={() => setIsLanguage(item.value)}
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
