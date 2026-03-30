import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { compareApproaches } from '../utils/calculations'

export default function ComparisonChart({ inputs, results }) {
  const comparison = compareApproaches(inputs)

  const loadData = [
    {
      name: 'Load Breakdown',
      'IT Load': inputs.itLoad,
      'Cooling Overhead': results.coolingOverhead,
      'Heat Rejection': results.heatRejectionLoad,
    },
  ]

  const waterData = comparison.map(c => ({
    name: c.label,
    'Water Use (GPM)': c.results.makeupGPM,
    'Capacity (tons)': c.results.coolingCapacityTons,
  }))

  return (
    <div className="space-y-4">
      {/* Load Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
          <h2 className="text-[0.9375rem] font-semibold text-gray-800 m-0">Load Breakdown (MW)</h2>
        </div>
        <div className="p-4" style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loadData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} width={100} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(value) => [`${value.toFixed(2)} MW`]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="IT Load" fill="#0284c7" stackId="a" />
              <Bar dataKey="Cooling Overhead" fill="#38bdf8" stackId="a" />
              <Bar dataKey="Heat Rejection" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cooling Approach Comparison */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
          <h2 className="text-[0.9375rem] font-semibold text-gray-800 m-0">Cooling Approach Comparison</h2>
        </div>
        <div className="p-4" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterData} margin={{ left: 10, right: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#9ca3af' }} label={{ value: 'GPM', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9ca3af' }} label={{ value: 'Tons', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: '#9ca3af' } }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(value, name) => [value.toLocaleString(), name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="Water Use (GPM)" fill="#38bdf8" />
              <Bar yAxisId="right" dataKey="Capacity (tons)" fill="#0284c7" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto border-t border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left font-semibold text-gray-400 uppercase tracking-wider">Parameter</th>
                {comparison.map(c => (
                  <th key={c.approach} className="px-4 py-2 text-right font-semibold text-gray-400 uppercase tracking-wider">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="px-4 py-2 text-gray-700 font-medium">Capacity</td>
                {comparison.map(c => (
                  <td key={c.approach} className="px-4 py-2 text-right font-mono text-gray-900">
                    {c.results.coolingCapacityTons.toLocaleString()} tons
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <td className="px-4 py-2 text-gray-700 font-medium">Water Use</td>
                {comparison.map(c => (
                  <td key={c.approach} className="px-4 py-2 text-right font-mono text-gray-900">
                    {c.results.makeupGPM === 0 ? 'None' : `${c.results.makeupGPM.toLocaleString()} GPM`}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-50">
                <td className="px-4 py-2 text-gray-700 font-medium">Heat Rejection</td>
                {comparison.map(c => (
                  <td key={c.approach} className="px-4 py-2 text-right font-mono text-gray-900">
                    {c.results.heatRejectionLoad} MW
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-700 font-medium">Footprint</td>
                {comparison.map(c => (
                  <td key={c.approach} className="px-4 py-2 text-right text-gray-900">
                    {{
                      'air-cooled': 'Large',
                      'chilled-water': 'Medium',
                      'evaporative': 'Small',
                      'hybrid': 'Medium',
                    }[c.approach]}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
