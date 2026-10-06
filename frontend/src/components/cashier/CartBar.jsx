import { ShoppingCart } from "lucide-react"
import { useLang } from "@/i18n/LanguageContext"

export default function CartBar({ total, totalKHR, count, onPlaceOrder }) {
  const { t } = useLang()
  if (count <= 0) return null
  return (
    <div className="fixed bottom-10 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-2xl pointer-events-auto">
        <div className="bg-[var(--color-text)] text-white rounded-2xl shadow-2xl flex items-center justify-between px-5 py-3">
          <div>
            <div className="font-bold text-sm">{t("common.total")}: ${total.toFixed(2)} <span className="text-[var(--color-primary)] ml-1">៛{totalKHR.toLocaleString()}</span></div>
            <div className="text-[10px] text-[var(--color-muted)]">{count} {t("cashier.itemsSelected")}</div>
          </div>
          <button onClick={onPlaceOrder} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold text-sm px-5 py-2 rounded-xl transition-colors flex items-center gap-2">
            <ShoppingCart size={15} /> {t("cashier.placeOrder")}
          </button>
        </div>
      </div>
    </div>
  )
}
