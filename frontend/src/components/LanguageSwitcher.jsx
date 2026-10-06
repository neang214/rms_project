import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLang } from "@/i18n/LanguageContext"
import { LANGUAGES } from "@/i18n/translations"

export default function LanguageSwitcher({ langs = ["en", "km"], showIcon = true, className }) {
  const { lang, setLang } = useLang()
  return (
    <div className={cn("flex items-center gap-1 rounded-xl border border-[var(--color-border)] p-0.5", className)}>
      {showIcon && <Globe size={13} className="text-[var(--color-muted)] ml-1.5 mr-0.5 shrink-0" />}
      {langs.map(code => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={cn(
            "px-2 py-1 rounded-lg text-xs font-semibold transition-colors",
            lang === code
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-muted)]"
          )}
        >
          {LANGUAGES[code]?.short || code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
