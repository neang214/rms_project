import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Html5Qrcode } from "html5-qrcode"
import { usePageTitle } from "../../hooks/usePageTitle"
import { LandingContent, ScannerOverlay } from "@/components/guest/GuestLandingParts"
import { useLang } from "@/i18n/LanguageContext"

const SCANNER_ELEMENT_ID = "qr-scanner-viewport"

export default function GuestLanding() {
  usePageTitle("Welcome")
  const navigate = useNavigate()
  const { t } = useLang()
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")
  const scannerRef = useRef(null)
  const [lastToken, setLastToken] = useState(null)

  useEffect(() => {
    setLastToken(localStorage.getItem("zoom_last_table_token"))
    return () => {
      stopScanner()
    }
  }, [])

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
      } catch {}
      scannerRef.current = null
    }
  }

  
  const extractToken = (decodedText) => {
    try {
      const url = new URL(decodedText)
      return url.searchParams.get("t")
    } catch {
      const match = decodedText.match(/t=([a-f0-9]+)/i)
      return match ? match[1] : decodedText.trim()
    }
  }

  const startScanner = async () => {
    setError("")
    setScanning(true)

    // wait one tick so the viewport div is mounted before html5-qrcode binds to it
    setTimeout(async () => {
      try {
        const qr = new Html5Qrcode(SCANNER_ELEMENT_ID)
        scannerRef.current = qr

        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 240 },
          async (decodedText) => {
            const token = extractToken(decodedText)
            await stopScanner()
            setScanning(false)
            if (token) {
              navigate(`/order?t=${token}`)
            } else {
              setError(t("guest.qrUnreadable"))
            }
          },
          () => {
          }
        )
      } catch (err) {
        console.error(err)
        setError(t("guest.cameraError"))
        setScanning(false)
      }
    }, 100)
  }

  const handleClose = async () => {
    await stopScanner()
    setScanning(false)
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[var(--color-background)]">
      <LandingContent onScan={startScanner} lastToken={lastToken} error={error} navigate={navigate} />
      <ScannerOverlay scanning={scanning} elementId={SCANNER_ELEMENT_ID} onClose={handleClose} />
    </div>
  )
}
