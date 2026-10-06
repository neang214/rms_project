import { useRef } from "react"
import { Search, Plus, Eye, Pencil, Trash2, Package, AlertTriangle, Layers, DollarSign, ImagePlus, X, ChefHat, Coffee, Store } from "lucide-react"
import {
  Button, Badge, Input, Label, Card,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui"

export function stockStatus(item) {
  if (item.min_level == null) return "InStock"
  return Number(item.quantity) < Number(item.min_level) ? "LowStock" : "InStock"
}

export const STOCK_TYPES = {
  kitchen: { label: "Kitchen", icon: ChefHat, color: "bg-[var(--color-flame-muted)] text-[var(--color-flame)]" },
  barista: { label: "Barista", icon: Coffee,  color: "bg-[var(--color-accent-muted)] text-[var(--color-warning)]" },
  both:    { label: "Both",    icon: Store,   color: "bg-[var(--color-primary-muted)] text-[var(--color-primary)]" },
}

export function StockTypeBadge({ type }) {
  const cfg = STOCK_TYPES[type] || STOCK_TYPES.both
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  )
}

const API_ORIGIN =
  (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/api\/?$/, "")
export function stockImageUrl(item) {
  if (!item?.image_url) return null
  if (/^https?:\/\//.test(item.image_url)) return item.image_url
  return `${API_ORIGIN}${item.image_url}`
}

/* Small square placeholder used when a stock item has no photo. */
function NoPhoto({ size = 64 }) {
  return (
    <div className="rounded-lg bg-[var(--color-primary-muted)] flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}>
      <Package size={size / 2.5} className="text-[var(--color-primary)]/50" />
    </div>
  )
}

export function StockImagePicker({ preview, onSelect, onClear }) {
  const inputRef = useRef(null)
  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onSelect(f) }} />
      {preview ? (
        <div className="relative h-32 rounded-xl overflow-hidden border border-[var(--color-border)] group">
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
          className="w-full h-32 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] flex flex-col items-center justify-center gap-1.5 text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)]/40 transition-all">
          <ImagePlus size={22} />
          <span className="text-xs font-medium">Click to upload a photo</span>
          <span className="text-[10px] text-[var(--color-muted)]">PNG or JPG</span>
        </button>
      )}
    </div>
  )
}

export function StockStats({ stockItems, lowStockCount, unitNames }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Item", value: stockItems.length, sub: "In inventory", icon: Package, color: "text-[var(--color-primary)]" },
        { label: "Low Stock", value: lowStockCount, sub: "Need restocking", icon: AlertTriangle, color: "text-[var(--color-warning)]" },
        { label: "Units", value: unitNames.length, sub: "Unit types", icon: Layers, color: "text-[var(--color-info)]" },
        { label: "Total Items Tracked", value: stockItems.length, sub: "Across all units", icon: DollarSign, color: "text-[var(--color-plum)]" },
      ].map(({ label, value, sub, icon: Icon, color }) => (
        <Card key={label} className="p-5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">{label}</span>
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-muted)] flex items-center justify-center">
              <Icon size={16} className={color} />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--color-text)] mb-1">{value}</div>
          <div className="text-xs text-[var(--color-muted)]">{sub}</div>
        </Card>
      ))}
    </div>
  )
}

export function StockFormFields({ form, setForm, units, imagePreview, onImageSelect, onImageClear }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Photo</Label>
        <StockImagePicker preview={imagePreview} onSelect={onImageSelect} onClear={onImageClear} />
      </div>
      <div className="space-y-1.5">
        <Label>Item Name</Label>
        <Input value={form.item_name} onChange={e => setForm(p => ({ ...p, item_name: e.target.value }))} />
      </div>
      <div className="space-y-1.5">
        <Label>Quantity</Label>
        <Input type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
      </div>
      <div className="space-y-1.5">
        <Label>Unit</Label>
        <Select value={form.unit_id ? String(form.unit_id) : ""} onValueChange={v => setForm(p => ({ ...p, unit_id: parseInt(v) }))}>
          <SelectTrigger><SelectValue placeholder="Select unit..." /></SelectTrigger>
          <SelectContent>{units.map(u => <SelectItem key={u.unit_id} value={String(u.unit_id)}>{u.unit_name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Min Level</Label>
        <Input type="number" value={form.min_level} onChange={e => setForm(p => ({ ...p, min_level: e.target.value }))} />
      </div>
      <div className="space-y-1.5">
        <Label>For</Label>
        <Select value={form.stock_type || "both"} onValueChange={v => setForm(p => ({ ...p, stock_type: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="kitchen">Kitchen</SelectItem>
            <SelectItem value="barista">Barista</SelectItem>
            <SelectItem value="both">Both (shared)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export function StockTable({
  items, isLoading, search, setSearch, catFilter, setCatFilter, typeFilter, setTypeFilter, unitNames,
  onAddUnit, onAddQty, onView, onEdit, onDelete,
}) {
  return (
    <Card>
      <div className="p-5 pb-4 border-b border-[var(--color-border)] flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-semibold text-[var(--color-primary)]">Inventory List</div>
          <div className="text-xs text-[var(--color-muted)] mt-0.5">Manage all stock items</div>
        </div>
        <Button variant="dark" size="sm" onClick={onAddUnit} className="gap-1.5"><Plus size={13} /> Add New Unit</Button>
      </div>
      <div className="p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-9" placeholder="Search Stock item..." />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stations</SelectItem>
            <SelectItem value="kitchen">Kitchen</SelectItem>
            <SelectItem value="barista">Barista</SelectItem>
            <SelectItem value="both">Both (shared)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All categories">All units</SelectItem>
            {unitNames.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="px-2 pb-2">
        {isLoading ? (
          <div className="text-center py-10 text-sm text-[var(--color-muted)]">Loading stock...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead>Item Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>For</TableHead>
                <TableHead>Min Level</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.stock_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2.5">
                      {stockImageUrl(item)
                        ? <img src={stockImageUrl(item)} alt={item.item_name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                        : <NoPhoto />}
                      <span>{item.item_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{Number(item.quantity)} {item.unit?.unit_name}</TableCell>
                  <TableCell>
                    <Badge variant={stockStatus(item) === "InStock" ? "success" : "danger"}>{stockStatus(item) === "InStock" ? "InStock" : "Low Stock"}</Badge>
                  </TableCell>
                  <TableCell><StockTypeBadge type={item.stock_type} /></TableCell>
                  <TableCell className="text-[var(--color-muted)]">{item.min_level != null ? `${Number(item.min_level)} ${item.unit?.unit_name}` : "—"}</TableCell>
                  <TableCell className="text-[var(--color-muted)]">{item.unit?.unit_name}</TableCell>
                  <TableCell className="text-[var(--color-muted)]">{item.last_updated ? new Date(item.last_updated).toLocaleDateString("en-GB") : "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onAddQty(item)} className="p-1.5 rounded-lg hover:bg-[var(--color-primary-muted)] text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors" title="Add quantity"><Plus size={14} /></button>
                      <button onClick={() => onView(item)} className="p-1.5 rounded-lg hover:bg-[var(--color-info-muted)] text-[var(--color-muted)] hover:text-[var(--color-info)] transition-colors"><Eye size={14} /></button>
                      <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-[var(--color-accent-muted)] text-[var(--color-muted)] hover:text-[var(--color-warning)] transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => onDelete(item.stock_id)} className="p-1.5 rounded-lg hover:bg-[var(--color-danger-muted)] text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-[var(--color-muted)] py-8">No stock items found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  )
}

export function StockFormDialog({ open, onClose, title, description, form, setForm, units, imagePreview, onImageSelect, onImageClear, errorMsg, saving, onSubmit, submitLabel }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-2"><StockFormFields form={form} setForm={setForm} units={units}
          imagePreview={imagePreview} onImageSelect={onImageSelect} onImageClear={onImageClear} /></div>
        {errorMsg && <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/25 rounded-xl px-3 py-2 mt-3">{errorMsg}</div>}
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={onSubmit} disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function StockViewDialog({ item, onClose }) {
  return (
    <Dialog open={!!item} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        {item && (
          <>
            <div className="flex items-center gap-3 mb-4">
              {stockImageUrl(item)
                ? <img src={stockImageUrl(item)} alt={item.item_name} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                : <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-muted)] flex items-center justify-center">
                    <Package size={28} className="text-[var(--color-primary)]" />
                  </div>}
              <div>
                <div className="font-semibold text-[var(--color-text)]">{item.item_name}</div>
                <div className="text-xs text-[var(--color-muted)]">Stock item</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Quantity", value: `${Number(item.quantity)} ${item.unit?.unit_name}`, color: "bg-[var(--color-primary-muted)]" },
                { label: "Min level", value: item.min_level != null ? `${Number(item.min_level)} ${item.unit?.unit_name}` : "—", color: "bg-[var(--color-accent-muted)]" },
                { label: "Unit", value: item.unit?.unit_name, color: "bg-[var(--color-info-muted)]" },
                { label: "Status", value: stockStatus(item) === "InStock" ? "InStock" : "Low Stock", color: "bg-[var(--color-primary-muted)]" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-xl p-3 ${color}`}>
                  <div className="text-xs text-[var(--color-muted)] mb-1">{label}</div>
                  <div className="font-semibold text-sm text-[var(--color-text)]">{value}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3 bg-[var(--color-primary-muted)] mt-1">
              <div className="text-xs text-[var(--color-muted)] mb-1">Last Updated</div>
              <div className="font-semibold text-sm text-[var(--color-text)]">{item.last_updated ? new Date(item.last_updated).toLocaleString() : "—"}</div>
            </div>
            <Button variant="outline" className="w-full mt-2" onClick={onClose}>Back</Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function AddQtyDialog({ item, addQty, setAddQty, errorMsg, saving, onConfirm, onClose }) {
  return (
    <Dialog open={!!item} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle>Add Quantity</DialogTitle>
              <DialogDescription>Enter quantity to add for {item.item_name} (current: {Number(item.quantity)} {item.unit?.unit_name})</DialogDescription>
            </DialogHeader>
            <Input value={addQty} onChange={e => setAddQty(e.target.value)} type="number" placeholder="Amount to add" className="mt-2" />
            {errorMsg && <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/25 rounded-xl px-3 py-2 mt-3">{errorMsg}</div>}
            <div className="flex gap-2 justify-end mt-3">
              <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
              <Button onClick={onConfirm} disabled={saving}>{saving ? "Saving..." : "OK"}</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function AddUnitDialog({ open, newUnitName, setNewUnitName, errorMsg, saving, onConfirm, onClose }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add New Unit</DialogTitle>
        </DialogHeader>
        <Input value={newUnitName} onChange={e => setNewUnitName(e.target.value)} placeholder="e.g. liter, kg, pcs" className="mt-2" />
        {errorMsg && <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/25 rounded-xl px-3 py-2 mt-3">{errorMsg}</div>}
        <div className="flex gap-2 justify-end mt-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={onConfirm} disabled={saving}>{saving ? "Saving..." : "OK"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
