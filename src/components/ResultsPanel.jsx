import EquipmentTable from './EquipmentTable'
import ComparisonChart from './ComparisonChart'

const formatNumber = (n) => {
  if (n === undefined || n === null) return '—'
  return n.toLocaleString('en-US')
}

function ResultRow({ label, value, unit, highlight }) {
  return (
    <div className={`flex items-baseline justify-between py-2.5 px-5 ${highlight ? 'bg-sky-50 -mx-5 px-5' : ''}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900 font-mono">
        {value} <span className="font-normal text-gray-400 text-xs">{unit}</span>
      </span>
    </div>
  )
}

function SectionHeading({ children }) {
  return (
    <div className="pt-4 pb-1 px-5">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider m-0">{children}</h3>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-gray-100 mx-5" />
}

export default function ResultsPanel({ results, inputs, onDownloadPDF }) {
  if (!results) return null

  return (
    <div className="space-y-4">
      {/* Main Results Card */}
      <div className="bg-white rounded-xl border border-sky-200 shadow-sm overflow-hidden">
        <div className="bg-sky-50 px-5 py-3 border-b border-sky-100">
          <h2 className="text-[0.9375rem] font-semibold text-sky-800 m-0">Results</h2>
        </div>

        <div className="py-2">
          {/* Primary Results */}
          <SectionHeading>Heat Rejection</SectionHeading>
          <ResultRow label="IT Load" value={inputs.itLoad.toFixed(1)} unit="MW" />
          <ResultRow label="Total Facility Load" value={results.totalFacilityLoad.toFixed(1)} unit={`MW (PUE ${inputs.pue})`} />
          <ResultRow label="Total Heat Rejection" value={results.heatRejectionLoad.toFixed(1)} unit="MW thermal" highlight />

          <Divider />

          {/* Cooling Capacity */}
          <SectionHeading>Cooling System</SectionHeading>
          <ResultRow label="Cooling Capacity Required" value={formatNumber(results.coolingCapacityTons)} unit="tons" highlight />
          <ResultRow label="Chiller Quantity" value={`${results.chillerCount} × ${formatNumber(results.chillerSize)}`} unit={`tons (${results.redundancyLabel})`} />
          <ResultRow label="Cooling Tower Capacity" value={formatNumber(results.coolingTowerCapacity)} unit="tons" />

          <Divider />

          {/* Airflow & Water */}
          <SectionHeading>Airflow &amp; Water</SectionHeading>
          <ResultRow label="Data Hall Airflow" value={formatNumber(results.airflowCFM)} unit="CFM" />
          <ResultRow label="Chilled Water Flow" value={formatNumber(results.chilledWaterFlow)} unit="GPM" />
          <ResultRow label="Condenser Water Flow" value={formatNumber(results.condenserWaterFlow)} unit="GPM" />
          <ResultRow label="Makeup Water" value={formatNumber(results.makeupGPM)} unit="GPM" highlight />
          <ResultRow label="Annual Water Use" value={results.annualWaterMillionGal} unit="M gal/yr" />
        </div>

        {/* Disclaimer */}
        <div className="mx-5 mb-4 mt-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 m-0 leading-relaxed">
            These are screening-level estimates for preliminary evaluation. Contact a licensed Professional Engineer for detailed thermal design and equipment specifications.
          </p>
        </div>
      </div>

      {/* Equipment Summary */}
      <EquipmentTable results={results} />

      {/* Comparison Chart */}
      <ComparisonChart inputs={inputs} results={results} />

      {/* Download Button */}
      <button
        onClick={onDownloadPDF}
        className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download PDF Report
      </button>
    </div>
  )
}
