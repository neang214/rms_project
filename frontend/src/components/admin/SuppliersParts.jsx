import { Pencil, Trash2, Phone, Mail } from "lucide-react"
import { Button, Card, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui"

const colors = ["bg-[var(--color-primary-muted)] text-[var(--color-primary)]", "bg-[var(--color-info-muted)] text-[var(--color-info)]", "bg-[var(--color-flame-muted)] text-[var(--color-flame)]", "bg-[var(--color-plum-muted)] text-[var(--color-plum)]"]

export function SupplierGrid({ suppliers, isLoading, onEdit, onDelete }) {
  if (isLoading) return <div className="text-center py-16 text-[var(--color-muted)] text-sm">Loading suppliers...</div>
  if (suppliers.length === 0) return <div className="text-center py-16 text-[var(--color-muted)] text-sm">No suppliers found.</div>
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {suppliers.map((sup, idx) => (
        <Card key={sup.supplier_id} className="hover:shadow-md transition-shadow">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold ${colors[idx % colors.length]}`}>
                  {sup.supplier_name?.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-[var(--color-text)] text-sm">{sup.supplier_name}</div>
                  <div className="text-xs text-[var(--color-muted)]">Supplier #{sup.supplier_id}</div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <Phone size={12} className="text-[var(--color-primary)]" /> {sup.phone || "—"}
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <Mail size={12} className="text-[var(--color-primary)]" /> {sup.email || "—"}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => onEdit(sup)} className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-border)] rounded-xl py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all">
                <Pencil size={13} /> Edit
              </button>
              <button onClick={() => onDelete(sup.supplier_id)} className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-danger)]/25 text-[var(--color-danger)] rounded-xl py-2 text-sm font-medium hover:bg-[var(--color-danger-muted)] transition-colors">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function SupplierFormDialog({ open, onClose, isEdit, title, description, form, setForm, errorMsg, saving, onSubmit, submitLabel }) {
  const ph = (text) => (isEdit ? undefined : text)
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))} placeholder={ph("Enter supplier name")} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder={ph("Enter phone")} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder={ph("Enter email")} />
          </div>
        </div>
        {errorMsg && <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/25 rounded-xl px-3 py-2 mt-3">{errorMsg}</div>}
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={onSubmit} disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
