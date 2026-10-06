import { Search, Plus, Minus, ShoppingCart, Check, ArrowLeft, AlertTriangle, ClipboardList, MapPin, LocateFixed, Loader2, Users } from "lucide-react"
import { cn, imageUrl, menuItemName } from "@/lib/utils"
import { useLang } from "@/i18n/LanguageContext"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { MenuCategoryBar } from "@/components/admin/MenuParts"
import { ItemNoteRow } from "@/components/shared"

const FALLBACK_IMG = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop"

export function InvalidTable({ navigate, message }) {
  const { t } = useLang()
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--color-background)] p-6 text-center">
      <AlertTriangle size={40} className="text-[var(--color-warning)] mb-4" />
      <h2 className="font-semibold text-[var(--color-text)] mb-2">{t("guest.somethingWrong")}</h2>
      <p className="text-sm text-[var(--color-muted)] max-w-xs mb-6">{message}</p>
      <button onClick={() => navigate("/")} className="flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm font-medium px-4 py-2.5 rounded-xl">
        <ArrowLeft size={15} /> {t("guest.backToScan")}
      </button>
    </div>
  )
}

export function LocationGate({ status, errorCode, onRetry, navigate }) {
  const { t } = useLang()

  if (status === "checking") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--color-background)] p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--color-primary-muted)] flex items-center justify-center mb-4">
          <LocateFixed size={26} className="text-[var(--color-primary)] animate-pulse" />
        </div>
        <h2 className="font-semibold text-[var(--color-text)] mb-2">{t("guest.locationChecking")}</h2>
        <p className="text-sm text-[var(--color-muted)] max-w-xs">{t("guest.locationCheckingSub")}</p>
        <Loader2 size={18} className="text-[var(--color-muted)] animate-spin mt-5" />
      </div>
    )
  }

  const reasonKey =
    errorCode === "DESKTOP" ? "guest.desktopBlocked" :
    errorCode === "DENIED" ? "guest.locationDenied" :
    errorCode === "UNSUPPORTED" ? "guest.locationUnsupported" :
    "guest.locationUnavailable"

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--color-background)] p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center mb-4">
        <MapPin size={26} className="text-[var(--color-warning)]" />
      </div>
      <h2 className="font-semibold text-[var(--color-text)] mb-2">{t("guest.locationRequired")}</h2>
      <p className="text-sm text-[var(--color-muted)] max-w-xs mb-6">{t(reasonKey)}</p>
      <div className="flex gap-2">
        <button onClick={onRetry} className="flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm font-medium px-4 py-2.5 rounded-xl">
          <LocateFixed size={15} /> {t("guest.locationRetry")}
        </button>
        <button onClick={() => navigate("/")} className="flex items-center gap-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium px-4 py-2.5 rounded-xl">
          <ArrowLeft size={15} /> {t("guest.backToScan")}
        </button>
      </div>
    </div>
  )
}

export function GuestHeader({ table, token, navigate }) {
  const { t } = useLang()
  return (
    <div className="sticky top-0 z-20 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="border border-[var(--color-primary)]/40 rounded-lg px-2 py-1">
          <span className="font-display font-bold text-sm text-[var(--color-primary)]">ZOOM</span>
        </div>
        <LanguageSwitcher langs={["en", "km"]} showIcon={false} />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/order/status?t=${token}`)}
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] border border-[var(--color-primary)]/30 px-2.5 py-1.5 rounded-lg hover:bg-[var(--color-primary-muted)] transition-colors"
        >
          <ClipboardList size={13} /> {t("guest.trackOrder")}
        </button>
        <div className="text-right">
          <div className="text-xs text-[var(--color-muted)]">{t("guest.yourTable")}</div>
          <div className="font-bold text-sm text-[var(--color-primary)]">{table?.table_number || "..."}</div>
        </div>
      </div>
    </div>
  )
}

export function OrderStatusBanner({ liveOrderStatus, token, navigate }) {
  const { t } = useLang()
  if (!liveOrderStatus) return null
  return (
    <button
      onClick={() => navigate(`/order/status?t=${token}`)}
      className={cn(
        "w-full px-4 py-2 text-xs font-medium text-center transition-opacity hover:opacity-90",
        liveOrderStatus === "Paid" ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]" :
        liveOrderStatus === "Served" ? "bg-[var(--color-primary)] text-white" :
        liveOrderStatus === "Preparing" ? "bg-[var(--color-accent-muted)] text-[var(--color-warning)]" :
        "bg-[var(--color-border)] text-[var(--color-text-secondary)]"
      )}
    >
      {liveOrderStatus === "Pending" && t("guest.bannerReceived")}
      {liveOrderStatus === "Preparing" && t("guest.bannerPreparing")}
      {liveOrderStatus === "Served" && t("guest.bannerServed")}
      {liveOrderStatus === "Paid" && t("guest.bannerPaid")}
    </button>
  )
}

export function GuestMenuControls({ search, setSearch, categories, activeCat, setActiveCat }) {
  const { t } = useLang()
  return (
    <>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("guest.searchMenu")}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
      </div>
      <MenuCategoryBar categories={categories} activeCat={activeCat} onSelect={setActiveCat} />
    </>
  )
}

export function GuestMenuGrid({ items, cart, onAdd, onRemove }) {
  const { t, lang } = useLang()
  if (items.length === 0) {
    return <div className="text-center py-16 text-[var(--color-muted)] text-sm">{t("guest.noItems")}</div>
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map(item => {
        const qty = cart[item.menu_item_id]?.qty || 0
        return (
          <div key={item.menu_item_id} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="relative h-28 overflow-hidden bg-[var(--color-border)]">
              <img src={imageUrl(item.image_url, FALLBACK_IMG)} alt={menuItemName(item, lang)} className="w-full h-full object-cover" />
            </div>
            <div className="p-2.5">
              <div className="font-medium text-[var(--color-text)] text-xs leading-snug line-clamp-2 mb-2">{menuItemName(item, lang)}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--color-text)]">$ {Number(item.price).toFixed(2)}</span>
                {qty === 0 ? (
                  <button onClick={() => onAdd(item.menu_item_id)} className="w-7 h-7 rounded-full bg-[var(--color-primary)]/10 active:bg-[var(--color-primary)] active:text-white text-[var(--color-primary)] flex items-center justify-center transition-all">
                    <Plus size={14} />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button onClick={() => onRemove(item.menu_item_id)} className="w-6 h-6 rounded-full bg-[var(--color-danger-muted)] text-[var(--color-danger)] flex items-center justify-center">
                      <Minus size={11} />
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-[var(--color-primary)]">{qty}</span>
                    <button onClick={() => onAdd(item.menu_item_id)} className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                      <Plus size={11} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function CartBar({ total, totalKHR, cartCount, onOrder }) {
  const { t } = useLang()
  if (cartCount <= 0) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-4">
      <div className="bg-[var(--color-text)] text-white rounded-2xl shadow-2xl flex items-center justify-between px-5 py-3 max-w-md mx-auto">
        <div>
          <div className="font-bold text-sm">{t("common.total")}: ${total.toFixed(2)} <span className="text-[var(--color-primary)] ml-1">៛{totalKHR.toLocaleString()}</span></div>
          <div className="text-[10px] text-[var(--color-muted)]">{cartCount} {t("guest.itemsSelected")}</div>
        </div>
        <button onClick={onOrder} className="bg-[var(--color-primary)] active:bg-[var(--color-primary-dark)] text-white font-semibold text-sm px-5 py-2 rounded-xl transition-colors flex items-center gap-2">
          <ShoppingCart size={15} /> {t("guest.order")}
        </button>
      </div>
    </div>
  )
}

export function ConfirmOrderDialog({ open, table, cartItems, onItemNoteChange, onIncrease, onDecrease, total, totalKHR, errorMsg, submitting, submitted, queueNumber, partySize, onPartySizeChange, note, onNoteChange, onCancel, onConfirm }) {
  const { t, lang } = useLang()
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-[var(--color-surface)] rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-sm border border-[var(--color-border)] max-h-[85vh] overflow-y-auto">
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-muted)] flex items-center justify-center"><ShoppingCart size={16} className="text-[var(--color-primary)]" /></div>
            <div className="font-semibold text-[var(--color-text)]">{t("guest.confirmTitle")}</div>
          </div>
          <div className="text-xs text-[var(--color-muted)]">{t("guest.table")} {table?.table_number}</div>

          {submitted && queueNumber != null && (
            <div className="bg-[var(--color-primary-muted)] rounded-2xl px-4 py-3 text-center">
              <div className="text-[11px] text-[var(--color-muted)] uppercase tracking-wide">{t("guest.waitingNumber")}</div>
              <div className="text-3xl font-bold text-[var(--color-primary)] mt-0.5">#{queueNumber}</div>
            </div>
          )}

          {!submitted && (
            <div className="flex gap-2">
              <div className="w-24 relative shrink-0">
                <Users size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                <input
                  type="number" min="1" inputMode="numeric"
                  value={partySize}
                  onChange={e => onPartySizeChange(e.target.value)}
                  placeholder={t("guest.guests")}
                  className="w-full h-9 pl-8 pr-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <input
                value={note}
                onChange={e => onNoteChange(e.target.value)}
                placeholder={t("guest.orderNotePlaceholder")}
                className="flex-1 h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          )}

          {!submitted && (
            <div className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wide pt-1">
              {t("guest.itemsLabel")}
            </div>
          )}
          <div className="space-y-3 max-h-52 overflow-y-auto">
            {cartItems.map(item => (
              <div key={item.menu_item_id} className="pb-2 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <img src={imageUrl(item.image_url, FALLBACK_IMG)} alt={menuItemName(item, lang)} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[var(--color-text)] truncate">{menuItemName(item, lang)}</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">${Number(item.price).toFixed(2)}</div>
                  </div>
                  {!submitted && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button type="button" onClick={() => onDecrease(item.menu_item_id)}
                        className="w-6 h-6 rounded-full bg-[var(--color-danger-muted)] text-[var(--color-danger)] flex items-center justify-center">
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center text-[var(--color-text)]">{item.qty}</span>
                      <button type="button" onClick={() => onIncrease(item.menu_item_id)}
                        className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                        <Plus size={11} />
                      </button>
                    </div>
                  )}
                  {submitted && <div className="text-xs text-[var(--color-muted)] shrink-0">x{item.qty}</div>}
                </div>
                {!submitted && (
                  <div className="mt-1.5 pl-14">
                    <ItemNoteRow note={item.note} onChange={(v) => onItemNoteChange(item.menu_item_id, v)} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {errorMsg && <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/25 rounded-xl px-3 py-2">{errorMsg}</div>}

          <div className="bg-[var(--color-text)] text-white rounded-xl flex items-center justify-between px-4 py-3">
            <div className="text-sm font-bold">{t("common.total")}: ${total.toFixed(2)} <span className="text-[var(--color-primary)]">៛{totalKHR.toLocaleString()}</span></div>
          </div>

          <div className="flex gap-2">
            <button onClick={onCancel} disabled={submitting} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">{t("common.cancel")}</button>
            <button onClick={onConfirm} disabled={submitting}
              className={cn("flex-1 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5", submitted ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-primary)] text-white", submitting && "opacity-60")}>
              {submitted ? <><Check size={14} /> {t("guest.orderPlaced")}</> : submitting ? t("guest.submitting") : t("guest.confirmOrder")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
