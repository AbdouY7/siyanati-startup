export default function DataTable({ columns, data, onRowClick }) {
  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray">No data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((col) => (
              <th 
                key={col.key} 
                className="text-left py-3 px-4 text-xs font-semibold text-gray uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr 
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-gray-50 hover:bg-light/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4 text-sm">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
