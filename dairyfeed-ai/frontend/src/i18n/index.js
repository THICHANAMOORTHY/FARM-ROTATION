import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './en.json'
import ta from './ta.json'

const STORAGE_KEY = 'dairyfeed.language'

// The chosen language is remembered in localStorage. Storage can be blocked (private mode),
// so every access is wrapped: the app still works, it just forgets the choice.
function savedLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'ta' ? 'ta' : 'en'
  } catch {
    return 'en'
  }
}

export function setLanguage(language) {
  i18n.changeLanguage(language)
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // not saved; fine
  }
}

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
})

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ta: { translation: ta } },
  lng: savedLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes
})

export default i18n
