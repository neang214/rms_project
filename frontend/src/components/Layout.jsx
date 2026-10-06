import { useEffect, useState } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { useTheme } from "next-themes"
import {
  LayoutDashboard, UtensilsCrossed, Package, TableIcon,
  CreditCard, Users, Truck, LogOut, Bell, Moon, Sun,
  Menu as MenuIcon, ChefHat, ShoppingBag, Coffee, Clock, BarChart3, ClipboardList
} from "lucide-react"
import { cn } from "@/lib/utils"
import { authContext } from "../context/authContext"
import { useStaffNotifications, unlockAudioOnFirstInteraction, isAudioUnlocked, unlockAudioNow } from "../hooks/useStaffNotifications"
import { useLang } from "@/i18n/LanguageContext"
import LanguageSwitcher from "@/components/LanguageSwitcher"

const navByRole = {
  admin: {
    main: [
      { to: "/admin", icon: LayoutDashboard, label: "nav.dashboard" },
      { to: "/admin/menu", icon: UtensilsCrossed, label: "nav.menu" },
      { to: "/admin/stock", icon: Package, label: "nav.stockMgmt" },
      { to: "/admin/tables", icon: TableIcon, label: "nav.tables" },
      { to: "/admin/payments", icon: CreditCard, label: "nav.paymentsOnly" },
      { to: "/admin/reports", icon: BarChart3, label: "nav.reports" },
      { to: "/admin/history", icon: Clock, label: "nav.history" },
    ],
    secondary: [
      { to: "/admin/suppliers", icon: Truck, label: "nav.suppliers" },
      { to: "/admin/users", icon: Users, label: "nav.users" },
    ],
  },
  cashier: {
    main: [
      { to: "/cashier/menu", icon: UtensilsCrossed, label: "nav.menu" },
      { to: "/cashier/orders", icon: ShoppingBag, label: "nav.orders" },
      { to: "/cashier/payments", icon: CreditCard, label: "nav.paymentsOnly" },
      { to: "/cashier/reports", icon: BarChart3, label: "nav.reports" },
      { to: "/cashier/history", icon: Clock, label: "nav.history" },
    ],
    secondary: [],
  },
  kitchen: {
    main: [
      { to: "/kitchen/menu", icon: UtensilsCrossed, label: "nav.menu" },
      { to: "/kitchen/orders", icon: ChefHat, label: "nav.kitchenOrder" },
      { to: "/kitchen/stock", icon: Package, label: "nav.stock" },
    ],
    secondary: [],
  },
  barista: {
    main: [
      { to: "/barista/menu", icon: UtensilsCrossed, label: "nav.menu" },
      { to: "/barista/orders", icon: Coffee, label: "nav.drinkOrders" },
      { to: "/barista/stock", icon: Package, label: "nav.stock" },
    ],
    secondary: [],
  },
  server: {
    main: [
      { to: "/server/menu", icon: UtensilsCrossed, label: "nav.menu" },
      { to: "/server/orders", icon: ClipboardList, label: "nav.orders" },
    ],
    secondary: [],
  },
}

const roleInfo = {
  admin: { label: "Administrator", sub: "role.admin", avatarBg: "bg-[var(--color-plum-muted)]", avatarText: "text-[var(--color-plum)]", badge: "bg-[var(--color-plum-muted)] text-[var(--color-plum)]" },
  cashier: { label: "Cashier user", sub: "role.cashier", avatarBg: "bg-[var(--color-primary-muted)]", avatarText: "text-[var(--color-primary)]", badge: "bg-[var(--color-primary-muted)] text-[var(--color-primary)]" },
  kitchen: { label: "Kitchen Staff", sub: "role.kitchen", avatarBg: "bg-[var(--color-flame-muted)]", avatarText: "text-[var(--color-flame)]", badge: "bg-[var(--color-flame-muted)] text-[var(--color-flame)]" },
  barista: { label: "Barista user", sub: "role.barista", avatarBg: "bg-[var(--color-accent-muted)]", avatarText: "text-[var(--color-warning)]", badge: "bg-[var(--color-accent-muted)] text-[var(--color-warning)]" },
  server: { label: "Waiter", sub: "role.server", avatarBg: "bg-[var(--color-info-muted)]", avatarText: "text-[var(--color-info)]", badge: "bg-[var(--color-info-muted)] text-[var(--color-info)]" },
}

const exactEnds = ["/admin", "/cashier/menu", "/kitchen/menu", "/barista/menu", "/server/menu"]

export default function Layout({ children }) {
  const { theme, setTheme } = useTheme()
  const { t } = useLang()
  const { user, logout } = authContext()
  const location = useLocation()
  const navigate = useNavigate()

  const role = user?.role || "admin"
  const info = roleInfo[role] || roleInfo.admin
  const nav = navByRole[role] || navByRole.admin

  
  const displayName = user?.fullName || user?.name || user?.username || info.label
  
  const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Notifications: mounted here (above every page) so the bell, its
  // count, and the alert sound work regardless of which page is active —
  // this used to live inside CashierOrders.jsx alone, which meant
  // navigating to /cashier/menu made notifications invisible and silent.
  const { count: bellCount, bellRinging } = useStaffNotifications(role)

  // Where clicking the bell should take you per role
  const bellDestination = {
    admin: "/admin",
    cashier: "/cashier/orders",
    kitchen: "/kitchen/orders",
    barista: "/barista/orders",
    server: "/server/orders",
  }

  
  
  
  useEffect(() => { unlockAudioOnFirstInteraction() }, [])

  
  
  
  
  
  const needsSoundPrompt = ["cashier", "kitchen", "barista"].includes(role)
  const [soundUnlocked, setSoundUnlocked] = useState(isAudioUnlocked())

  useEffect(() => {
    if (!needsSoundPrompt || soundUnlocked) return
    
    
    const check = () => { if (isAudioUnlocked()) setSoundUnlocked(true) }
    window.addEventListener("click", check)
    window.addEventListener("touchstart", check)
    return () => {
      window.removeEventListener("click", check)
      window.removeEventListener("touchstart", check)
    }
  }, [needsSoundPrompt, soundUnlocked])

  const handleEnableSound = () => {
    unlockAudioNow()
    setSoundUnlocked(true)
  }

  
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-background)]">

      {}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-56 shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col transition-transform duration-300",
        "lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {}
        <div className="px-4 pt-5 pb-4 shrink-0">
          <div className="border-2 border-[var(--color-primary)] rounded-xl p-3 text-center">
            <div className="font-display font-bold text-xl text-[var(--color-primary)] leading-tight">RMS</div>
            <div className="text-[10px] text-[var(--color-text-secondary)] font-medium">Restaurant Management System</div>
          </div>
        </div>

        {}
        <div className="px-4 pb-3">
          <div className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full w-full justify-center", info.badge)}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            {t(info.sub)}
          </div>
        </div>

        {}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 py-1">
          {nav.main.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={exactEnds.includes(to)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-muted)] hover:text-[var(--color-primary)]"
              )}
            >
              <Icon size={17} className="shrink-0" />
              <span className="truncate">{t(label)}</span>
            </NavLink>
          ))}

          {nav.secondary?.length > 0 && (
            <>
              <div className="h-px bg-[var(--color-border)] my-2" />
              {nav.secondary.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-muted)] hover:text-[var(--color-primary)]"
                  )}
                >
                  <Icon size={17} className="shrink-0" />
                  <span className="truncate">{t(label)}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {}
        <div className="px-3 pb-4 pt-2 border-t border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[var(--color-primary-muted)] transition-colors">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0", info.avatarBg, info.avatarText)}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[var(--color-text)] truncate">{displayName}</div>
              <div className="text-[10px] text-[var(--color-muted)]">{t(info.sub)}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-danger-muted)] hover:border-[var(--color-danger)]/25 hover:text-[var(--color-danger)] transition-all"
          >
            <LogOut size={13} /> {t("common.logout")}
          </button>
        </div>
      </aside>

      {}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {}
        <header className="h-14 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center px-4 gap-3">
          {}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--color-primary-muted)] text-[var(--color-text-secondary)]"
          >
            <MenuIcon size={18} />
          </button>

          {}
          <div className="border border-[var(--color-primary)]/40 rounded-lg px-2 py-1 hidden sm:block">
            <span className="font-display font-bold text-sm text-[var(--color-primary)]">RMS</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {}
            <LanguageSwitcher langs={["en", "km"]} className="hidden sm:flex" />

            {}
            <button
              onClick={() => navigate(bellDestination[role] || "/admin")}
              title={bellCount > 0 ? `${bellCount} order(s) need attention` : "No pending notifications"}
              className={cn(
                "relative p-2 rounded-xl border transition-all",
                bellRinging ? "border-[var(--color-warning)]/45 bg-[var(--color-accent-muted)]" : "border-transparent hover:bg-[var(--color-primary-muted)]"
              )}
            >
              <Bell size={16} className={cn(bellRinging && "animate-bounce", bellCount > 0 ? "text-[var(--color-warning)]" : "text-[var(--color-text-secondary)]")} />
              {bellCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--color-danger)] text-white text-[9px] font-bold flex items-center justify-center">
                  {bellCount}
                </span>
              )}
            </button>

            {}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl hover:bg-[var(--color-primary-muted)] text-[var(--color-text-secondary)] transition-colors"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {}
            <div className="flex items-center gap-2 border-l border-[var(--color-border)] pl-3">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0", info.avatarBg, info.avatarText)}>
                {initials}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-[var(--color-text)] leading-none">{displayName}</div>
                <div className="text-[10px] text-[var(--color-muted)] mt-0.5">{t(info.sub)}</div>
              </div>
            </div>

            {}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-[var(--color-primary)] text-white text-xs font-medium px-3 py-2 rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">{t("common.logout")}</span>
            </button>
          </div>
        </header>

        {}
        {needsSoundPrompt && !soundUnlocked && (
          <button
            onClick={handleEnableSound}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-muted)] hover:bg-[var(--color-accent-muted)] text-[var(--color-warning)] text-xs font-semibold py-2 px-4 transition-colors"
          >
            <Bell size={13} /> Tap to enable order alert sounds
          </button>
        )}

        {}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
