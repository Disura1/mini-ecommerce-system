import { useEffect, useState } from 'react'
import { storeApi, vendorApi } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'

export default function DashboardPage() {
    const { user } = useAuth()
    const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, categories: 0, suppliers: 0, restock: 0 })
    const [lowStock, setLowStock] = useState([])
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [products, orders, customers, categories] = await Promise.all([
                    storeApi.get('/api/products'),
                    storeApi.get('/api/orders'),
                    storeApi.get('/api/customers'),
                    storeApi.get('/api/categories'),
                ])

                let supplierCount = 0, restockCount = 0
                if (user?.role === 'ADMIN') {
                    const [suppliers, restock] = await Promise.all([
                        vendorApi.get('/api/suppliers'),
                        vendorApi.get('/api/restock-requests'),
                    ])
                    supplierCount = suppliers.data.length
                    restockCount = restock.data.filter(r => r.status === 'PENDING').length
                }

                setStats({
                    products: products.data.length,
                    orders: orders.data.length,
                    customers: customers.data.length,
                    categories: categories.data.length,
                    suppliers: supplierCount,
                    restock: restockCount,
                })
                setLowStock(products.data.filter(p => p.stockQuantity < 10))
                setRecentOrders(orders.data.slice(-5).reverse())
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [user])

    if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading dashboard...</div>

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-gray-500">Welcome back, {user?.email}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard label="Products" value={stats.products} icon="📦" color="indigo" />
                <StatCard label="Orders" value={stats.orders} icon="🛒" color="blue" />
                {user?.role === 'ADMIN' && <>
                    <StatCard label="Customers" value={stats.customers} icon="👥" color="green" />
                    <StatCard label="Categories" value={stats.categories} icon="🗂" color="yellow" />
                    <StatCard label="Suppliers" value={stats.suppliers} icon="🏭" color="indigo" />
                    <StatCard label="Pending Restock" value={stats.restock} icon="🔄" color="red" />
                </>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Warning */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-4">⚠️ Low Stock Products</h3>
                    {lowStock.length === 0
                        ? <p className="text-gray-400 text-sm">All products are well stocked.</p>
                        : <ul className="space-y-2">
                            {lowStock.map(p => (
                                <li key={p.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                    <span className="text-sm text-gray-700">{p.name}</span>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.stockQuantity === 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.stockQuantity} left
                    </span>
                                </li>
                            ))}
                        </ul>
                    }
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-4">🕐 Recent Orders</h3>
                    {recentOrders.length === 0
                        ? <p className="text-gray-400 text-sm">No orders yet.</p>
                        : <ul className="space-y-2">
                            {recentOrders.map(o => (
                                <li key={o.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Order #{o.id}</p>
                                        <p className="text-xs text-gray-400">{o.customer?.fullName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-800">${o.totalAmount}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                o.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                                    'bg-blue-100 text-blue-600'
                                        }`}>{o.status}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    }
                </div>
            </div>
        </div>
    )
}