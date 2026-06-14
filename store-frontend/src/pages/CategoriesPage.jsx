import { useEffect, useState } from 'react'
import { storeApi } from '../api/axios'
import Table from '../components/Table'
import Modal from '../components/Modal'

export default function CategoriesPage() {
    const [categories, setCategories] = useState([])
    const [modal, setModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ name: '', description: '' })
    const [error, setError] = useState('')

    const fetchData = async () => {
        const { data } = await storeApi.get('/api/categories')
        setCategories(data)
    }
    useEffect(() => { fetchData() }, [])

    const openCreate = () => { setEditing(null); setForm({ name: '', description: '' }); setError(''); setModal(true) }
    const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description }); setError(''); setModal(true) }

    const handleSubmit = async (e) => {
        e.preventDefault(); setError('')
        try {
            if (editing) await storeApi.put(`/api/categories/${editing.id}`, form)
            else await storeApi.post('/api/categories', form)
            setModal(false); fetchData()
        } catch { setError('Failed to save.') }
    }

    const handleDelete = async (c) => {
        if (!window.confirm(`Delete "${c.name}"?`)) return
        await storeApi.delete(`/api/categories/${c.id}`)
        fetchData()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
                <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">+ Add Category</button>
            </div>
            <Table
                columns={[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'description', label: 'Description' }]}
                data={categories}
                actions={(row) => (<>
                    <button onClick={() => openEdit(row)} className="text-indigo-600 hover:underline text-sm mr-3">Edit</button>
                    <button onClick={() => handleDelete(row)} className="text-red-500 hover:underline text-sm">Delete</button>
                </>)}
            />
            {modal && (
                <Modal title={editing ? 'Edit Category' : 'Add Category'} onClose={() => setModal(false)}>
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