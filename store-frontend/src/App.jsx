import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import CustomersPage from './pages/CustomersPage'
import OrdersPage from './pages/OrdersPage'
import SuppliersPage from './pages/SuppliersPage'
import RestockPage from './pages/RestockPage'

function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const { token } = useAuth()
  return (
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute adminOnly><CategoriesPage /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute adminOnly><CustomersPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute adminOnly><SuppliersPage /></ProtectedRoute>} />
          <Route path="/restock" element={<ProtectedRoute adminOnly><RestockPage /></ProtectedRoute>} />
        </Route>
      </Routes>
  )
}

export default function App() {
  return (
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
  )
}