import { useState } from 'react'
import { climateZones } from '../utils/climateData'

const pueOptions = [1.2, 1.3, 1.4, 1.5, 1.6]
const coolingOptions = [
  { value: 'chilled-water', label: 'Chilled Water' },
  { value: 'air-cooled', label: 'Air-Cooled' },
  { value: 'evaporative', label: 'Evaporative' },
  { value: 'hybrid', label: 'Hybrid' },
]
const redundancyOptions = [
  { value: 'n', label: 'N (No redundancy)' },
  { value: 'n+1', label: 'N+1' },
  { value: '2n', label: '2N' },
]

export default function InputPanel({ inputs, onChange }) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const selectedClimate = climateZones.find(z => z.id === inputs.climateZone)

  const handleChange = (field, value) => {
    const updates = { [field]: value }

    // Auto-update temps when climate zone changes
    if (field === 'climateZone') {
      const zone = climateZones.find(z => z.id === value)
      if (zone) {
        updates.dryBulbTemp = zone.dryBulb
        updates.wetBulbTemp = zone.wetBulb
      }
    }

    onChange(updates)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Design Inputs</h2>

        {/* IT Load */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            IT Load (MW)
          </label>
          <input
            type="number"
            min="0.5"
            max="500"
            step="0.5"
            value={inputs.itLoad}
            onChange={e => handleChange('itLoad', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">Range: 0.5 - 500 MW</p>
        </div>

        {/* Target PUE */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Target PUE
          </label>
          <select
            value={inputs.pue}
            onChange={e => handleChange('pue', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm bg-white"
          >
            {pueOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Climate Zone */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Location / Climate Zone
          </label>
          <select
            value={inputs.climateZone}
            onChange={e => handleChange('climateZone', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm bg-white"
          >
            {climateZones.map(z => (
              <option key={z.id} value={z.id}>
                {z.label} — {z.examples}
              </option>
            ))}
          </select>
          {selectedClimate && (
            <p className="text-xs text-slate-500 mt-1">
              Design conditions: {selectedClimate.dryBulb}°F dry bulb / {selectedClimate.wetBulb}°F wet bulb
            </p>
          )}
        </div>

        {/* Cooling Approach */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Cooling Approach
          </label>
          <select
            value={inputs.coolingApproach}
            onChange={e => handleChange('coolingApproach', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm bg-white"
          >
            {coolingOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="border-t border-slate-200 pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-[#1e3a5f] hover:text-[#2d5a8e] transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 pl-2 border-l-2 border-slate-200">
            {/* Design Temperatures */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Design Dry Bulb (°F)
                </label>
                <input
                  type="number"
                  value={inputs.dryBulbTemp}
                  onChange={e => handleChange('dryBulbTemp', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Design Wet Bulb (°F)
                </label>
                <input
                  type="number"
                  value={inputs.wetBulbTemp}
                  onChange={e => handleChange('wetBulbTemp', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
                />
              </div>
            </div>

            {/* Air Temperatures */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Supply Air Temp (°F)
                </label>
                <input
                  type="number"
                  value={inputs.supplyAirTemp}
                  onChange={e => handleChange('supplyAirTemp', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Return Air Temp (°F)
                </label>
                <input
                  type="number"
                  value={inputs.returnAirTemp}
                  onChange={e => handleChange('returnAirTemp', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
                />
              </div>
            </div>

            {/* Chilled Water Temps */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  CHW Supply (°F)
                </label>
                <input
                  type="number"
                  value={inputs.chilledWaterSupply}
                  onChange={e => handleChange('chilledWaterSupply', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  CHW Return (°F)
                </label>
                <input
                  type="number"
                  value={inputs.chilledWaterReturn}
                  onChange={e => handleChange('chilledWaterReturn', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm"
                />
              </div>
            </div>

            {/* Redundancy */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Redundancy
              </label>
              <select
                value={inputs.redundancy}
                onChange={e => handleChange('redundancy', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] text-sm bg-white"
              >
                {redundancyOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
