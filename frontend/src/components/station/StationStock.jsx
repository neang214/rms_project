import { useState, useEffect } from "react"
import { Package, Minus, Plus, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStockStore } from "../../context/stockContext"
import { usePageTitle } from "../../hooks/usePageTitle"
import { PageHeader, EmptyState } from "@/components/shared"
import { useLang } from "@/i18n/LanguageContext"
import { stockImageUrl, StockTypeBadge } from "@/components/admin/StockParts"

export default function StationStock() {
  const { t } = useLang()
  usePageTitle("Stock")
  const { stockItems, fetchStock, decreaseStock } = useStockStore()
  const [expandedId, setExpandedId] = useState(null)
  const [qty, setQty] = useState({})
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState({})
  const [success, setSuccess] = useState({})

  useEffect(() => { fetchStock() }, [])

  const handleDecrease = async (item) => {
    const amount = parseFloat(qty[item.stock_id]) || 0
    if (amount <= 0) {
      setError(prev => ({ ...prev, [item.stock_id]: t("station.enterValidQty") }))
      return
    }
    if (amount > Number(item.quantity)) {
      setError(prev => ({ ...prev, [item.stock_id]: t("station.notEnoughStock") }))
      return
    }
    setBusy(item.stock_id)
    setError(prev => ({ ...prev, [item.stock_id]: null }))
    try {
      await decreaseStock(item.stock_id, amount)
      setQty(prev => ({ ...prev, [item.stock_id]: "" }))
      setSuccess(prev => ({ ...prev, [item.stock_id]: true }))
      setTimeout(() => setSuccess(prev => ({ ...prev, [item.stock_id]: false })), 2000)
      setExpandedId(null)
    } catch (err) {
      setError(prev => ({ ...prev, [item.stock_id]: err?.response?.data?.message || t("common.failed") }))
    } finally {
      setBusy(null)
    }
  }

  const isLow = (item) => item.min_level && Number(item.quantity) <= Number(item.min_level)

  return (
    <div className="space-y-4">
      <PageHeader icon={Package} title={t("nav.stock")}
        subtitle={t("station.stockSubtitle")} />

      {stockItems.length === 0 ? (
        <EmptyState icon={Package} text={t("station.noStock")} />
      ) : (
        <div className="space-y-2">
          {stockItems.map(item => (
            <div key={item.stock_id}
              className={cn("bg-[var(--color-surface)] border rounded-2xl overflow-hidden transition-all",
                isLow(item) ? "border-[var(--color-warning)]/35" : "border-[var(--color-border)]"
              )}>
              <button
                onClick={() => setExpandedId(expandedId === item.stock_id ? null : item.stock_id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-primary-muted)] transition-colors text-left"
              >
                {stockImageUrl(item) ? (
                  <img src={stockImageUrl(item)} alt={item.item_name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className={cn("w-24 h-24 rounded-xl flex items-center justify-center shrink-0",
                    isLow(item) ? "bg-[var(--color-accent-muted)]" : "bg-[var(--color-primary-muted)]")}>
                    <Package size={40} className={isLow(item) ? "text-[var(--color-warning)]" : "text-[var(--color-primary)]"} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--color-text)]">{item.item_name}</span>
                    <StockTypeBadge type={item.stock_type} />
                    {isLow(item) && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--color-warning)] bg-[var(--color-accent-muted)] px-2 py-0.5 rounded-full">
                        <AlertTriangle size={9} /> Low
                      </span>
                    )}
                    {success[item.stock_id] && (
                      <span className="text-[10px] font-medium text-[var(--color-primary)] bg-[var(--color-primary-muted)] px-2 py-0.5 rounded-full">
                        Updated ✓
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--color-muted)] mt-0.5">
                    {Number(item.quantity).toFixed(2)} {item.unit?.unit_name}
                    {item.min_level && ` · min ${Number(item.min_level).toFixed(2)}`}
                  </div>
                </div>
                {expandedId === item.stock_id
                  ? <ChevronUp size={14} className="text-[var(--color-muted)] shrink-0" />
                  : <ChevronDown size={14} className="text-[var(--color-muted)] shrink-0" />
                }
              </button>

              {expandedId === item.stock_id && (
                <div className="border-t border-[var(--color-border)] px-4 py-3 space-y-2">
                  <p className="text-xs text-[var(--color-muted)]">
                    How many {item.unit?.unit_name} are you taking from the warehouse?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQty(prev => ({ ...prev, [item.stock_id]: Math.max(0, (parseFloat(prev[item.stock_id]) || 0) - 1) }))}
                      className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-primary-muted)]"
                    >
                      <Minus size={13} />
                    </button>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={qty[item.stock_id] || ""}
                      onChange={e => setQty(prev => ({ ...prev, [item.stock_id]: e.target.value }))}
                      placeholder="0"
                      className="flex-1 text-center text-sm font-medium bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 outline-none focus:border-[var(--color-primary)]"
                    />
                    <button
                      onClick={() => setQty(prev => ({ ...prev, [item.stock_id]: (parseFloat(prev[item.stock_id]) || 0) + 1 }))}
                      className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-primary-muted)]"
                    >
                      <Plus size={13} />
                    </button>
                    <span className="text-xs text-[var(--color-muted)]">{item.unit?.unit_name}</span>
                  </div>
                  {error[item.stock_id] && (
                    <p className="text-xs text-[var(--color-danger)]">{error[item.stock_id]}</p>
                  )}
                  <button
                    onClick={() => handleDecrease(item)}
                    disabled={busy === item.stock_id}
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 text-white text-sm font-medium py-2 rounded-xl transition-colors"
                  >
                    {busy === item.stock_id ? t("common.updating") : t("station.confirmTake")}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
