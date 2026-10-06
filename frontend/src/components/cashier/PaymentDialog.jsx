import { useState, useEffect, useRef } from "react"
import { Check, Bell, QrCode, Loader2, X, CreditCard } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { cn, menuItemName } from "@/lib/utils"
import { usePaymentStore } from "../../context/paymentContext"
import api from "../../services/axios"
import { orderTotal, KHR_RATE } from "./orderHelpers"
import { useLang } from "@/i18n/LanguageContext"

export default function PaymentDialog({ order, paymentMethods = [], unconfirmedCount = 0, onClose, onPaid }) {
  const { t, lang } = useLang()
  const { createPayment } = usePaymentStore()

  const [payMethodId, setPayMethodId] = useState(null)
  const [paying, setPaying] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [cashGiven, setCashGiven] = useState("")
  const [cashCur, setCashCur] = useState("USD") 

  const [payMode, setPayMode] = useState("normal") 
  const [khqrData, setKhqrData] = useState(null)
  const [khqrCurrency, setKhqrCurrency] = useState("USD")
  const [khqrLoading, setKhqrLoading] = useState(false)
  const [khqrPaid, setKhqrPaid] = useState(false)
  const [khqrError, setKhqrError] = useState(null)
  const [khqrConfirming, setKhqrConfirming] = useState(false)
  const [khqrCountdown, setKhqrCountdown] = useState(600)
  const khqrPollRef = useRef(null)
  const khqrCountdownRef = useRef(null)

  const stopKhqrPolling = () => {
    if (khqrPollRef.current) clearInterval(khqrPollRef.current)
    if (khqrCountdownRef.current) clearInterval(khqrCountdownRef.current)
    khqrPollRef.current = null
    khqrCountdownRef.current = null
  }

  
  useEffect(() => {
    if (!order) return
    setPayMethodId(paymentMethods.find(m => !/khqr|aba|bakong/i.test(m.method_name))?.method_id || null)
    setErrorMsg("")
    setCashGiven("")
    setCashCur("USD")
    setPayMode("normal")
    setKhqrData(null)
    setKhqrPaid(false)
    setKhqrError(null)
    
  }, [order])

  
  useEffect(() => stopKhqrPolling, [])

  if (!order) return null

  const total = orderTotal(order)
  const totalKHR = Math.round(total * KHR_RATE)
  const itemCount = order.order_items?.reduce((s, oi) => s + oi.quantity, 0) || 0
  
  
  
  const khqrMethod = paymentMethods.find(m => /khqr|aba|bakong/i.test(m.method_name))
  const hasKHQR = !!khqrMethod
  const normalMethods = paymentMethods.filter(m => m.method_id !== khqrMethod?.method_id)

  const selectedMethod = paymentMethods.find(m => m.method_id === payMethodId)
  const isCash = /cash|សាច់ប្រាក់/i.test(selectedMethod?.method_name || "")
  const cashInput = parseFloat(cashGiven) || 0
  // convert whatever the cashier typed into USD so change math is consistent
  const cashUSD = cashCur === "KHR" ? cashInput / KHR_RATE : cashInput
  const change = cashUSD - total          
  const totalInCur = cashCur === "KHR" ? Math.round(total * KHR_RATE) : total
  const fmt = (usd) => cashCur === "KHR"
    ? `៛${Math.round(usd * KHR_RATE).toLocaleString()}`
    : `$${usd.toFixed(2)}`

  const handleClose = () => {
    stopKhqrPolling()
    onClose()
  }

  const generateKHQR = async () => {
    setKhqrLoading(true)
    setKhqrError(null)
    setKhqrData(null)
    setKhqrPaid(false)
    setKhqrCountdown(600)
    stopKhqrPolling()
    try {
      const res = await api.post("/payments/khqr/generate", {
        order_id: order.order_id,
        currency: khqrCurrency,
      })
      setKhqrData(res.data)

      
      
      
      khqrPollRef.current = setInterval(async () => {
        try {
          const check = await api.get(
            `/payments/khqr/check/${res.data.md5}?order_id=${order.order_id}&currency=${khqrCurrency}`
          )
          if (check.data.paid) {
            setKhqrPaid(true)
            stopKhqrPolling()
            onPaid?.()
            setTimeout(() => handleClose(), 2500)
          }
        } catch {}
      }, 3000)

      
      khqrCountdownRef.current = setInterval(() => {
        setKhqrCountdown(prev => {
          if (prev <= 1) {
            stopKhqrPolling()
            setKhqrData(null)
            setKhqrError("QR code expired. Please generate a new one.")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      setKhqrError(err?.response?.data?.message || "Failed to generate KHQR")
    } finally {
      setKhqrLoading(false)
    }
  }

  const confirmPay = async () => {
    if (!payMethodId) {
      setErrorMsg("Please select a payment method.")
      return
    }
    setPaying(true)
    setErrorMsg("")
    try {
      await createPayment({ order_id: order.order_id, method_id: payMethodId })
      onPaid?.()
      onClose()
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to process payment.")
    } finally {
      setPaying(false)
    }
  }

  // Manual KHQR confirm — cashier taps after the customer shows their ABA
  // success screen. Uses the KHQR method if it exists, else the first one.
  // Once BAKONG_TOKEN is configured, auto-polling replaces this.
  const confirmKHQRPay = async () => {
    setKhqrConfirming(true)
    setKhqrError(null)
    try {
      // Record under the actual KHQR method row from the DB.
      if (khqrMethod) await createPayment({ order_id: order.order_id, method_id: khqrMethod.method_id })
      else await createPayment({ order_id: order.order_id, method_name: "KHQR" })
      onPaid?.()
      stopKhqrPolling()
      setKhqrPaid(true)
      setTimeout(() => handleClose(), 2500)
    } catch (err) {
      setKhqrError(err?.response?.data?.message || "Failed to confirm payment.")
    } finally {
      setKhqrConfirming(false)
    }
  }

  const switchMode = (mode) => {
    if (mode === "normal") {
      stopKhqrPolling()
      setKhqrData(null)
      setKhqrError(null)
    }
    setPayMode(mode)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[var(--color-surface)] rounded-3xl shadow-2xl w-full max-w-md border border-[var(--color-border)] overflow-hidden flex flex-col max-h-[92vh]">

        {}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[var(--color-primary-muted)] shrink-0">
          <div>
            <div className="font-semibold text-sm text-[var(--color-text)]">Order #{String(order.order_id).padStart(4, "0")}</div>
            <div className="text-[11px] text-[var(--color-muted)]">
              Table {order.table?.table_number} · {itemCount} {t("common.items")} · {new Date(order.order_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-black/5 text-[var(--color-muted)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {}
        <div className="text-center px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="text-[11px] text-[var(--color-muted)] uppercase tracking-wide">{t("pay.totalToCollect")}</div>
          <div className="text-3xl font-bold text-[var(--color-text)] mt-0.5">${total.toFixed(2)}</div>
          <div className="text-sm text-[var(--color-muted)]">៛{totalKHR.toLocaleString()}</div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {unconfirmedCount > 0 && (
            <div className="flex items-center gap-1.5 bg-[var(--color-accent-muted)] text-[var(--color-warning)] text-[11px] font-semibold px-3 py-2 rounded-xl">
              <Bell size={13} /> {unconfirmedCount} {t("pay.needConfirm")}
            </div>
          )}

          {}
          {hasKHQR && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--color-primary-muted)]/60 rounded-2xl">
              <button onClick={() => switchMode("normal")}
                className={cn("flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  payMode === "normal" ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm" : "text-[var(--color-text-secondary)]")}>
                <CreditCard size={15} /> {t("pay.cashCard")}
              </button>
              <button onClick={() => switchMode("khqr")}
                className={cn("flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  payMode === "khqr" ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm" : "text-[var(--color-text-secondary)]")}>
                <QrCode size={15} /> {t("pay.khqr")}
              </button>
            </div>
          )}

          {payMode === "normal" ? (
            <>
              {}
              <div className="rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)] max-h-40 overflow-y-auto">
                {order.order_items?.map((oi) => (
                  <div key={oi.order_item_id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-[var(--color-text)] truncate pr-2">
                      <span className="text-[var(--color-muted)] mr-1.5">{oi.quantity}×</span>{menuItemName(oi.menu_item, lang)}
                    </span>
                    <span className="text-[var(--color-muted)] shrink-0">${(Number(oi.unit_price) * oi.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {}
              <div>
                <div className="text-sm font-semibold text-[var(--color-text)] mb-2">{t("pay.method")}</div>
                <div className="grid grid-cols-2 gap-2">
                  {normalMethods.map(m => (
                    <button key={m.method_id} onClick={() => setPayMethodId(m.method_id)}
                      className={cn("flex items-center gap-2.5 p-3 rounded-2xl border-2 text-sm font-medium transition-all min-h-[52px]",
                        payMethodId === m.method_id ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-primary)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/50")}>
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0",
                        payMethodId === m.method_id ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-primary)]/15 text-[var(--color-primary)]")}>
                        {m.method_name.charAt(0)}
                      </div>
                      {m.method_name}
                    </button>
                  ))}
                </div>
              </div>

              {isCash && (
                <div className="space-y-2 rounded-2xl border border-[var(--color-border)] p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-[var(--color-text)]">{t("pay.cashReceived")}</div>
                    {}
                    <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
                      {["USD", "KHR"].map(c => (
                        <button key={c} onClick={() => { setCashCur(c); setCashGiven("") }}
                          className={cn("px-3 py-1 text-xs font-bold transition-colors",
                            cashCur === c ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-secondary)]")}>
                          {c === "USD" ? "$" : "៛"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-lg font-bold">{cashCur === "USD" ? "$" : "៛"}</span>
                    <input
                      type="number" inputMode="decimal" min="0" step={cashCur === "USD" ? "0.01" : "100"}
                      value={cashGiven}
                      onChange={e => setCashGiven(e.target.value)}
                      placeholder={cashCur === "USD" ? "0.00" : "0"}
                      className="w-full h-12 pl-8 pr-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-lg font-bold text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>

                  {}
                  <div className="flex gap-1.5 flex-wrap">
                    <button onClick={() => setCashGiven(cashCur === "KHR" ? String(totalInCur) : total.toFixed(2))}
                      className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                      {t("pay.exact")}
                    </button>
                    {(cashCur === "USD"
                      ? [1, 5, 10, 20, 50, 100].filter(v => v >= total)
                      : [5000, 10000, 20000, 50000, 100000].filter(v => v >= totalInCur)
                    ).slice(0, 4).map(v => (
                      <button key={v} onClick={() => setCashGiven(String(v))}
                        className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                        {cashCur === "USD" ? `$${v}` : `៛${v.toLocaleString()}`}
                      </button>
                    ))}
                  </div>

                  {}
                  <div className={cn("rounded-xl px-3 py-2.5 flex items-center justify-between",
                    cashInput === 0 ? "bg-[var(--color-primary-muted)]/40" : change < 0 ? "bg-[var(--color-danger-muted)]" : "bg-[var(--color-primary-muted)]")}>
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">{t("pay.change")}</span>
                    {cashInput === 0 ? (
                      <span className="text-sm text-[var(--color-muted)]">—</span>
                    ) : change < 0 ? (
                      <span className="text-sm font-bold text-[var(--color-danger)]">{t("pay.short")} {fmt(Math.abs(change))}</span>
                    ) : (
                      <span className="text-lg font-bold text-[var(--color-primary)]">{fmt(change)}</span>
                    )}
                  </div>
                </div>
              )}

              {errorMsg && <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/25 rounded-xl px-3 py-2">{errorMsg}</div>}
            </>
          ) : (
                        <>
              {!khqrData && !khqrPaid && (
                <>
                  <div className="text-sm font-semibold text-[var(--color-text)]">{t("pay.chargeIn")}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {["USD", "KHR"].map(c => (
                      <button key={c} onClick={() => setKhqrCurrency(c)}
                        className={cn("py-3 rounded-2xl text-sm font-semibold border-2 transition-all",
                          khqrCurrency === c ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-primary)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/50")}>
                        {c === "USD" ? `$ ${total.toFixed(2)}` : `៛ ${totalKHR.toLocaleString()}`}
                      </button>
                    ))}
                  </div>
                  {khqrError && <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/25 rounded-xl px-3 py-2">{khqrError}</div>}
                </>
              )}

              {khqrData && !khqrPaid && (
                <div className="text-center space-y-2">
                  <div className="text-xs text-[var(--color-muted)]">{t("pay.scanHint")}</div>
                  <div className="flex justify-center p-4 bg-white rounded-2xl border border-[var(--color-border)]">
                    <QRCodeSVG value={khqrData.qr} size={190} />
                  </div>
                  <div className="text-lg font-bold text-[var(--color-primary)]">
                    {khqrData.currency === "USD" ? `$${Number(khqrData.amount).toFixed(2)}` : `៛${Number(khqrData.amount).toLocaleString()}`}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-muted)]">
                    <Loader2 size={12} className="animate-spin" /> {t("pay.waiting")} {Math.floor(khqrCountdown / 60)}:{String(khqrCountdown % 60).padStart(2, "0")}
                  </div>
                  {khqrError && <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/25 rounded-xl px-3 py-2">{khqrError}</div>}
                </div>
              )}

              {khqrPaid && (
                <div className="text-center space-y-2 py-6">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-primary-muted)] flex items-center justify-center mx-auto">
                    <Check size={32} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="font-bold text-lg text-[var(--color-primary)]">{t("pay.confirmed")}</div>
                  <div className="text-xs text-[var(--color-muted)]">{t("pay.markedPaid")}</div>
                </div>
              )}
            </>
          )}
        </div>

        {}
        {!khqrPaid && (
          <div className="px-5 py-3.5 border-t border-[var(--color-border)] shrink-0">
            {payMode === "normal" ? (
              <div className="flex gap-2">
                <button onClick={handleClose} disabled={paying} className="flex-1 py-3 rounded-2xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-muted)] transition-colors disabled:opacity-60 min-h-[48px]">{t("common.cancel")}</button>
                <button onClick={confirmPay} disabled={paying} className="flex-[2] py-3 rounded-2xl bg-[var(--color-primary)] text-white text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 min-h-[48px]">
                  {paying ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {paying ? t("pay.processing") : `${t("pay.charge")} $${total.toFixed(2)}`}
                </button>
              </div>
            ) : !khqrData ? (
              <div className="flex gap-2">
                <button onClick={handleClose} className="flex-1 py-3 rounded-2xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-muted)] transition-colors min-h-[48px]">{t("common.cancel")}</button>
                <button onClick={generateKHQR} disabled={khqrLoading} className="flex-[2] py-3 rounded-2xl bg-[var(--color-primary)] text-white text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 min-h-[48px]">
                  {khqrLoading ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
                  {khqrLoading ? t("pay.generating") : t("pay.generateQr")}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={confirmKHQRPay} disabled={khqrConfirming} className="w-full py-3 rounded-2xl bg-[var(--color-primary)] text-white text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 min-h-[48px]">
                  {khqrConfirming ? <><Loader2 size={16} className="animate-spin" /> {t("pay.confirming")}</> : <><Check size={16} /> {t("pay.customerPaid")}</>}
                </button>
                <button onClick={handleClose} className="w-full py-2.5 rounded-2xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-muted)] transition-colors">{t("common.cancel")}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
