const formatNumber = (n) => n?.toLocaleString() ?? '—'

export default function EquipmentTable({ results }) {
  const equipment = [
    {
      name: 'Centrifugal Chillers',
      quantity: results.chillerCount,
      size: `${formatNumber(results.chillerSize)} tons`,
      notes: results.redundancyLabel,
    },
    {
      name: 'Cooling Towers',
      quantity: results.towerCount,
      size: `${formatNumber(results.towerSize)} tons`,
      notes: `${results.redundancyLabel}, induced draft`,
    },
    {
      name: 'CRAH Units',
      quantity: results.crahCount,
      size: `${formatNumber(results.crahSize)} CFM`,
      notes: 'Based on density',
    },
    {
      name: 'Chilled Water Pumps',
      quantity: results.pumpCount,
      size: `${results.pumpHP} HP`,
      notes: 'Variable speed',
    },
  ]

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-base font-semibold text-slate-800">Equipment Summary</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-4 py-3 font-medium text-slate-600">Equipment</th>
              <th className="px-4 py-3 font-medium text-slate-600 text-right">Qty</th>
              <th className="px-4 py-3 font-medium text-slate-600 text-right">Size</th>
              <th className="px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {equipment.map((item, i) => (
              <tr key={item.name} className={i % 2 === 0 ? 'bg-slate-50/50' : ''}>
                <td className="px-4 py-3 text-slate-700 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-900">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-900">{item.size}</td>
                <td className="px-4 py-3 text-slate-400 text-xs hidden sm:table-cell">{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
