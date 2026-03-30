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
    <div className="space-y-6">
      {/* Load Breakdown */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base font-semibold text-slate-800">Load Breakdown (MW)</h3>
        </div>
        <div className="p-4" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loadData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} width={100} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(value) => [`${value.toFixed(2)} MW`]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="IT Load" fill="#1e3a5f" stackId="a" />
              <Bar dataKey="Cooling Overhead" fill="#3b82f6" stackId="a" />
              <Bar dataKey="Heat Rejection" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cooling Approach Comparison */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base font-semibold text-slate-800">Cooling Approach Comparison</h3>
        </div>
        <div className="p-4" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterData} margin={{ left: 10, right: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} label={{ value: 'GPM', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} label={{ value: 'Tons', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: '#64748b' } }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(value, name) => [value.toLocaleString(), name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="Water Use (GPM)" fill="#3b82f6" />
              <Bar yAxisId="right" dataKey="Capacity (tons)" fill="#1e3a5f" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto border-t border-slate-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-2 text-left font-medium text-slate-600">Parameter</th>
                {comparison.map(c => (
                  <th key={c.approach} className="px-3 py-2 text-right font-medium text-slate-600">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-3 py-2 text-slate-700 font-medium">Capacity</td>
                {comparison.map(c => (
                  <td key={c.approach} className="px-3 py-2 text-right font-mono text-slate-900">
                    {c.results.coolingCapacityTons.toLocaleString()} tons
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-50/50">
                <td className="px-3 py-2 text-slate-700 font-medium">Water Use</td>
                {comparison.map(c => (
                  <td key={c.approach} className="px-3 py-2 text-right font-mono text-slate-900">
                    {c.results.makeupGPM === 0 ? 'None' : `${c.results.makeupGPM.toLocaleString()} GPM`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate-700 font-medium">Heat Rejection</td>
                {comparison.map(c => (
                  <td key={c.approach} className="px-3 py-2 text-right font-mono text-slate-900">
                    {c.results.heatRejectionLoad} MW
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-50/50">
                <td className="px-3 py-2 text-slate-700 font-medium">Footprint</td>
                {comparison.map(c => (
                  <td key={c.approach} className="px-3 py-2 text-right text-slate-900">
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
