import { useEffect, useState } from 'react'
import { storeApi } from '../api/axios'
import Table from '../components/Table'

export default function CustomersPage() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        storeApi.get('/api/customers').then(r => { setCustomers(r.data); setLoading(false) })
    }, [])

    const handleDelete = async (c) => {
        if (!window.confirm(`Delete customer "${c.fullName}"?`)) return
        await storeApi.delete(`/api/customers/${c.id}`)
        setCustomers(prev => prev.filter(x => x.id !== c.id))
    }

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'fullName', label: 'Full Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role', render: r => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{r.role}</span>
            )},
    ]

    if (loading) return <div className="text-gray-400 text-center py-20">Loading...</div>

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
            <Table
                columns={columns}
                data={customers}
                actions={(row) => (
                    <button onClick={() => handleDelete(row)} className="text-red-500 hover:underline text-sm">Delete</button>
                )}
            />
        </div>
    )
}