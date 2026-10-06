import { useState, useEffect } from "react"
import { useLang } from "@/i18n/LanguageContext"
import { deleteErrorMessage } from "@/lib/utils"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui"
import { useStockStore } from "../../context/stockContext"
import { useUnitStore } from "../../context/unitContext"
import { usePageTitle } from "../../hooks/usePageTitle"
import { SimpleHeader, ConfirmModal } from "@/components/shared"
import {
  StockStats, StockTable, StockFormDialog, StockViewDialog, AddQtyDialog, AddUnitDialog, stockImageUrl,
} from "@/components/admin/StockParts"

export default function Stock() {
  const { t } = useLang()
  usePageTitle("Stock Management")
  const { stockItems, fetchStock, createStock, updateStock, increaseStock, deleteStock, uploadStockImage, isLoading } = useStockStore()
  const { units, fetchUnits, createUnit } = useUnitStore()

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [catFilter, setCatFilter] = useState("All categories")
  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [addQtyItem, setAddQtyItem] = useState(null)
  const [addQty, setAddQty] = useState("")
  const [addUnitOpen, setAddUnitOpen] = useState(false)
  const [newUnitName, setNewUnitName] = useState("")
  const [form, setForm] = useState({ item_name: "", quantity: "", unit_id: "", min_level: "", stock_type: "both" })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    fetchStock()
    fetchUnits()
  }, [])

  // Stock has no category field on the backend — filter only by search + unit.
  const filtered = stockItems.filter(i => {
    const matchesUnit = catFilter === "All categories" || i.unit?.unit_name === catFilter
    const matchesSearch = i.item_name?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || (i.stock_type || "both") === typeFilter
    return matchesUnit && matchesSearch && matchesType
  })

  const lowStockCount = stockItems.filter(i => i.min_level != null && Number(i.quantity) < Number(i.min_level)).length
  const unitNames = [...new Set(stockItems.map(i => i.unit?.unit_name).filter(Boolean))]

  const handleImageSelect = (file) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }
  const handleImageClear = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setErrorMsg("")
    setImageFile(null)
    setImagePreview(stockImageUrl(item))
    setForm({ item_name: item.item_name, quantity: item.quantity, unit_id: item.unit_id, min_level: item.min_level ?? "", stock_type: item.stock_type || "both" })
  }

  const openAdd = () => {
    setForm({ item_name: "", quantity: "", unit_id: units[0]?.unit_id || "", min_level: "", stock_type: "both" })
    setImageFile(null)
    setImagePreview(null)
    setErrorMsg("")
    setAddOpen(true)
  }

  const handleAdd = async () => {
    if (!form.item_name || !form.quantity || !form.unit_id || !form.min_level) {
      setErrorMsg("All fields are required.")
      return
    }
    setSaving(true)
    setErrorMsg("")
    try {
      const created = await createStock({
        item_name: form.item_name,
        quantity: parseFloat(form.quantity),
        unit_id: parseInt(form.unit_id),
        min_level: parseFloat(form.min_level),
        stock_type: form.stock_type,
      })
      if (imageFile && created?.stock_id) {
        await uploadStockImage(created.stock_id, imageFile)
      }
      setAddOpen(false)
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to add stock item.")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    setSaving(true)
    setErrorMsg("")
    try {
      await updateStock(editItem.stock_id, {
        item_name: form.item_name,
        quantity: parseFloat(form.quantity),
        unit_id: parseInt(form.unit_id),
        min_level: parseFloat(form.min_level),
        stock_type: form.stock_type,
      })
      if (imageFile) {
        await uploadStockImage(editItem.stock_id, imageFile)
      }
      setEditItem(null)
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to update stock item.")
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
    const item = stockItems.find(x => x.stock_id === id)
    setDeleteTarget(item || { stock_id: id })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError("")
    try {
      await deleteStock(deleteTarget.stock_id)
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(deleteErrorMessage(err, t))
    } finally {
      setDeleting(false)
    }
  }

  const handleAddQty = async () => {
    if (!addQty) return
    setSaving(true)
    try {
      await increaseStock(addQtyItem.stock_id, parseFloat(addQty))
      setAddQtyItem(null)
      setAddQty("")
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to add quantity.")
    } finally {
      setSaving(false)
    }
  }

  const handleAddUnit = async () => {
    if (!newUnitName) return
    setSaving(true)
    try {
      await createUnit({ unit_name: newUnitName })
      setAddUnitOpen(false)
      setNewUnitName("")
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to add unit.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <SimpleHeader title="Stock Management"
        subtitle="Manage inventory and track stock levels"
        action={<Button onClick={openAdd} className="gap-2"><Plus size={15} /> Add New Stock Item</Button>} />

      <StockStats stockItems={stockItems} lowStockCount={lowStockCount} unitNames={unitNames} />

      <StockTable
        items={filtered} isLoading={isLoading}
        search={search} setSearch={setSearch}
        typeFilter={typeFilter} setTypeFilter={setTypeFilter}
        catFilter={catFilter} setCatFilter={setCatFilter} unitNames={unitNames}
        onAddUnit={() => setAddUnitOpen(true)}
        onAddQty={setAddQtyItem} onView={setViewItem} onEdit={openEdit} onDelete={requestDelete}
      />

      <StockFormDialog
        open={addOpen} onClose={() => setAddOpen(false)}
        title="Add New Stock Item" description="Add a new item to your inventory"
        form={form} setForm={setForm} units={units}
        imagePreview={imagePreview} onImageSelect={handleImageSelect} onImageClear={handleImageClear}
        errorMsg={errorMsg} saving={saving} onSubmit={handleAdd} submitLabel="Add Stock Item"
      />

      <StockFormDialog
        open={!!editItem} onClose={() => setEditItem(null)}
        title="Edit Stock Item" description="Update stock item information"
        form={form} setForm={setForm} units={units}
        imagePreview={imagePreview} onImageSelect={handleImageSelect} onImageClear={handleImageClear}
        errorMsg={errorMsg} saving={saving} onSubmit={handleUpdate} submitLabel="Update Stock Item"
      />

      <StockViewDialog item={viewItem} onClose={() => setViewItem(null)} />

      <AddQtyDialog item={addQtyItem} addQty={addQty} setAddQty={setAddQty}
        errorMsg={errorMsg} saving={saving} onConfirm={handleAddQty} onClose={() => setAddQtyItem(null)} />

      <AddUnitDialog open={addUnitOpen} newUnitName={newUnitName} setNewUnitName={setNewUnitName}
        errorMsg={errorMsg} saving={saving} onConfirm={handleAddUnit} onClose={() => setAddUnitOpen(false)} />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        busy={deleting}
        danger
        title="Delete this stock item?"
        message={`This will permanently delete "${deleteTarget?.item_name}". This can't be undone.`}
        confirmLabel="Delete"
        errorMsg={deleteError}
      />
    </div>
  )
}
