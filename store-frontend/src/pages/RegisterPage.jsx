import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { storeApi } from '../api/axios'

export default function RegisterPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ fullName: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const { data } = await storeApi.post('/api/auth/register', { ...form, role: 'CUSTOMER' })
            const payload = JSON.parse(atob(data.token.split('.')[1]))
            const role = payload.roles?.[0]?.replace('ROLE_', '') || 'CUSTOMER'
            login(data.token, { email: form.email, role })
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">🛍 MiniShop</h1>
                    <p className="text-gray-500 mt-2">Create your account</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text" required
                            value={form.fullName}
                            onChange={e => setForm({ ...form, fullName: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email" required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password" required minLength={6}
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit" disabled={loading}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 hover:underline font-medium">Sign in</Link>
                </p>
            </div>
        </div>
    )
}