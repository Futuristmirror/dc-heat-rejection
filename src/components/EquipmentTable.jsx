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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
        <h2 className="text-[0.9375rem] font-semibold text-gray-800 m-0">Equipment Summary</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Equipment</th>
              <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Qty</th>
              <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Size</th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Notes</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item, i) => (
              <tr key={item.name} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="px-5 py-2.5 text-gray-700 font-medium">{item.name}</td>
                <td className="px-5 py-2.5 text-right font-mono text-gray-900">{item.quantity}</td>
                <td className="px-5 py-2.5 text-right font-mono text-gray-900">{item.size}</td>
                <td className="px-5 py-2.5 text-gray-400 text-xs hidden sm:table-cell">{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
