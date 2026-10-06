import { Camera, X, UtensilsCrossed, QrCode, ClipboardList } from "lucide-react"
import { useLang } from "@/i18n/LanguageContext"
import LanguageSwitcher from "@/components/LanguageSwitcher"

export function LandingContent({ onScan, lastToken, error, navigate }) {
  const { t } = useLang()
  return (
    <>
      {}
      <div className="flex justify-end p-4">
        <LanguageSwitcher langs={["en", "km"]} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 text-center">
        <div className="border-2 border-[var(--color-primary)] rounded-2xl px-8 py-6 mb-8">
          <div className="font-display font-bold text-4xl text-[var(--color-primary)] leading-tight">ZOOM</div>
          <div className="text-sm text-[var(--color-text-secondary)] font-medium mt-1">Garden Cafe & Wine</div>
          <div className="text-xs text-[var(--color-muted)] mt-0.5">Sen Sok</div>
        </div>

        <h1 className="text-2xl font-display font-bold text-[var(--color-text)] mb-2">{t("guest.welcome")}</h1>
        <p className="text-sm text-[var(--color-muted)] max-w-xs mb-10">
          {t("guest.scanPrompt")}
        </p>

        <button
          onClick={onScan}
          className="w-20 h-20 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/30 transition-all"
        >
          <Camera size={32} />
        </button>
        <p className="text-xs text-[var(--color-muted)] mt-3">{t("guest.tapToScan")}</p>

        {lastToken && (
          <button
            onClick={() => navigate(`/order/status?t=${lastToken}`)}
            className="mt-6 flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)]/30 px-4 py-2.5 rounded-xl hover:bg-[var(--color-primary-muted)] transition-colors"
          >
            <ClipboardList size={15} /> {t("guest.trackMyOrder")}
          </button>
        )}

        {error && (
          <div className="mt-6 max-w-sm bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/25 text-[var(--color-danger)] text-sm px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}
      </div>

      <div className="text-center pb-6 flex flex-col items-center gap-2">
        <p className="text-xs text-[var(--color-muted)] flex items-center justify-center gap-1.5">
          <UtensilsCrossed size={12} /> Powered by Zoom Garden Café & Wine
        </p>
        <a href="/admin" className="text-[10px] text-[var(--color-muted)] underline underline-offset-2 hover:text-[var(--color-primary)]">
          {t("guest.staffLogin")}
        </a>
      </div>
    </>
  )
}

export function ScannerOverlay({ scanning, elementId, onClose }) {
  const { t } = useLang()
  if (!scanning) return null
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-white">
          <QrCode size={18} />
          <span className="text-sm font-medium">{t("guest.scanTitle")}</span>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div id={elementId} className="w-full max-w-sm rounded-2xl overflow-hidden" />
      </div>
      <div className="p-6 text-center text-white/70 text-xs">
        {t("guest.scanHint")}
      </div>
    </div>
  )
}
