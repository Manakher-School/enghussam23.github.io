import React, { createContext, useState, useContext, useEffect } from "react";
import { I18nManager } from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState("ar");
  const [isRTL, setIsRTL] = useState(true);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage) {
        changeLanguage(savedLanguage);
      }
    } catch (error) {
      console.error("Error loading language preference:", error);
    }
  };

  const changeLanguage = async (lang) => {
    try {
      await i18n.changeLanguage(lang);
      await AsyncStorage.setItem("language", lang);
      setLanguage(lang);
      const rtl = lang === "ar";
      setIsRTL(rtl);

      // Note: For web, RTL is handled via CSS
      // For native, would need app restart for RTL change
      if (I18nManager.isRTL !== rtl) {
        I18nManager.forceRTL(rtl);
      }
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, isRTL, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
