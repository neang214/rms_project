import { useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { QrCode, X, Loader2 } from "lucide-react"

const SCANNER_ELEMENT_ID = "receipt-qr-scanner"

function extractOrderId(decodedText) {
  const match = decodedText.match(/^order:(\d+)$/)
  return match ? parseInt(match[1]) : null
}

export default function ReceiptScanner({ onFound, onClose }) {
  const [error, setError] = useState("")
  const scannerRef = useRef(null)
  const startedRef = useRef(false)

  const stopScanner = async () => {
    if (scannerRef.current && startedRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch {
        // already stopped — ignore
      }
    }
    startedRef.current = false
  }

  const handleClose = async () => {
    await stopScanner()
    onClose()
  }

  // Start scanning once the viewport div is mounted.
  const bindScanner = async (node) => {
    if (!node || startedRef.current) return
    startedRef.current = true
    try {
      const qr = new Html5Qrcode(SCANNER_ELEMENT_ID)
      scannerRef.current = qr
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 240 },
        async (decodedText) => {
          const orderId = extractOrderId(decodedText)
          await stopScanner()
          if (orderId) {
            onFound(orderId)
          } else {
            setError("That doesn't look like a receipt QR code.")
          }
        },
        () => {
        }
      )
    } catch (err) {
      console.error(err)
      setError("Couldn't access the camera. Please allow camera permission and try again.")
      startedRef.current = false
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-white">
          <QrCode size={18} />
          <span className="text-sm font-medium">Scan receipt</span>
        </div>
        <button onClick={handleClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div id={SCANNER_ELEMENT_ID} ref={bindScanner} className="w-full max-w-sm rounded-2xl overflow-hidden" />
      </div>
      <div className="p-6 text-center text-white/70 text-xs space-y-2">
        {error ? (
          <div className="text-[var(--color-danger)]">{error}</div>
        ) : (
          <div className="flex items-center justify-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Point the camera at the QR code on the receipt</div>
        )}
      </div>
    </div>
  )
}
