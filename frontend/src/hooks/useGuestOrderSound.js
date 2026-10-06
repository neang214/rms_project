import { useSocketEvent } from "../services/socket"
import { playAlertSound } from "./useStaffNotifications"

const STORAGE_KEY = "zoom_last_alerted_status"

export function useGuestOrderSound() {
  useSocketEvent("order:status_changed", (data) => {
    if (!data?.status) return
    
    
    
    if (data.status !== "Served" && data.status !== "Paid") return

    const lastAlerted = localStorage.getItem(STORAGE_KEY)
    if (lastAlerted === `${data.order_id}:${data.status}`) return

    localStorage.setItem(STORAGE_KEY, `${data.order_id}:${data.status}`)
    playAlertSound()
  })
}
