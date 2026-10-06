import { useState, useEffect } from "react"
import { Search, Plus, Tag } from "lucide-react"
import { Button, Input } from "@/components/ui"
import { useMenuItemStore } from "../../context/menuItemContext"
import { useMenuCategoryStore } from "../../context/menuCategoryContext"
import api from "../../services/axios"
import { usePageTitle } from "../../hooks/usePageTitle"
import {
  MenuCategoryBar, MenuGrid, MenuFormDialog, AddCategoryDialog,
} from "@/components/admin/MenuParts"
import { ConfirmModal } from "@/components/shared"
import { useLang } from "@/i18n/LanguageContext"
import { deleteErrorMessage } from "@/lib/utils"

export default function Menu() {
  usePageTitle("Menu")
  const { t } = useLang()
  const { items, fetchItems, createItem, updateItem, toggleItem, deleteItem, isLoading } = useMenuItemStore()
  const { categories, fetchCategories, createCategory, deleteCategory } = useMenuCategoryStore()

  const [activeCat, setActiveCat] = useState("All")
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [addCatOpen, setAddCatOpen] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatType, setNewCatType] = useState("food")
  const [form, setForm] = useState({ item_name: "", item_name_km: "", category_id: "", price: "" })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  // Delete confirmation state — separate for items vs categories since
  // both can be deleted from this page.
  const [deleteItemTarget, setDeleteItemTarget] = useState(null)
  const [deletingItem, setDeletingItem] = useState(false)
  const [deleteItemError, setDeleteItemError] = useState("")

  useEffect(() => {
    fetchItems()
    fetchCategories()
  }, [])

  const filtered = items.filter(i => {
    const matchesCat = activeCat === "All" || i.category_id === activeCat
    const matchesSearch = i.item_name?.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const categoryName = (id) => categories.find(c => c.category_id === id)?.category_name || "—"

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
    setImagePreview(item.image_url || null)
    setForm({ item_name: item.item_name, item_name_km: item.item_name_km || "", category_id: item.category_id, price: item.price })
  }

  const openAdd = () => {
    setForm({ item_name: "", item_name_km: "", category_id: categories[0]?.category_id || "", price: "" })
    setImageFile(null)
    setImagePreview(null)
    setErrorMsg("")
    setAddOpen(true)
  }

  // Uploads the image file to the menu item's image endpoint.
  // Backend needs: POST /menu-items/:id/image (multer single("image")) -> { image_url }
  const uploadItemImage = async (id, file) => {
    const formData = new FormData()
    formData.append("image", file)
    await api.post(`/menu-items/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  }

  const handleAdd = async () => {
    if (!form.item_name || !form.category_id || !form.price) {
      setErrorMsg("Name, category, and price are required.")
      return
    }
    setSaving(true)
    setErrorMsg("")
    try {
      const created = await createItem({
        item_name: form.item_name,
        item_name_km: form.item_name_km || null,
        category_id: parseInt(form.category_id),
        price: parseFloat(form.price),
        available: true,
      })
      if (imageFile && created?.menu_item_id) {
        await uploadItemImage(created.menu_item_id, imageFile)
        await fetchItems()
      }
      setAddOpen(false)
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to add item.")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!form.item_name || !form.price) {
      setErrorMsg("Name and price are required.")
      return
    }
    setSaving(true)
    setErrorMsg("")
    try {
      await updateItem(editItem.menu_item_id, {
        item_name: form.item_name,
        item_name_km: form.item_name_km || null,
        price: parseFloat(form.price),
      })
      if (imageFile) {
        await uploadItemImage(editItem.menu_item_id, imageFile)
        await fetchItems()
      }
      setEditItem(null)
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to update item.")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleAvailable = async () => {
    setSaving(true)
    try {
      await toggleItem(editItem.menu_item_id, !editItem.available)
      setEditItem(null)
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to update status.")
    } finally {
      setSaving(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCatName) return
    setSaving(true)
    try {
      await createCategory({ category_name: newCatName, type: newCatType })
      setAddCatOpen(false)
      setNewCatName("")
      setNewCatType("food")
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to add category.")
    } finally {
      setSaving(false)
    }
  }

  const requestDeleteItem = (item) => {
    setDeleteItemError("")
    setDeleteItemTarget(item)
  }
  const handleDeleteItem = async () => {
    if (!deleteItemTarget) return
    setDeletingItem(true)
    setDeleteItemError("")
    try {
      await deleteItem(deleteItemTarget.menu_item_id)
      setDeleteItemTarget(null)
    } catch (err) {
      setDeleteItemError(deleteErrorMessage(err, t))
    } finally {
      setDeletingItem(false)
    }
  }

  // Called directly by AddCategoryDialog, which owns its own inline
  // confirm/error UI now (see AddCategoryDialog in MenuParts.jsx) — this
  // just performs the delete and lets errors propagate up to it.
  const handleDeleteCategory = async (cat) => {
    await deleteCategory(cat.category_id)
    if (activeCat === cat.category_id) setActiveCat("All")
  }

  return (
    <div className="space-y-5">
      {}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-9" placeholder="Search menu..." />
        </div>
        <div className="flex gap-2">
          <Button onClick={openAdd} size="sm" className="gap-1.5"><Plus size={14} /> Add Menu</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAddCatOpen(true)}><Tag size={14} /> Category</Button>
        </div>
      </div>

      <MenuCategoryBar categories={categories} activeCat={activeCat} onSelect={setActiveCat} />

      <MenuGrid items={filtered} isLoading={isLoading} categoryName={categoryName} onEdit={openEdit} onDelete={requestDeleteItem} />

      <MenuFormDialog
        open={addOpen} onClose={() => setAddOpen(false)} isEdit={false} item={null}
        title="Add Menu Item" description="Add a new item to your menu"
        form={form} setForm={setForm} categories={categories}
        imagePreview={imagePreview} onImageSelect={handleImageSelect} onImageClear={handleImageClear}
        errorMsg={errorMsg} saving={saving} onSubmit={handleAdd} submitLabel="Add menu item"
      />

      <MenuFormDialog
        open={!!editItem} onClose={() => setEditItem(null)} isEdit item={editItem}
        title="Edit Menu Item" description="Update menu item information"
        form={form} setForm={setForm} categories={categories}
        imagePreview={imagePreview} onImageSelect={handleImageSelect} onImageClear={handleImageClear}
        errorMsg={errorMsg} saving={saving} onSubmit={handleUpdate} submitLabel="Update Menu"
        onToggleAvailable={handleToggleAvailable}
      />

      <AddCategoryDialog
        open={addCatOpen} onClose={() => setAddCatOpen(false)}
        newCatName={newCatName} setNewCatName={setNewCatName}
        newCatType={newCatType} setNewCatType={setNewCatType}
        errorMsg={errorMsg} saving={saving} onSubmit={handleAddCategory}
        categories={categories} onDeleteCategory={handleDeleteCategory}
      />

      <ConfirmModal
        open={!!deleteItemTarget}
        onClose={() => setDeleteItemTarget(null)}
        onConfirm={handleDeleteItem}
        busy={deletingItem}
        danger
        title="Delete this menu item?"
        message={`This will permanently delete "${deleteItemTarget?.item_name}". This can't be undone.`}
        confirmLabel="Delete"
        errorMsg={deleteItemError}
      />
    </div>
  )
}
