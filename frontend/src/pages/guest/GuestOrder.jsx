import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useMenuItemStore } from "../../context/menuItemContext"
import { useMenuCategoryStore } from "../../context/menuCategoryContext"
import { useTableStore } from "../../context/tableContext"
import { useOrderStore } from "../../context/orderContext"
import { useOrderItemStore } from "../../context/orderItemContext"
import { useSocketTable, useSocketEvent } from "../../services/socket"
import { usePageTitle } from "../../hooks/usePageTitle"
import { useGuestOrderSound } from "../../hooks/useGuestOrderSound"
import {
  InvalidTable, GuestHeader, OrderStatusBanner, GuestMenuControls, GuestMenuGrid, CartBar, ConfirmOrderDialog,
} from "@/components/guest/GuestOrderParts"
import { useLang } from "@/i18n/LanguageContext"
import { getCurrentPosition, isMobileDevice } from "@/lib/geolocation"
import { LocationGate } from "@/components/guest/GuestOrderParts"

const KHR_RATE = 4100

export default function GuestOrder() {
  usePageTitle("Menu")
  const { t } = useLang()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get("t")

  const { items, fetchItems } = useMenuItemStore()
  const { categories, fetchCategories } = useMenuCategoryStore()
  const { getTableByToken } = useTableStore()
  const { createOrder, getActiveOrderByTable, updateOrderDetails } = useOrderStore()
  const { addItem } = useOrderItemStore()

  const [activeCat, setActiveCat] = useState("All")
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [queueNumber, setQueueNumber] = useState(null)
  const [partySize, setPartySize] = useState("")
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [table, setTable] = useState(null)
  const [loadingTable, setLoadingTable] = useState(true)
  const [tableError, setTableError] = useState(false)
  const [liveOrderStatus, setLiveOrderStatus] = useState(null)

  // Guest must confirm they're physically at the café before they can see
  // the menu or order. "checking" -> "ok" | "blocked".
  const [geoStatus, setGeoStatus] = useState("checking")
  const [geoError, setGeoError] = useState(null)
  const [coords, setCoords] = useState(null)

  const checkLocation = () => {
    setGeoStatus("checking")
    setGeoError(null)

    if (!isMobileDevice()) {
      setGeoError("DESKTOP")
      setGeoStatus("blocked")
      return
    }

    getCurrentPosition()
      .then(({ latitude, longitude }) => {
        setCoords({ latitude, longitude })
        setGeoStatus("ok")
      })
      .catch((err) => {
        setGeoError(err.code)
        setGeoStatus("blocked")
      })
  }

  
  
  useSocketTable(table?.table_id)
  useGuestOrderSound()

  useSocketEvent("order:status_changed", (data) => {
    if (data?.status) setLiveOrderStatus(data.status)
  })
  useSocketEvent("order:new", () => setLiveOrderStatus("Pending"))

  useEffect(() => {
    fetchItems()
    fetchCategories()

    
    
    
    if (token) {
      getTableByToken(token)
        .then(async (t) => {
          setTable(t)
          
          
          localStorage.setItem("zoom_last_table_token", token)

          
          
          
          try {
            const existing = await getActiveOrderByTable(t.table_id)
            if (existing) setLiveOrderStatus(existing.status)
          } catch {}
        })
        .catch(() => setTableError(true))
        .finally(() => setLoadingTable(false))
    } else {
      setLoadingTable(false)
    }
  }, [token])

  useEffect(() => { if (table) checkLocation() }, [table])

  
  if (!token) {
    return <InvalidTable navigate={navigate} message={t("guest.noTable")} />
  }
  if (!loadingTable && (tableError || !table)) {
    return <InvalidTable navigate={navigate} message={t("guest.tableNotFound")} />
  }
  if (table && geoStatus !== "ok") {
    return <LocationGate status={geoStatus} errorCode={geoError} onRetry={checkLocation} navigate={navigate} />
  }

  const availableItems = items.filter(i => i.available)
  const filtered = availableItems.filter(i => {
    const matchesCat = activeCat === "All" || i.category_id === activeCat
    
    
    const q = search.toLowerCase()
    const matchesSearch = i.item_name?.toLowerCase().includes(q) || i.item_name_km?.toLowerCase().includes(q)
    return matchesCat && matchesSearch
  })

  
  const addToCart = (id) => setCart(c => ({ ...c, [id]: { qty: (c[id]?.qty || 0) + 1, note: c[id]?.note || "" } }))
  const removeFromCart = (id) => setCart(c => {
    const n = { ...c }
    if ((n[id]?.qty || 0) <= 1) delete n[id]
    else n[id] = { ...n[id], qty: n[id].qty - 1 }
    return n
  })
  const setItemNote = (id, note) => setCart(c => (
    c[id] ? { ...c, [id]: { ...c[id], note } } : c
  ))

  const cartItems = Object.entries(cart).map(([id, { qty, note }]) => ({
    ...items.find(i => i.menu_item_id === +id), qty, note
  }))
  const total = cartItems.reduce((s, i) => s + Number(i.price) * i.qty, 0)
  const totalKHR = Math.round(total * KHR_RATE)
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0)

  const handleConfirm = async () => {
    setSubmitting(true)
    setErrorMsg("")
    try {
      let orderId

      // Re-check for an active order right before submitting — if another
      // guest at the same table already started one, join it instead of
      // creating a second, conflicting order for the same table.
      const existing = await getActiveOrderByTable(table.table_id)

      if (existing) {
        orderId = existing.order_id
        setQueueNumber(existing.queue_number ?? null)
        // This order already existed — createOrder never ran, so send
        // any party_size/note the guest typed here instead. Only bother
        // if they actually entered something.
        if (partySize || note) {
          try {
            await updateOrderDetails(orderId, { party_size: partySize || undefined, note: note || undefined })
          } catch {
            // non-fatal — the order itself still goes through fine even
            // if this side-detail update fails
          }
        }
      } else {
        try {
          const order = await createOrder({
            table_id: table.table_id, channel: "guest",
            latitude: coords?.latitude, longitude: coords?.longitude,
            party_size: partySize || undefined, note: note || undefined,
          })
          orderId = order.order_id
          setQueueNumber(order.queue_number ?? null)
        } catch (createErr) {
          const fallbackId = createErr?.response?.data?.order_id
          if (fallbackId) {
            orderId = fallbackId
          } else {
            throw createErr
          }
        }
      }

      for (const item of cartItems) {
        await addItem({
          order_id: orderId,
          menu_item_id: item.menu_item_id,
          quantity: item.qty,
          note: item.note || undefined,
          channel: "guest",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        })
      }

      setSubmitted(true)
      setLiveOrderStatus("Pending")
      
      
      
      
      setTimeout(() => {
        setSubmitted(false)
        setCart({})
        setPartySize("")
        setNote("")
        setConfirmOpen(false)
      }, 1500)
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || t("guest.submitError"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[var(--color-background)] pb-24">
      <GuestHeader table={table} token={token} navigate={navigate} />

      <OrderStatusBanner liveOrderStatus={liveOrderStatus} token={token} navigate={navigate} />

      <div className="p-4 space-y-4">
        <GuestMenuControls
          search={search} setSearch={setSearch}
          categories={categories} activeCat={activeCat} setActiveCat={setActiveCat}
        />
        <GuestMenuGrid items={filtered} cart={cart} onAdd={addToCart} onRemove={removeFromCart} />
      </div>

      <CartBar total={total} totalKHR={totalKHR} cartCount={cartCount}
        onOrder={() => { setConfirmOpen(true); setErrorMsg("") }} />

      <ConfirmOrderDialog
        open={confirmOpen} table={table} cartItems={cartItems} onItemNoteChange={setItemNote}
        onIncrease={addToCart} onDecrease={removeFromCart}
        total={total} totalKHR={totalKHR} errorMsg={errorMsg}
        submitting={submitting} submitted={submitted} queueNumber={queueNumber}
        partySize={partySize} onPartySizeChange={setPartySize}
        note={note} onNoteChange={setNote}
        onCancel={() => setConfirmOpen(false)} onConfirm={handleConfirm}
      />
    </div>
  )
}
