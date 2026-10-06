import { QRCodeSVG } from "qrcode.react"

export function buildTableOrderUrl(table) {
  return `${window.location.origin}/order?t=${table.qr_token}`
}

export default function TableQRCode({ table, size = 160 }) {
  const url = buildTableOrderUrl(table)
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-[var(--color-border)]">
      <div className="border-2 border-[var(--color-primary)] rounded-xl px-2 py-1 text-center">
        <span className="font-display font-bold text-xs text-[var(--color-primary)]">ZOOM</span>
        <span className="text-[8px] text-[var(--color-muted)] ml-1">Garden Cafe & Wine</span>
      </div>
      <div className="p-2 bg-white rounded-xl">
        <QRCodeSVG value={url} size={size} level="M" fgColor="#111827" bgColor="#ffffff" />
      </div>
      <div className="text-center">
        <div className="font-bold text-base text-[var(--color-text)]">{table.table_number}</div>
        <div className="text-[10px] text-[var(--color-muted)]">Scan to order</div>
      </div>
    </div>
  )
}
