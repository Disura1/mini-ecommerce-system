import { useEffect, useState } from 'react'
import { vendorApi } from '../api/axios'
import Table from '../components/Table'
import Modal from '../components/Modal'

const STATUSES = ['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const statusColor = (s) => ({
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-600',
    SHIPPED: 'bg-indigo-100 text-indigo-600',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-600',
}[s] || 'bg-gray-100 text-gray-600')

export default function RestockPage() {
    const [requests, setRequests] = useState([])
    const [suppliers, setSuppliers] = useState([])
    const [statusModal, setStatusModal] = useState(null)
    const [createModal, setCreateModal] = useState(false)
    const [newStatus, setNewStatus] = useState('')
    const [form, setForm] = useState({ supplier_id: '', product_name: '', quantity_requested: '', notes: '' })
    const [error, setError] = useState('')

    const fetchData = async () => {
        const [r, s] = await Promise.all([vendorApi.get('/api/restock-requests'), vendorApi.get('/api/suppliers')])
        setRequests(r.data); setSuppliers(s.data)
    }
    useEffect(() => { fetchData() }, [])

    const handleStatusUpdate = async () => {
        await vendorApi.patch(`/api/restock-requests/${statusModal.id}/status`, { status: newStatus })
        setStatusModal(null); fetchData()
    }

    const handleCreate = async (e) => {
        e.preventDefault(); setError('')
        try {
            await vendorApi.post('/api/restock-requests', { ...form, supplier_id: parseInt(form.supplier_id), quantity_requested: parseInt(form.quantity_requested) })
            setCreateModal(false)
            setForm({ supplier_id: '', product_name: '', quantity_requested: '', notes: '' })
            fetchData()
        } catch { setError('Failed to create request.') }
    }

    const handleDelete = async (r) => {
        if (!window.confirm('Delete this restock request?')) return
        await vendorApi.delete(`/api/restock-requests/${r.id}`)
        fetchData()
    }

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'supplier_name', label: 'Supplier' },
        { key: 'product_name', label: 'Product' },
        { key: 'quantity_requested', label: 'Qty' },
        { key: 'status', label: 'Status', render: r => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(r.status)}`}>{r.status}</span>
            )},
        { key: 'notes', label: 'Notes', render: r => <span className="text-xs text-gray-500 max-w-xs truncate block">{r.notes || '—'}</span> },
        { key: 'requested_at', label: 'Date', render: r => new Date(r.requested_at).toLocaleDateString() },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Restock Requests</h2>
                <button onClick={() => setCreateModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">+ New Request</button>
            </div>
            <Table columns={columns} data={requests} actions={(row) => (<>
                <button onClick={() => { setStatusModal(row); setNewStatus(row.status) }} className="text-indigo-600 hover:underline text-sm mr-3">Status</button>
                <button onClick={() => handleDelete(row)} className="text-red-500 hover:underline text-sm">Delete</button>
            </>)} />

            {statusModal && (
                <Modal title={`Update Request #${statusModal.id}`} onClose={() => setStatusModal(null)}>
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

            {createModal && (
                <Modal title="New Restock Request" onClose={() => setCreateModal(false)}>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                            <select required value={form.supplier_id} onChange={e => setForm({...form, supplier_id: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Select supplier...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input required value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})}
                                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input required type="number" min="1" value={form.quantity_requested} onChange={e => setForm({...form, quantity_requested: e.target.value})}
                                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={2} />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setCreateModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    )
}