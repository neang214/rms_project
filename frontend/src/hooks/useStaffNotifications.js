import { useState, useCallback } from "react"
import { useSocketRole, useSocketEvent } from "../services/socket"
import { useOrderStore } from "../context/orderContext"
import { useOrderItemStore } from "../context/orderItemContext"

let sharedAudioCtx = null
function getAudioContext() {
  if (!sharedAudioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    sharedAudioCtx = new Ctx()
  }
  return sharedAudioCtx
}

export function isAudioUnlocked() {
  return !!sharedAudioCtx && sharedAudioCtx.state === "running"
}

export function unlockAudioNow() {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === "suspended") ctx.resume()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = 1046
  gain.gain.setValueAtTime(0.35, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.18)
}

export function playAlertSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    if (ctx.state === "suspended") ctx.resume()

    const playTone = (freq, startTime, duration, volume = 0.45) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = "sine"
      gain.gain.setValueAtTime(volume, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
      osc.start(startTime)
      osc.stop(startTime + duration)
    }
    const now = ctx.currentTime
    
    
    playTone(880, now, 0.22)
    playTone(1175, now + 0.24, 0.28)
    playTone(880, now + 0.6, 0.22)
    playTone(1175, now + 0.84, 0.28)
  } catch {}
}

export function unlockAudioOnFirstInteraction() {
  const unlock = () => {
    try {
      const ctx = getAudioContext()
      if (ctx && ctx.state === "suspended") ctx.resume()
    } catch {}
    window.removeEventListener("click", unlock)
    window.removeEventListener("keydown", unlock)
    window.removeEventListener("touchstart", unlock)
  }
  window.addEventListener("click", unlock, { once: true })
  window.addEventListener("keydown", unlock, { once: true })
  window.addEventListener("touchstart", unlock, { once: true })
}

export function useStaffNotifications(role) {
  const { connected } = useSocketRole(role)
  const [bellRinging, setBellRinging] = useState(false)

  const { orders, fetchOrders } = useOrderStore()
  const { kitchenQueue, baristaQueue, fetchKitchenQueue, fetchBaristaQueue } = useOrderItemStore()

  const ring = useCallback(() => {
    setBellRinging(true)
    playAlertSound()
    setTimeout(() => setBellRinging(false), 2000)
  }, [])

  // Cashier no longer reviews/confirms orders (that existed only to vet
  // guest self-submitted orders) — staff create orders directly now, so
  // the cashier's bell instead tracks orders that are Served and still
  // unpaid, i.e. need the cashier's attention to collect payment.
  useSocketEvent("order:new", () => {
    if (role === "cashier") fetchOrders()
    if (role === "kitchen") fetchKitchenQueue()
    if (role === "barista") fetchBaristaQueue()
  })
  useSocketEvent("order:status_changed", () => {
    if (role === "cashier") fetchOrders()
  })
  useSocketEvent("order:deleted", () => {
    if (role === "cashier") fetchOrders()
  })

  useSocketEvent("order_item:new", () => {
    if (role === "kitchen") {
      fetchKitchenQueue()
      ring()
    }
    if (role === "barista") {
      fetchBaristaQueue()
      ring()
    }
  })
  useSocketEvent("order_item:status_changed", () => {
    if (role === "cashier") {
      fetchOrders()
      ring()
    }
  })

  let count = 0
  if (role === "cashier") count = orders.filter(o => o.status === "Served" && !(o.is_paid ?? o.status === "Paid")).length
  if (role === "kitchen") count = kitchenQueue.filter(i => i.status === "Pending").length
  if (role === "barista") count = baristaQueue.filter(i => i.status === "Pending").length

  const refresh = useCallback(() => {
    if (role === "cashier") fetchOrders()
    if (role === "kitchen") fetchKitchenQueue()
    if (role === "barista") fetchBaristaQueue()
  }, [role])

  return { count, bellRinging, connected, refresh }
}
