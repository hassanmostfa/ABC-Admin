"use client"
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import config from './config'
import i18n from '@/utils/i18n';


// Define the shape of the context state
interface CustomizerContextState {
  isMobileSidebar: number;
  setIsMobileSidebar: (id: boolean) => void;
  selectedIconId: number;
  setSelectedIconId: (id: number) => void;
  activeDir: string;
  setActiveDir: (dir: string) => void;
  isLanguage: string;
  setIsLanguage: (lang: string) => void;
  activeMode: string;
  setActiveMode: (mode: string) => void;
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
  activeLayout: string;
  setActiveLayout: (layout: string) => void;
  isCardShadow: boolean;
  setIsCardShadow: (shadow: boolean) => void;
  isLayout: string;
  setIsLayout: (layout: string) => void;
  isBorderRadius: number;
  setIsBorderRadius: (radius: number) => void;
  isCollapse: string;
  setIsCollapse: (collapse: string) => void;
}

// Create the context with an initial value
export const CustomizerContext = createContext<CustomizerContextState | any>(undefined);

// Define the type for the children prop
interface CustomizerContextProps {
  children: ReactNode;
}
// Create the provider component
export const CustomizerContextProvider: React.FC<CustomizerContextProps> = ({ children }) => {
  // Load language from localStorage or use config default
  const getStoredLanguage = (): string => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('app-language');
      if (stored) return stored;
    }
    return config.isLanguage;
  };

  // Load direction from localStorage or derive from language
  const getStoredDirection = (language: string): string => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('app-direction');
      if (stored) return stored;
    }
    return language === "ar" ? "rtl" : "ltr";
  };

  const initialLanguage = getStoredLanguage();
  const initialDirection = getStoredDirection(initialLanguage);

  const [isMobileSidebar, setIsMobileSidebar] = useState<boolean>(false);
  const [selectedIconId, setSelectedIconId] = useState<number>(1);
  const [activeDir, setActiveDir] = useState<string>(initialDirection);
  const [activeMode, setActiveMode] = useState<string>(config.activeMode);
  const [activeTheme, setActiveTheme] = useState<string>(config.activeTheme);
  const [activeLayout, setActiveLayout] = useState<string>(config.activeLayout);
  const [isCardShadow, setIsCardShadow] = useState<boolean>(config.isCardShadow);
  const [isLayout, setIsLayout] = useState<string>(config.isLayout);
  const [isBorderRadius, setIsBorderRadius] = useState<number>(config.isBorderRadius);
  const [isCollapse, setIsCollapse] = useState<string>(config.isCollapse);
  const [isLanguage, setIsLanguage] = useState<string>(initialLanguage);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-language', isLanguage);
      // Also save direction
      const direction = isLanguage === "ar" ? "rtl" : "ltr";
      localStorage.setItem('app-direction', direction);
    }
  }, [isLanguage]);

  // Set initial direction and sync i18n on mount
  useEffect(() => {
    const direction = isLanguage === "ar" ? "rtl" : "ltr";
    setActiveDir(direction);
    // Ensure i18n is synced with the stored language on mount
    if (i18n.language !== isLanguage) {
      i18n.changeLanguage(isLanguage);
    }
  }, []);

  // Set attributes immediately
  useEffect(() => {
    document.documentElement.setAttribute("class", activeMode);
    document.documentElement.setAttribute("dir", activeDir);
    document.documentElement.setAttribute('data-color-theme', activeTheme);
    document.documentElement.setAttribute("data-layout", activeLayout);
    document.documentElement.setAttribute("data-boxed-layout", isLayout);
    document.documentElement.setAttribute("data-sidebar-type", isCollapse);

  }, [activeMode, activeDir, activeTheme, activeLayout, isLayout, isCollapse]);

  return (
    <CustomizerContext.Provider
      value={{
        isMobileSidebar,
        setIsMobileSidebar,
        selectedIconId,
        setSelectedIconId,
        activeDir,
        setActiveDir,
        activeMode,
        setActiveMode,
        activeTheme,
        setActiveTheme,
        activeLayout,
        setActiveLayout,
        isCardShadow,
        setIsCardShadow,
        isLayout,
        setIsLayout,
        isBorderRadius,
        setIsBorderRadius,
        isCollapse,
        setIsCollapse,
        isLanguage,
        setIsLanguage
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
};


