import EquipmentTable from './EquipmentTable'
import ComparisonChart from './ComparisonChart'

const formatNumber = (n) => {
  if (n === undefined || n === null) return '—'
  return n.toLocaleString()
}

export default function ResultsPanel({ results, inputs, onDownloadPDF }) {
  if (!results) return null

  return (
    <div className="space-y-6">
      {/* Primary Results Card */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] rounded-lg p-6 text-white">
        <h2 className="text-lg font-semibold mb-4 opacity-90">Primary Results</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm opacity-75">Total Heat Rejection</p>
            <p className="text-2xl font-bold">{results.heatRejectionLoad} <span className="text-base font-normal opacity-75">MW<sub>th</sub></span></p>
          </div>
          <div>
            <p className="text-sm opacity-75">Cooling Capacity</p>
            <p className="text-2xl font-bold">{formatNumber(results.coolingCapacityTons)} <span className="text-base font-normal opacity-75">tons</span></p>
          </div>
          <div>
            <p className="text-sm opacity-75">PUE Impact</p>
            <p className="text-2xl font-bold">{results.actualPUE}</p>
          </div>
        </div>
      </div>

      {/* Detailed Results Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base font-semibold text-slate-800">Detailed Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 font-medium text-slate-600">Parameter</th>
                <th className="px-4 py-3 font-medium text-slate-600 text-right">Value</th>
                <th className="px-4 py-3 font-medium text-slate-600">Unit</th>
                <th className="px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <ResultRow label="IT Load" value={inputs.itLoad.toFixed(1)} unit="MW" note="User input" />
              <ResultRow label="Total Facility Load" value={results.totalFacilityLoad.toFixed(1)} unit="MW" note={`At PUE ${inputs.pue}`} highlight />
              <ResultRow label="Heat Rejection Load" value={results.heatRejectionLoad.toFixed(1)} unit="MW thermal" note="Including losses" />
              <ResultRow label="Cooling Capacity Required" value={formatNumber(results.coolingCapacityTons)} unit="tons" highlight />
              <ResultRow
                label="Chiller Quantity"
                value={`${results.chillerCount} × ${formatNumber(results.chillerSize)}`}
                unit="tons"
                note={`${results.redundancyLabel} redundancy`}
              />
              <ResultRow label="Cooling Tower Capacity" value={formatNumber(results.coolingTowerCapacity)} unit="tons" note="10% margin" highlight />
              <ResultRow label="Data Hall Airflow" value={formatNumber(results.airflowCFM)} unit="CFM" note={`At ${inputs.returnAirTemp - inputs.supplyAirTemp}°F rise`} />
              <ResultRow label="Chilled Water Flow" value={formatNumber(results.chilledWaterFlow)} unit="GPM" note={`${inputs.chilledWaterReturn - inputs.chilledWaterSupply}°F delta`} highlight />
              <ResultRow label="Condenser Water Flow" value={formatNumber(results.condenserWaterFlow)} unit="GPM" note="10°F range" />
              <ResultRow label="Makeup Water" value={formatNumber(results.makeupGPM)} unit="GPM" note={inputs.coolingApproach === 'air-cooled' ? 'None (air-cooled)' : 'Evaporative'} highlight />
              <ResultRow label="Annual Water Use" value={results.annualWaterMillionGal} unit="Million gal" note="Estimated" />
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment Summary */}
      <EquipmentTable results={results} />

      {/* Visual Comparison */}
      <ComparisonChart inputs={inputs} results={results} />

      {/* Download Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onDownloadPDF}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d5a8e] transition-colors font-medium shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF Report
        </button>
      </div>
    </div>
  )
}

function ResultRow({ label, value, unit, note, highlight }) {
  return (
    <tr className={highlight ? 'bg-slate-50/50' : ''}>
      <td className="px-4 py-3 text-slate-700 font-medium">{label}</td>
      <td className="px-4 py-3 text-right font-mono text-slate-900">{value}</td>
      <td className="px-4 py-3 text-slate-500">{unit}</td>
      <td className="px-4 py-3 text-slate-400 text-xs hidden sm:table-cell">{note}</td>
    </tr>
  )
}
