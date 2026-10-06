import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs) { return twMerge(clsx(inputs)) }

const IMG_ORIGIN =
  (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/api\/?$/, "")

export function imageUrl(src, fallback = null) {
  if (!src) return fallback
  if (/^(https?:|blob:|data:)/.test(src)) return src
  return `${IMG_ORIGIN}${src.startsWith("/") ? "" : "/"}${src}`
}

/*
 * Resolves a menu item's display name for the given language. Falls back
 * to the English name if there's no Khmer translation set (or the item is
 * missing entirely). Used everywhere a menu item name is shown, so it
 * follows whichever language the viewer (guest or staff) has selected.
 */
export function menuItemName(item, lang) {
  if (!item) return ""
  if (lang === "km" && item.item_name_km) return item.item_name_km
  return item.item_name
}

const DELETE_ERROR_KEYS = {
  TABLE_HAS_ORDERS: "errors.tableHasOrders",
  USER_HAS_RECORDS: "errors.userHasRecords",
  ITEM_HAS_ORDERS: "errors.itemHasOrders",
  CATEGORY_HAS_ITEMS: "errors.categoryHasItems",
  SUPPLIER_HAS_RECORDS: "errors.supplierHasRecords",
}

export function deleteErrorMessage(err, t) {
  const code = err?.response?.data?.code
  const key = code && DELETE_ERROR_KEYS[code]
  if (key) return t(key)
  return err?.response?.data?.message || t("errors.deleteFailed")
}
