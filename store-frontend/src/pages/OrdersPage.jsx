import { useEffect, useState } from 'react'
import { storeApi } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Table from '../components/Table'
import Modal from '../components/Modal'

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const statusColor = (s) => ({
    PENDING: 'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-600',
    SHIPPED: 'bg-indigo-100 text-indigo-600',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-600',
}[s] || 'bg-gray-100 text-gray-600')

export default function OrdersPage() {
    const { user } = useAuth()
    const isAdmin = user?.role === 'ADMIN'
    const [orders, setOrders] = useState([])
    const [products, setProducts] = useState([])
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusModal, setStatusModal] = useState(null)
    const [createModal, setCreateModal] = useState(false)
    const [newStatus, setNewStatus] = useState('')
    const [orderForm, setOrderForm] = useState({ customerId: '', items: [{ productId: '', quantity: 1 }] })
    const [error, setError] = useState('')

    const fetchData = async () => {
        const [o, p, c] = await Promise.all([
            storeApi.get('/api/orders'),
            storeApi.get('/api/products'),
            isAdmin ? storeApi.get('/api/customers') : Promise.resolve({ data: [] })
        ])
        setOrders(o.data); setProducts(p.data); setCustomers(c.data)
        setLoading(false)
    }
    useEffect(() => { fetchData() }, [])

    const handleStatusUpdate = async () => {
        await storeApi.patch(`/api/orders/${statusModal.id}/status`, { status: newStatus })
        setStatusModal(null); fetchData()
    }

    const addItem = () => setOrderForm(f => ({ ...f, items: [...f.items, { productId: '', quantity: 1 }] }))
    const removeItem = (i) => setOrderForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
    const updateItem = (i, field, val) => setOrderForm(f => {
        const items = [...f.items]; items[i] = { ...items[i], [field]: val }; return { ...f, items }
    })

    const handleCreateOrder = async (e) => {
        e.preventDefault(); setError('')
        try {
            await storeApi.post('/api/orders', {
                customerId: parseInt(orderForm.customerId),
                items: orderForm.items.map(i => ({ productId: parseInt(i.productId), quantity: parseInt(i.quantity) }))
            })
            setCreateModal(false)
            setOrderForm({ customerId: '', items: [{ productId: '', quantity: 1 }] })
            fetchData()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create order.')
        }
    }

    const columns = [
        { key: 'id', label: 'Order #' },
        { key: 'customer', label: 'Customer', render: r => r.customer?.fullName || '—' },
        { key: 'totalAmount', label: 'Total', render: r => `$${r.totalAmount}` },
        { key: 'status', label: 'Status', render: r => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(r.status)}`}>{r.status}</span>
            )},
        { key: 'orderDate', label: 'Date', render: r => new Date(r.orderDate).toLocaleDateString() },
    ]

    if (loading) return <div className="text-gray-400 text-center py-20">Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
                {isAdmin && <button onClick={() => setCreateModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">+ New Order</button>}
            </div>
            <Table
                columns={columns}
                data={orders}
                actions={isAdmin ? (row) => (
                    <button onClick={() => { setStatusModal(row); setNewStatus(row.status) }} className="text-indigo-600 hover:underline text-sm">Update Status</button>
                ) : null}
            />

            {/* Status Modal */}
            {statusModal && (
                <Modal title={`Update Order #${statusModal.id} Status`} onClose={() => setStatusModal(null)}>
                    <div className="space-y-4">
                        <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setStatusModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={handleStatusUpdate} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Create Order Modal */}
            {createModal && (
                <Modal title="Create New Order" onClose={() => setCreateModal(false)}>
                    <form onSubmit={handleCreateOrder} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                            <select required value={orderForm.customerId} onChange={e => setOrderForm({...orderForm, customerId: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Select customer...</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Items</label>
                            {orderForm.items.map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <select required value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="">Select product...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                                    </select>
                                    <input type="number" min="1" required value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)}
                                           className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    {orderForm.items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 px-2">✕</button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addItem} className="text-indigo-600 text-sm hover:underline">+ Add item</button>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setCreateModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Order</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    )
}