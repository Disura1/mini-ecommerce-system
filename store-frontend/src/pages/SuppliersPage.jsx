import { useEffect, useState } from 'react'
import { vendorApi } from '../api/axios'
import Table from '../components/Table'
import Modal from '../components/Modal'

const empty = { name: '', email: '', phone: '', address: '' }

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState([])
    const [modal, setModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(empty)
    const [error, setError] = useState('')

    const fetchData = async () => {
        const { data } = await vendorApi.get('/api/suppliers')
        setSuppliers(data)
    }
    useEffect(() => { fetchData() }, [])

    const openCreate = () => { setEditing(null); setForm(empty); setError(''); setModal(true) }
    const openEdit = (s) => { setEditing(s); setForm({ name: s.name, email: s.email, phone: s.phone, address: s.address }); setError(''); setModal(true) }

    const handleSubmit = async (e) => {
        e.preventDefault(); setError('')
        try {
            if (editing) await vendorApi.put(`/api/suppliers/${editing.id}`, form)
            else await vendorApi.post('/api/suppliers', form)
            setModal(false); fetchData()
        } catch { setError('Failed to save supplier.') }
    }

    const handleDelete = async (s) => {
        if (!window.confirm(`Delete "${s.name}"?`)) return
        await vendorApi.delete(`/api/suppliers/${s.id}`)
        fetchData()
    }

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'address', label: 'Address' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Suppliers</h2>
                <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">+ Add Supplier</button>
            </div>
            <Table columns={columns} data={suppliers} actions={(row) => (<>
                <button onClick={() => openEdit(row)} className="text-indigo-600 hover:underline text-sm mr-3">Edit</button>
                <button onClick={() => handleDelete(row)} className="text-red-500 hover:underline text-sm">Delete</button>
            </>)} />
            {modal && (
                <Modal title={editing ? 'Edit Supplier' : 'Add Supplier'} onClose={() => setModal(false)}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {['name', 'email', 'phone', 'address'].map(field => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field}</label>
                                <input required value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})}
                                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        ))}
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