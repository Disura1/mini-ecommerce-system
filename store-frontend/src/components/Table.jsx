export default function Table({ columns, data, actions }) {
    if (!data?.length) return (
        <div className="text-center py-12 text-gray-400">No records found.</div>
    )
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    {columns.map(col => (
                        <th key={col.key} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {col.label}
                        </th>
                    ))}
                    {actions && <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>}
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                {data.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                        {columns.map(col => (
                            <td key={col.key} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                {col.render ? col.render(row) : row[col.key] ?? '—'}
                            </td>
                        ))}
                        {actions && (
                            <td className="px-6 py-4 text-right space-x-2">
                                {actions(row)}
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}