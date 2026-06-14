export default function StatCard({ label, value, icon, color = 'indigo' }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        red: 'bg-red-50 text-red-600',
        blue: 'bg-blue-50 text-blue-600',
    }
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`text-3xl p-3 rounded-xl ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    )
}