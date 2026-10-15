const Table = ({ 
    columns, 
    data, 
    loading, 
    emptyMessage = "No records found.",
    onRowClick,

}) => {
    if (loading) {
        return (
            <div className="flex h-48 items-center justify-center text-gray-400">
                Loading…
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-left" >
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="px-4 py-3 font-semibold text-gray-600"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="py-10 text-center text-gray-400"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, i) => (
                            <tr key={i} onClick={()=>onRowClick?.(row)}
                             className="hover:bg-gray-50 transition">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3 text-gray-700">
                                        {col.render ? col.render(row) : row[col.key] ?? "—"}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;