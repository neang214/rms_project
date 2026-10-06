import { Search, Pencil, Trash2, Users, Shield, ChefHat, Coffee, DollarSign } from "lucide-react"
import {
  Button, Badge, Card, Input, Label,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui"

export const roleConfig = {
  admin:   { label: "Admin",   color: "purple",  icon: Shield },
  kitchen: { label: "Kitchen", color: "orange",  icon: ChefHat },
  barista: { label: "Barista", color: "warning", icon: Coffee },
  cashier: { label: "Cashier", color: "success", icon: DollarSign },
}

const avatarColors = ["bg-[var(--color-primary-muted)] text-[var(--color-primary)]", "bg-[var(--color-info-muted)] text-[var(--color-info)]", "bg-[var(--color-flame-muted)] text-[var(--color-flame)]", "bg-[var(--color-plum-muted)] text-[var(--color-plum)]"]

export function UserStats({ users, counts }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total User", value: users.length, sub: "Staff members", icon: Users, color: "text-[var(--color-primary)]" },
        { label: "Admin", value: counts.admin, sub: "Administrators", icon: Shield, color: "text-[var(--color-plum)]" },
        { label: "Kitchen Staff", value: counts.kitchen, sub: "Kitchen team", icon: ChefHat, color: "text-[var(--color-flame)]" },
        { label: "Service Staff", value: counts.barista + counts.cashier, sub: "Baristas & Cashiers", icon: Coffee, color: "text-[var(--color-warning)]" },
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

export function UsersTable({ users, isLoading, search, setSearch, roleFilter, setRoleFilter, currentUser, onEdit, onDelete }) {
  return (
    <Card>
      <div className="p-5 pb-4 border-b border-[var(--color-border)]">
        <div className="font-semibold text-[var(--color-primary)]">Staff Members</div>
        <div className="text-xs text-[var(--color-muted)] mt-0.5">View and manage all user accounts</div>
      </div>

      <div className="p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-9" placeholder="Search staff..." />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All Role">All Role</SelectItem>
            {Object.entries(roleConfig).map(([key, cfg]) => <SelectItem key={key} value={key}>{cfg.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="px-2 pb-2">
        {isLoading ? (
          <div className="text-center py-10 text-sm text-[var(--color-muted)]">Loading users...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u, idx) => {
                const cfg = roleConfig[u.role] || {}
                const RoleIcon = cfg.icon
                const isSelf = currentUser?.user_id === u.user_id
                return (
                  <TableRow key={u.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${avatarColors[idx % avatarColors.length]}`}>
                          {u.username?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--color-text)] text-sm">{u.username}</div>
                          {isSelf && <div className="text-xs text-[var(--color-muted)]">( you )</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--color-muted)] text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={cfg.color} className="gap-1.5">
                        {RoleIcon && <RoleIcon size={11} />} {cfg.label || u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(u)} className="p-1.5 rounded-lg hover:bg-[var(--color-accent-muted)] text-[var(--color-muted)] hover:text-[var(--color-warning)] transition-colors"><Pencil size={14} /></button>
                        {!isSelf && <button onClick={() => onDelete(u.user_id)} className="p-1.5 rounded-lg hover:bg-[var(--color-danger-muted)] text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"><Trash2 size={14} /></button>}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-[var(--color-muted)] py-8">No users found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  )
}

export function UserFormDialog({ open, onClose, isEdit, title, description, form, setForm, errorMsg, saving, onSubmit, submitLabel }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder={isEdit ? undefined : "johndoe"} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder={isEdit ? undefined : "john@rms.com"} />
          </div>
          <div className="space-y-1.5">
            <Label>{isEdit ? "New Password (optional)" : "Password"}</Label>
            <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={isEdit ? "Leave blank to keep current" : "••••••••"} />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
              <SelectTrigger><SelectValue placeholder={isEdit ? undefined : "Select role..."} /></SelectTrigger>
              <SelectContent>
                {Object.entries(roleConfig).map(([key, cfg]) => <SelectItem key={key} value={key}>{cfg.label}</SelectItem>)}
              </SelectContent>
            </Select>
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
