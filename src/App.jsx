import { useState, useMemo } from 'react'
import InputPanel from './components/InputPanel'
import ResultsPanel from './components/ResultsPanel'
import EmailModal from './components/EmailModal'
import { calculate } from './utils/calculations'
import { getClimateZone } from './utils/climateData'
import { generatePDF } from './utils/pdfGenerator'

const defaultClimate = getClimateZone('temperate')

const defaultInputs = {
  itLoad: 10,
  pue: 1.4,
  climateZone: 'temperate',
  coolingApproach: 'chilled-water',
  dryBulbTemp: defaultClimate.dryBulb,
  wetBulbTemp: defaultClimate.wetBulb,
  supplyAirTemp: 55,
  returnAirTemp: 95,
  chilledWaterSupply: 44,
  chilledWaterReturn: 56,
  redundancy: 'n+1',
}

export default function App() {
  const [inputs, setInputs] = useState(defaultInputs)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [hasCalculated, setHasCalculated] = useState(false)

  const results = useMemo(() => {
    if (!hasCalculated || inputs.itLoad <= 0) return null
    return calculate(inputs)
  }, [inputs, hasCalculated])

  const handleInputChange = (updates) => {
    setInputs(prev => ({ ...prev, ...updates }))
    if (hasCalculated) {
      setHasCalculated(true) // Re-calculate live after first click
    }
  }

  const handleCalculate = () => {
    setHasCalculated(true)
  }

  const handleDownloadPDF = () => {
    setShowEmailModal(true)
  }

  const handleEmailSubmit = async (userInfo) => {
    await generatePDF(inputs, results, userInfo)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-[60px]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <div>
              <div className="text-[0.9375rem] font-semibold text-gray-900 leading-tight">Franc Engineering</div>
              <div className="text-xs text-gray-500 leading-tight">Data Center Cooling Calculator</div>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              Data Center Tools
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-5 py-8">
        {/* Intro */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-2 leading-tight">Data Center Cooling Calculator</h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
            Estimate cooling system requirements for data center projects based on IT load, climate zone, and cooling approach.
            Calculate cooling loads, equipment sizing, airflow requirements, and water consumption.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          {/* Input Column */}
          <div className="space-y-4">
            <InputPanel inputs={inputs} onChange={handleInputChange} />

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold rounded-xl text-base transition-colors shadow-sm"
            >
              Calculate Cooling
            </button>
          </div>

          {/* Results Column */}
          <div className="lg:sticky lg:top-[80px] lg:self-start space-y-4">
            {results ? (
              <ResultsPanel
                results={results}
                inputs={inputs}
                onDownloadPDF={handleDownloadPDF}
              />
            ) : (
              /* Placeholder State */
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 rounded-t-xl">
                  <h2 className="text-[0.9375rem] font-semibold text-gray-800 m-0">Results</h2>
                </div>
                <div className="px-6 py-16 text-center">
                  <div className="text-gray-300 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 m-0">Configure your inputs and click <strong>Calculate</strong> to see cooling results.</p>
                </div>
              </div>
            )}

            {/* CTA Card */}
            <div className="rounded-xl border border-sky-200 p-5" style={{ background: 'linear-gradient(135deg, #f0f9ff, white)' }}>
              <h3 className="text-base font-semibold text-sky-900 mb-1.5">Need Detailed Thermal Design?</h3>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Get PE-stamped cooling system design, detailed thermal analysis, and construction-ready specifications from a licensed Professional Engineer.
              </p>
              <a
                href="mailto:caseym@franceng.com?subject=Data%20Center%20Cooling%20-%20Engineering%20Inquiry"
                onClick={() => window.open('https://franceng.com/contact/', '_blank')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Contact Franc Engineering
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-10">
        <div className="max-w-[1200px] mx-auto px-5 text-center">
          <p className="text-sm text-gray-400 m-0">
            &copy; {new Date().getFullYear()} Franc Engineering. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2 m-0 max-w-lg mx-auto leading-relaxed">
            This tool provides screening-level estimates for preliminary evaluation only. Results should not be used as a substitute for detailed engineering analysis by a licensed Professional Engineer.
          </p>
        </div>
      </footer>

      {/* Email Modal */}
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
      />
    </div>
  )
}
