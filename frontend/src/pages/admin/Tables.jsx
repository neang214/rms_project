import { useState, useEffect } from "react"
import { useLang } from "@/i18n/LanguageContext"
import { deleteErrorMessage } from "@/lib/utils"
import { ConfirmModal } from "@/components/shared"
import { Plus, QrCode, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui"
import { useTableStore } from "../../context/tableContext"
import { useOrderStore } from "../../context/orderContext"
import { useSocketRole, useSocketEvent } from "../../services/socket"
import { usePageTitle } from "../../hooks/usePageTitle"
import {
  printElement, TablesList, TableFormDialog, TableViewDialog, SingleQrDialog, PrintAllQrDialog,
} from "@/components/admin/TablesParts"

export default function Tables() {
  const { t } = useLang()
  usePageTitle("Table")
  const { tables, fetchTablesWithTokens, createTable, updateTable, deleteTable, regenerateQrToken, isLoading } = useTableStore()
  const { getActiveOrderByTable } = useOrderStore()

  const [addOpen, setAddOpen] = useState(false)
  const [viewTable, setViewTable] = useState(null)
  const [qrTable, setQrTable] = useState(null)
  const [printAllOpen, setPrintAllOpen] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [viewOrder, setViewOrder] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [editTable, setEditTable] = useState(null)
  const [form, setForm] = useState({ table_number: "", capacity: "", is_available: true })
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    fetchTablesWithTokens()
  }, [])

  // Real-time: table availability changes (a guest/cashier starts or pays
  // off an order) reflect here immediately instead of waiting on a poll.
  const { connected } = useSocketRole("admin")
  useSocketEvent("table:created", () => fetchTablesWithTokens())
  useSocketEvent("table:updated", () => fetchTablesWithTokens())
  useSocketEvent("table:deleted", () => fetchTablesWithTokens())

  const openAdd = () => {
    setForm({ table_number: "", capacity: "", is_available: true })
    setErrorMsg("")
    setAddOpen(true)
  }

  const openEdit = (t) => {
    setEditTable(t)
    setErrorMsg("")
    setForm({ table_number: t.table_number, capacity: t.capacity, is_available: t.is_available })
  }

  const openView = async (t) => {
    setViewTable(t)
    setViewOrder(null)
    setViewLoading(true)
    try {
      const order = await getActiveOrderByTable(t.table_id)
      setViewOrder(order)
    } catch (err) {
      console.error(err)
    } finally {
      setViewLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!form.table_number || !form.capacity) {
      setErrorMsg("Table number and capacity are required.")
      return
    }
    setSaving(true)
    setErrorMsg("")
    try {
      await createTable({ table_number: form.table_number, capacity: parseInt(form.capacity), is_available: true })
      setAddOpen(false)
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to add table.")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    setSaving(true)
    setErrorMsg("")
    try {
      await updateTable(editTable.table_id, {
        table_number: form.table_number,
        capacity: parseInt(form.capacity),
        is_available: form.is_available,
      })
      setEditTable(null)
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to update table.")
    } finally {
      setSaving(false)
    }
  }

  // Deleting is destructive and irreversible, so it goes through a
  // confirmation modal instead of firing immediately on click.
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const requestDelete = (id) => {
    setDeleteError("")
    const item = tables.find(x => x.table_id === id)
    setDeleteTarget(item || { table_id: id })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError("")
    try {
      await deleteTable(deleteTarget.table_id)
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(deleteErrorMessage(err, t))
    } finally {
      setDeleting(false)
    }
  }

  // Issues a fresh qr_token, invalidating the old printed QR; updates qrTable
  // in place so the open dialog shows the new code.
  const handleRegenerateQr = async (id) => {
    setRegenerating(true)
    try {
      const updated = await regenerateQrToken(id)
      setQrTable(updated)
    } catch (err) {
      console.error(err)
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">Table Management</h1>
        <div className="flex items-center gap-2">
          <div className={cn("flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-full", connected ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]" : "bg-[var(--color-danger-muted)] text-[var(--color-danger)]")}>
            {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
            {connected ? "Live" : "Reconnecting..."}
          </div>
          <Button variant="outline" onClick={() => setPrintAllOpen(true)} className="gap-2"><QrCode size={15} /> QR Codes</Button>
          <Button onClick={openAdd} className="gap-2"><Plus size={15} /> New Table</Button>
        </div>
      </div>

      <TablesList tables={tables} isLoading={isLoading}
        onQr={setQrTable} onView={openView} onEdit={openEdit} onDelete={requestDelete} />

      <TableFormDialog
        open={addOpen} onClose={() => setAddOpen(false)}
        title="Add New Table" description="Add a new dining table"
        form={form} setForm={setForm} showStatus={false}
        errorMsg={errorMsg} saving={saving} onSubmit={handleAdd} submitLabel="Add Table"
      />

      <TableFormDialog
        open={!!editTable} onClose={() => setEditTable(null)}
        title="Edit Table" description={null}
        form={form} setForm={setForm} showStatus
        errorMsg={errorMsg} saving={saving} onSubmit={handleUpdate} submitLabel="Update Table"
      />

      <TableViewDialog table={viewTable} order={viewOrder} loading={viewLoading} onClose={() => setViewTable(null)} />

      <SingleQrDialog table={qrTable} onClose={() => setQrTable(null)}
        onRegenerate={handleRegenerateQr} regenerating={regenerating} onPrint={printElement} />

      <PrintAllQrDialog open={printAllOpen} onClose={() => setPrintAllOpen(false)} tables={tables} onPrint={printElement} />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        busy={deleting}
        danger
        title="Delete this table?"
        message={`This will permanently delete "${deleteTarget?.table_number}". This can't be undone.`}
        confirmLabel="Delete"
        errorMsg={deleteError}
      />
    </div>
  )
}
