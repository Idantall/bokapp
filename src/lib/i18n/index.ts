import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './locales/en.json';
import he from './locales/he.json';

const resources = {
  en: { translation: en },
  he: { translation: he },
};

// Get device locale safely
const getDeviceLanguage = () => {
  try {
    const locales = getLocales();
    const locale = locales[0]?.languageCode;
    return locale === 'he' ? 'he' : 'en';
  } catch (error) {
    return 'en';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

