import {
  Button, Badge, Card,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui"
import { Eye, Pencil, Trash2 } from "lucide-react"

function itemTotal(order) {
  if (!order?.order_items) return 0
  return order.order_items.reduce((sum, oi) => sum + Number(oi.unit_price) * oi.quantity, 0)
}

export function TablesList({ tables, isLoading, onView, onEdit, onDelete }) {
  return (
    <Card>
      <div className="p-5 pb-4 border-b border-[var(--color-border)]">
        <div className="font-semibold text-[var(--color-primary)]">Restaurant Tables</div>
        <div className="text-xs text-[var(--color-muted)] mt-0.5">Manage dining tables and view their orders</div>
      </div>
      <div className="p-2">
        {isLoading ? (
          <div className="text-center py-10 text-sm text-[var(--color-muted)]">Loading tables...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead>Table #</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map(t => (
                <TableRow key={t.table_id}>
                  <TableCell className="font-semibold">{t.table_number}</TableCell>
                  <TableCell className="text-[var(--color-muted)]">{t.capacity} guests</TableCell>
                  <TableCell>
                    <Badge variant={!t.is_available ? "default" : "outline"}>{t.is_available ? "Available" : "Occupied"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onView(t)} className="p-1.5 rounded-lg hover:bg-[var(--color-info-muted)] text-[var(--color-muted)] hover:text-[var(--color-info)] transition-colors"><Eye size={14} /></button>
                      <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg hover:bg-[var(--color-accent-muted)] text-[var(--color-muted)] hover:text-[var(--color-warning)] transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => onDelete(t.table_id)} className="p-1.5 rounded-lg hover:bg-[var(--color-danger-muted)] text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tables.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-[var(--color-muted)] py-8">No tables found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  )
}

export function TableFormDialog({ open, onClose, title, description, form, setForm, showStatus, errorMsg, saving, onSubmit, submitLabel }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Table Number</Label>
            <Input value={form.table_number} onChange={e => setForm(f => ({ ...f, table_number: e.target.value }))} placeholder="e.g. T-012" />
          </div>
          <div className="space-y-1.5">
            <Label>Capacity{showStatus ? "" : " (guests)"}</Label>
            <Input value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} type="number" placeholder="4" />
          </div>
          {showStatus && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.is_available ? "Available" : "Occupied"} onValueChange={v => setForm(f => ({ ...f, is_available: v === "Available" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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

export function TableViewDialog({ table, order, loading, onClose }) {
  return (
    <Dialog open={!!table} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        {table && (
          <>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Table Orders - {table.table_number}</h2>
                <p className="text-sm text-[var(--color-muted)]">View the active order for this table</p>
              </div>
              <div className="border border-[var(--color-primary)]/40 rounded-lg px-2 py-1">
                <span className="font-display font-bold text-xs text-[var(--color-primary)]">RMS</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 my-3">
              {[
                { label: "Status", value: table.is_available ? "Available" : "Occupied" },
                { label: "Order Total", value: `$${itemTotal(order).toFixed(2)}`, highlight: true },
                { label: "Capacity", value: `${table.capacity} guests`, highlight: true },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="rounded-xl border border-[var(--color-border)] p-3 text-center">
                  <div className="text-xs text-[var(--color-muted)] mb-1">{label}</div>
                  <div className={`text-lg font-bold ${highlight ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>{value}</div>
                </div>
              ))}
            </div>

            <div className="font-semibold text-[var(--color-text)] mb-3">Active Order</div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center text-[var(--color-muted)] text-sm py-8">Loading...</div>
              ) : !order ? (
                <div className="text-center text-[var(--color-muted)] text-sm py-8">No active order for this table</div>
              ) : (
                <div className="border border-[var(--color-border)] rounded-xl p-4">
                  <div className="font-medium text-[var(--color-text)] text-sm">Order #{order.order_id}</div>
                  <div className="text-xs text-[var(--color-muted)] mb-3">{new Date(order.order_date).toLocaleString()} · {order.status}</div>
                  {order.order_items?.map((oi) => (
                    <div key={oi.order_item_id} className="flex gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--color-text)] truncate">{oi.menu_item?.item_name}</div>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-[var(--color-text)]">${Number(oi.unit_price).toFixed(2)}</span>
                          <span className="text-sm text-[var(--color-muted)]">Qty: {oi.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-[var(--color-border)] pt-3">
                    <div className="flex justify-between text-sm font-medium text-[var(--color-text)]">
                      <span>Total</span>
                      <span>${itemTotal(order).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Button variant="dark" className="w-full mt-3" onClick={onClose}>Close</Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

