import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import { useEffect } from "react"
import { authContext } from "./context/authContext"
import Layout from "./components/Layout"
import Login from "./pages/Login"

import Dashboard from "./pages/admin/Dashboard"
import Menu from "./pages/admin/Menu"
import Stock from "./pages/admin/Stock"
import Tables from "./pages/admin/Tables"
import Payments from "./pages/admin/Payments"
import Reports from "./pages/admin/Reports"
import CashierPaymentsReport from "./pages/cashier/PaymentsReport"
import Suppliers from "./pages/admin/Suppliers"
import UserManagement from "./pages/admin/UserManagement"
import OrderHistory from "./pages/admin/OrderHistory"

import CashierMenu from "./pages/cashier/CashierMenu"
import CashierOrders from "./pages/cashier/CashierOrders"
import CashierHistory from "./pages/cashier/CashierHistory"

import BaristaMenu from "./pages/barista/BaristaMenu"
import BaristaOrders from "./pages/barista/BaristaOrders"
import BaristaStock from "./pages/barista/BaristaStock"

import KitchenMenu from "./pages/kitchen/KitchenMenu"
import KitchenOrders from "./pages/kitchen/KitchenOrders"
import KitchenStock from "./pages/kitchen/KitchenStock"

import GuestLanding from "./pages/guest/GuestLanding"
import GuestOrder from "./pages/guest/GuestOrder"
import GuestOrderStatus from "./pages/guest/GuestOrderStatus"

const roleHome = {
  admin:   "/admin",
  cashier: "/cashier/menu",
  kitchen: "/kitchen/menu",
  barista: "/barista/menu",
}

function isAllowed(role, pathname) {
  const prefixMap = {
    admin:   "/admin",
    cashier: "/cashier",
    kitchen: "/kitchen",
    barista: "/barista",
  }
  const prefix = prefixMap[role]
  if (!prefix) return false
  return pathname === prefix || pathname.startsWith(prefix + "/")
}

function RoleRedirector() {
  const { user } = authContext()
  const role = user?.role
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!role) return
    if (!isAllowed(role, location.pathname)) {
      navigate(roleHome[role] || "/admin", { replace: true })
    }
  }, [role, location.pathname, navigate])

  return null
}

function ProtectedRoute({ role, allowedRoles, children }) {
  if (!allowedRoles.includes(role)) {
    return <Navigate to={roleHome[role] || "/admin"} replace />
  }
  return children
}

function StaffApp() {
  const { user, isLoading, checkAuth } = authContext()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-[var(--color-background)]">
        <div className="border-2 border-[var(--color-primary)] rounded-xl px-6 py-4 text-center">
          <div className="font-display font-bold text-2xl text-[var(--color-primary)]">ZOOM</div>
          <div className="text-xs text-[var(--color-muted)] mt-0.5">Garden Cafe & Wine</div>
        </div>
        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  const role = user.role || "admin"

  return (
    <Layout>
      <RoleRedirector />
      <Routes>

        {}
        <Route path="/admin" element={<ProtectedRoute role={role} allowedRoles={["admin"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/menu" element={<ProtectedRoute role={role} allowedRoles={["admin"]}><Menu /></ProtectedRoute>} />
        <Route path="/admin/stock" element={<ProtectedRoute role={role} allowedRoles={["admin"]}><Stock /></ProtectedRoute>} />
        <Route path="/admin/tables" element={<ProtectedRoute role={role} allowedRoles={["admin"]}><Tables /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute role={role} allowedRoles={["admin"]}><Payments /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute role={role} allowedRoles={["admin"]}><Reports /></ProtectedRoute>} />
        <Route path="/admin/suppliers" element={<ProtectedRoute role={role} allowedRoles={["admin"]}><Suppliers /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role={role} allowedRoles={["admin"]}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/history" element={<ProtectedRoute role={role} allowedRoles={["admin"]}><OrderHistory /></ProtectedRoute>} />

        {}
        <Route path="/cashier/menu" element={<ProtectedRoute role={role} allowedRoles={["cashier"]}><CashierMenu /></ProtectedRoute>} />
        <Route path="/cashier/orders" element={<ProtectedRoute role={role} allowedRoles={["cashier"]}><CashierOrders /></ProtectedRoute>} />
        <Route path="/cashier/payments" element={<ProtectedRoute role={role} allowedRoles={["cashier"]}><CashierPaymentsReport /></ProtectedRoute>} />
        <Route path="/cashier/history" element={<ProtectedRoute role={role} allowedRoles={["cashier"]}><CashierHistory /></ProtectedRoute>} />

        {}
        <Route path="/kitchen/menu" element={<ProtectedRoute role={role} allowedRoles={["kitchen"]}><KitchenMenu /></ProtectedRoute>} />
        <Route path="/kitchen/orders" element={<ProtectedRoute role={role} allowedRoles={["kitchen"]}><KitchenOrders /></ProtectedRoute>} />
        <Route path="/kitchen/stock" element={<ProtectedRoute role={role} allowedRoles={["kitchen"]}><KitchenStock /></ProtectedRoute>} />

        {}
        <Route path="/barista/menu" element={<ProtectedRoute role={role} allowedRoles={["barista"]}><BaristaMenu /></ProtectedRoute>} />
        <Route path="/barista/orders" element={<ProtectedRoute role={role} allowedRoles={["barista"]}><BaristaOrders /></ProtectedRoute>} />
        <Route path="/barista/stock" element={<ProtectedRoute role={role} allowedRoles={["barista"]}><BaristaStock /></ProtectedRoute>} />

        {}
        <Route path="*" element={<Navigate to={roleHome[role] || "/admin"} replace />} />

      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <BrowserRouter>
        <Routes>
          {}
          <Route path="/" element={<GuestLanding />} />
          <Route path="/order" element={<GuestOrder />} />
          <Route path="/order/status" element={<GuestOrderStatus />} />

          {}
          <Route path="/*" element={<StaffApp />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
