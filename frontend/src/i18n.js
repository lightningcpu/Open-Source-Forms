import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en/translation.json";
import ruTranslation from "./locales/ru/translation.json";
import beTranslation from "./locales/be/translation.json";

const storedLanguage = localStorage.getItem("language")
  ? JSON.parse(localStorage.getItem("language"))
  : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    ru: { translation: ruTranslation },
    be: { translation: beTranslation },
  },
  lng: storedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
