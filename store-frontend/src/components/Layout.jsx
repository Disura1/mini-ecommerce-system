import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
    { to: '/dashboard', label: '📊 Dashboard', adminOnly: false },
    { to: '/products', label: '📦 Products', adminOnly: false },
    { to: '/orders', label: '🛒 Orders', adminOnly: false },
    { to: '/categories', label: '🗂 Categories', adminOnly: true },
    { to: '/customers', label: '👥 Customers', adminOnly: true },
    { to: '/suppliers', label: '🏭 Suppliers', adminOnly: true },
    { to: '/restock', label: '🔄 Restock', adminOnly: true },
]

export default function Layout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const visibleNav = navItems.filter(item => !item.adminOnly || user?.role === 'ADMIN')

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-xl font-bold text-white">🛍 MiniShop</h1>
                    <p className="text-xs text-gray-400 mt-1">{user?.role} — {user?.email}</p>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {visibleNav.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-left"
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    )
}