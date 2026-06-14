import { useEffect, useState } from 'react'
import { storeApi } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Table from '../components/Table'
import Modal from '../components/Modal'

const empty = { name: '', description: '', price: '', stockQuantity: '', categoryId: '' }

export default function ProductsPage() {
    const { user } = useAuth()
    const isAdmin = user?.role === 'ADMIN'
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [modal, setModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(empty)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchData = async () => {
        const [p, c] = await Promise.all([storeApi.get('/api/products'), storeApi.get('/api/categories')])
        setProducts(p.data)
        setCategories(c.data)
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const openCreate = () => { setEditing(null); setForm(empty); setError(''); setModal(true) }
    const openEdit = (p) => {
        setEditing(p)
        setForm({ name: p.name, description: p.description, price: p.price, stockQuantity: p.stockQuantity, categoryId: p.category?.id || '' })
        setError('')
        setModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const payload = { ...form, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity), category: { id: parseInt(form.categoryId) } }
            if (editing) await storeApi.put(`/api/products/${editing.id}`, payload)
            else await storeApi.post('/api/products', payload)
            setModal(false)
            fetchData()
        } catch { setError('Failed to save product.') }
    }

    const handleDelete = async (p) => {
        if (!window.confirm(`Delete "${p.name}"?`)) return
        await storeApi.delete(`/api/products/${p.id}`)
        fetchData()
    }

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'category', label: 'Category', render: r => r.category?.name || '—' },
        { key: 'price', label: 'Price', render: r => `$${r.price}` },
        { key: 'stockQuantity', label: 'Stock', render: r => (
                <span className={`font-semibold ${r.stockQuantity < 10 ? 'text-red-500' : 'text-green-600'}`}>{r.stockQuantity}</span>
            )},
    ]

    if (loading) return <div className="text-gray-400 text-center py-20">Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                {isAdmin && <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">+ Add Product</button>}
            </div>

            <Table
                columns={columns}
                data={products}
                actions={isAdmin ? (row) => (<>
                    <button onClick={() => openEdit(row)} className="text-indigo-600 hover:underline text-sm mr-3">Edit</button>
                    <button onClick={() => handleDelete(row)} className="text-red-500 hover:underline text-sm">Delete</button>
                </>) : null}
            />

            {modal && (
                <Modal title={editing ? 'Edit Product' : 'Add Product'} onClose={() => setModal(false)}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={2} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                <input required type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                <input required type="number" value={form.stockQuantity} onChange={e => setForm({...form, stockQuantity: e.target.value})}
                                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select required value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Select category...</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    )
}