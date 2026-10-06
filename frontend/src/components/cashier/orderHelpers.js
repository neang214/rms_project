
export const KHR_RATE = 4100

export function orderTotal(order) {
  return order.order_items?.reduce(
    (sum, oi) => sum + Number(oi.unit_price) * oi.quantity,
    0
  ) || 0
}

export const statusConfig = {
  Served:    { labelKey: "cashier.readyForPayment", color: "bg-[var(--color-primary)] text-white", barColor: "border-l-[var(--color-primary)]" },
  Preparing: { labelKey: "status.cooking",          color: "bg-amber-100 text-amber-700",          barColor: "border-l-amber-400" },
  Pending:   { labelKey: "status.pending",          color: "bg-gray-100 text-gray-600",            barColor: "border-l-gray-300" },
}

export function printOrderReceipt(order) {
  if (!order) return
  const total = orderTotal(order)
  const khr = Math.round(total * KHR_RATE)
  const payment = order.payments?.[0]
  const dt = new Date(order.order_date).toLocaleString()

  
  
  
  
  
  
  
  const qrData = encodeURIComponent(`order:${order.order_id}`)
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`

  const lines = (order.order_items || []).map(oi => {
    const lineTotal = Number(oi.unit_price) * oi.quantity
    return `<tr>
      <td>${oi.quantity}&times;</td>
      <td>${oi.menu_item?.item_name ?? ""}${oi.note ? `<br/><span class="itemnote">${oi.note}</span>` : ""}</td>
      <td class="r">$${lineTotal.toFixed(2)}</td>
    </tr>`
  }).join("")

  const win = window.open("", "_blank", "width=380,height=640")
  win.document.write(`
    <html>
      <head>
        <title>Receipt #${String(order.order_id).padStart(4, "0")}</title>
        <style>
          * { font-family: 'Courier New', monospace; }
          body { width: 280px; margin: 0 auto; padding: 12px; color: #000; }
          .center { text-align: center; }
          h2 { margin: 4px 0; font-size: 15px; }
          .muted { color: #444; font-size: 11px; line-height: 1.5; }
          hr { border: none; border-top: 1px dashed #999; margin: 8px 0; }
          table { width: 100%; font-size: 12px; border-collapse: collapse; }
          td { padding: 2px 0; vertical-align: top; }
          td.r { text-align: right; }
          .itemnote { font-size: 10px; color: #666; font-style: italic; }
          .tot td { font-weight: bold; font-size: 14px; }
          .waiting { font-size: 22px; font-weight: bold; margin: 4px 0; }
          .foot { text-align: center; font-size: 10px; color: #666; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2>Zoom Garden Café &amp; Wine</h2>
          <div class="muted">Sen Sok</div>
        </div>
        <hr/>
        ${order.queue_number != null ? `
        <div class="center">
          <div class="muted">WAITING NUMBER</div>
          <div class="waiting">#${order.queue_number}</div>
        </div>
        <hr/>` : ""}
        <div class="muted">
          Order #${String(order.order_id).padStart(4, "0")}<br/>
          Table ${order.table?.table_number ?? "—"}<br/>
          ${dt}<br/>
          Status: ${order.status}
        </div>
        <hr/>
        <table>${lines}</table>
        <hr/>
        <table>
          <tr class="tot"><td colspan="2">TOTAL</td><td class="r">$${total.toFixed(2)}</td></tr>
          <tr><td colspan="2" class="muted">Riel</td><td class="r muted">៛${khr.toLocaleString()}</td></tr>
        </table>
        ${payment ? `<hr/><div class="muted">Paid via ${payment.method?.method_name}</div>` : ""}
        <hr/>
        <div class="center">
          <img src="${qrImg}" width="120" height="120" alt="QR code" />
          <div class="muted">Scan at the register to pay</div>
        </div>
        <div class="foot">Thank you!<br/>Printed ${new Date().toLocaleString()}</div>
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 300)
}
