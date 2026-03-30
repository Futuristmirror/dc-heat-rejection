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

  const results = useMemo(() => {
    if (inputs.itLoad <= 0) return null
    return calculate(inputs)
  }, [inputs])

  const handleInputChange = (updates) => {
    setInputs(prev => ({ ...prev, ...updates }))
  }

  const handleDownloadPDF = () => {
    setShowEmailModal(true)
  }

  const handleEmailSubmit = async (userInfo) => {
    await generatePDF(inputs, results, userInfo)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter',system-ui,sans-serif]">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center font-bold text-lg">
                F
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold leading-tight m-0">
                  Data Center Heat Rejection Calculator
                </h1>
                <p className="text-xs text-white/60 hidden sm:block m-0">Franc Engineering</p>
              </div>
            </div>
            <a
              href="https://franceng.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/70 hover:text-white transition-colors hidden sm:block"
            >
              franceng.com
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 sm:p-6 lg:sticky lg:top-6">
              <InputPanel inputs={inputs} onChange={handleInputChange} />
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-8">
            {results ? (
              <ResultsPanel
                results={results}
                inputs={inputs}
                onDownloadPDF={handleDownloadPDF}
              />
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
                <div className="text-slate-400 mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm m-0">Enter an IT load to see results.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1e3a5f] text-white/60 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-4">
              <a href="https://franceng.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                franceng.com
              </a>
              <span className="text-white/30">|</span>
              <a href="mailto:info@franceng.com" className="hover:text-white transition-colors">
                info@franceng.com
              </a>
            </div>
            <p className="text-xs text-white/40 m-0">
              Screening-level estimates for preliminary evaluation. Not a substitute for detailed engineering.
            </p>
          </div>
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
