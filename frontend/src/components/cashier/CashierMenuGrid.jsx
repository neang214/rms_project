import { imageUrl, menuItemName } from "@/lib/utils"
import { Plus, Minus } from "lucide-react"
import { useLang } from "@/i18n/LanguageContext"

const FALLBACK_IMG = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop"

function MenuItemCard({ item, qty, onAdd, onRemove, lang }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden hover:shadow-md transition-all group relative">
      <div className="relative aspect-square overflow-hidden bg-[var(--color-border)]">
        <img src={imageUrl(item.image_url, FALLBACK_IMG)} alt={menuItemName(item, lang)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-2.5">
        <div className="font-medium text-[var(--color-text)] text-xs leading-snug line-clamp-2 mb-2">{menuItemName(item, lang)}</div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--color-text)]">$ {Number(item.price).toFixed(2)}</span>
          {qty === 0 ? (
            <button onClick={() => onAdd(item.menu_item_id)} className="w-7 h-7 rounded-full bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-primary)] flex items-center justify-center transition-all">
              <Plus size={14} />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button onClick={() => onRemove(item.menu_item_id)} className="w-6 h-6 rounded-full bg-[var(--color-danger-muted)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white flex items-center justify-center transition-all">
                <Minus size={11} />
              </button>
              <span className="text-xs font-bold w-4 text-center text-[var(--color-primary)]">{qty}</span>
              <button onClick={() => onAdd(item.menu_item_id)} className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-primary)] flex items-center justify-center transition-all">
                <Plus size={11} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CashierMenuGrid({ items, cart, onAdd, onRemove }) {
  const { t, lang } = useLang()
  if (items.length === 0) {
    return <div className="text-center py-16 text-[var(--color-muted)] text-sm">{t("common.noMenuItems")}</div>
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {items.map(item => (
        <MenuItemCard
          key={item.menu_item_id}
          item={item}
          qty={cart[item.menu_item_id]?.qty || 0}
          onAdd={onAdd}
          onRemove={onRemove}
          lang={lang}
        />
      ))}
    </div>
  )
}
