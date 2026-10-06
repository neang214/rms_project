import { useRef, useState } from "react"
import { ImagePlus, X, Pencil, Trash2 } from "lucide-react"
import { cn, imageUrl, menuItemName, deleteErrorMessage } from "@/lib/utils"
import { useLang } from "@/i18n/LanguageContext"
import {
  Button, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui"

const FALLBACK_IMG = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop"

export function ImagePicker({ preview, onSelect, onClear }) {
  const inputRef = useRef(null)
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onSelect(file)
        }}
      />
      {preview ? (
        <div className="relative h-40 rounded-xl overflow-hidden border border-[var(--color-border)] group">
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
          <button type="button" onClick={onClear}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors">
            <X size={14} />
          </button>
          <button type="button" onClick={() => inputRef.current?.click()}
            className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-lg">Change photo</span>
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="w-full h-40 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] flex flex-col items-center justify-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)]/40 transition-all">
          <ImagePlus size={24} />
          <span className="text-xs font-medium">Click to upload a photo</span>
          <span className="text-[10px] text-[var(--color-muted)]">PNG or JPG</span>
        </button>
      )}
    </div>
  )
}

export function FormFields({ form, setForm, categories, isEdit, imagePreview, onImageSelect, onImageClear }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Photo</Label>
        <ImagePicker preview={imagePreview} onSelect={onImageSelect} onClear={onImageClear} />
      </div>
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} placeholder="Item name" />
      </div>
      <div className="space-y-1.5">
        <Label>Khmer Name <span className="text-[var(--color-muted)] font-normal">(optional)</span></Label>
        <Input value={form.item_name_km || ""} onChange={e => setForm(f => ({ ...f, item_name_km: e.target.value }))} placeholder="ឈ្មោះជាភាសាខ្មែរ" />
        <p className="text-[11px] text-[var(--color-muted)]">Shown automatically when a guest or staff member switches to Khmer. Falls back to the English name if left blank.</p>
      </div>
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={form.category_id ? String(form.category_id) : ""} onValueChange={v => setForm(f => ({ ...f, category_id: parseInt(v) }))} disabled={isEdit}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c.category_id} value={String(c.category_id)}>{c.category_name}</SelectItem>)}
          </SelectContent>
        </Select>
        {isEdit && <p className="text-xs text-[var(--color-muted)]">Category can't be changed after creation</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Price</Label>
        <Input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="$ 0.00" type="number" step="0.01" />
      </div>
    </div>
  )
}

export function MenuCategoryBar({ categories, activeCat, onSelect }) {
  return (
    <Select value={activeCat === "All" ? "All" : String(activeCat)} onValueChange={v => onSelect(v === "All" ? "All" : parseInt(v))}>
      <SelectTrigger className="w-48"><SelectValue placeholder="All categories" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="All">All categories</SelectItem>
        {categories.map(cat => (
          <SelectItem key={cat.category_id} value={String(cat.category_id)}>{cat.category_name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function MenuGrid({ items, isLoading, categoryName, onEdit, onDelete }) {
  const { lang } = useLang()
  if (isLoading) return <div className="text-center py-16 text-[var(--color-muted)] text-sm">Loading menu...</div>
  if (items.length === 0) return <div className="text-center py-16 text-[var(--color-muted)] text-sm">No menu items found.</div>
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map(item => (
        <div key={item.menu_item_id}
          className={cn("bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-md transition-all duration-200 group relative", !item.available && "opacity-60")}>
          <div className="relative h-36 overflow-hidden bg-[var(--color-border)]">
            <img src={imageUrl(item.image_url, FALLBACK_IMG)} alt={menuItemName(item, lang)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            {!item.available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-[var(--color-danger)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Sold Out</span>
              </div>
            )}
          </div>
          <div className="p-3">
            <div className="font-medium text-[var(--color-text)] text-sm leading-snug line-clamp-2">{menuItemName(item, lang)}</div>
            <div className="text-xs text-[var(--color-muted)] mt-1 line-clamp-1">{categoryName(item.category_id)}</div>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-base font-bold text-[var(--color-text)]">$ {Number(item.price).toFixed(2)}</span>
              <div className="flex items-center gap-0.5">
                <button onClick={() => onEdit(item)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-primary-muted)] text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => onDelete(item)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-danger-muted)] text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function MenuFormDialog({
  open, onClose, isEdit, item, title, description,
  form, setForm, categories, imagePreview, onImageSelect, onImageClear,
  errorMsg, saving, onSubmit, submitLabel, onToggleAvailable,
}) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <FormFields
            form={form} setForm={setForm} categories={categories} isEdit={isEdit}
            imagePreview={imagePreview} onImageSelect={onImageSelect} onImageClear={onImageClear}
          />
        </div>
        {errorMsg && <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/25 rounded-xl px-3 py-2 mt-3">{errorMsg}</div>}
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          {isEdit && item && (
            <Button variant="destructive" size="sm" onClick={onToggleAvailable} disabled={saving}>
              {item.available ? "Sold Out" : "Mark Available"}
            </Button>
          )}
          <Button onClick={onSubmit} disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AddCategoryDialog({ open, onClose, newCatName, setNewCatName, newCatType, setNewCatType, errorMsg, saving, onSubmit, categories = [], onDeleteCategory }) {
  const { t } = useLang()
  
  
  
  
  
  
  const [confirmingId, setConfirmingId] = useState(null)
  const [rowBusy, setRowBusy] = useState(false)
  const [rowError, setRowError] = useState("")

  const startConfirm = (cat) => { setConfirmingId(cat.category_id); setRowError("") }
  const cancelConfirm = () => { setConfirmingId(null); setRowError("") }
  const doDelete = async (cat) => {
    setRowBusy(true)
    setRowError("")
    try {
      await onDeleteCategory(cat)
      setConfirmingId(null)
    } catch (err) {
      setRowError(deleteErrorMessage(err, t))
    } finally {
      setRowBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Categories</DialogTitle>
          <DialogDescription>Categories of type "drink" route to the barista queue; "food" routes to the kitchen.</DialogDescription>
        </DialogHeader>

        {categories.length > 0 && (
          <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)] mt-1">
            {categories.map(cat => (
              confirmingId === cat.category_id ? (
                <div key={cat.category_id} className="px-3 py-2.5 bg-[var(--color-danger-muted)] space-y-2">
                  <div className="text-xs text-[var(--color-danger)]">Delete "{cat.category_name}"? This can't be undone.</div>
                  {rowError && <div className="text-xs text-[var(--color-danger)] bg-[var(--color-danger-muted)] rounded-lg px-2 py-1.5">{rowError}</div>}
                  <div className="flex gap-2">
                    <button onClick={cancelConfirm} disabled={rowBusy}
                      className="flex-1 text-xs font-medium py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] disabled:opacity-60">
                      Cancel
                    </button>
                    <button onClick={() => doDelete(cat)} disabled={rowBusy}
                      className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-[var(--color-danger)] text-white disabled:opacity-60">
                      {rowBusy ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ) : (
                <div key={cat.category_id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-[var(--color-text)]">{cat.category_name}</span>
                  <button onClick={() => startConfirm(cat)}
                    className="p-1 rounded-lg hover:bg-[var(--color-danger-muted)] text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            ))}
          </div>
        )}

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Category Name</Label>
            <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Soup" />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={newCatType} onValueChange={setNewCatType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Food (Kitchen)</SelectItem>
                <SelectItem value="drink">Drink (Barista)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {errorMsg && <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/25 rounded-xl px-3 py-2 mt-3">{errorMsg}</div>}
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={onSubmit} disabled={saving}>{saving ? "Saving..." : "Add Category"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
