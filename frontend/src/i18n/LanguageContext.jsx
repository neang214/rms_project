import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { translations } from "./translations"

const LanguageContext = createContext(null)
const STORAGE_KEY = "zoom_lang"

export function LanguageProvider({ children, defaultLang = "en" }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === "undefined") return defaultLang
    return localStorage.getItem(STORAGE_KEY) || defaultLang
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l) => {
    if (translations[l]) setLangState(l)
  }, [])

  
  
  const t = useCallback(
    (key) => translations[lang]?.[key] ?? translations.en[key] ?? key,
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>")
  return ctx
}
