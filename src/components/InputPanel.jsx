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

function Card({ title, badge, collapsed, onToggle, children }) {
  const isCollapsible = typeof onToggle === 'function'
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div
        className={`bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between ${isCollapsible ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-[0.9375rem] font-semibold text-gray-800 m-0">{title}</h2>
          {badge && (
            <span className={`text-[0.6875rem] font-semibold uppercase px-2 py-0.5 rounded-full ${
              badge === 'Required'
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}>
              {badge}
            </span>
          )}
        </div>
        {isCollapsible && (
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${collapsed ? '' : 'rotate-180'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
      {!collapsed && <div className="p-5 space-y-4">{children}</div>}
    </div>
  )
}

function FormField({ label, hint, unit, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {unit ? (
        <div className="flex">
          {children}
          <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
            {unit}
          </span>
        </div>
      ) : (
        children
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
const inputWithUnitClass = "w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
const selectClass = inputClass + " bg-white"

export default function InputPanel({ inputs, onChange }) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const selectedClimate = climateZones.find(z => z.id === inputs.climateZone)

  const handleChange = (field, value) => {
    const updates = { [field]: value }
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
    <div className="space-y-4">
      {/* Primary Configuration */}
      <Card title="Configuration" badge="Required">
        <FormField label="IT Load" unit="MW" hint="Range: 0.5 – 500 MW">
          <input
            type="number"
            min="0.5"
            max="500"
            step="0.5"
            value={inputs.itLoad}
            onChange={e => handleChange('itLoad', parseFloat(e.target.value) || 0)}
            className={inputWithUnitClass}
          />
        </FormField>

        <FormField label="Target PUE">
          <select
            value={inputs.pue}
            onChange={e => handleChange('pue', parseFloat(e.target.value))}
            className={selectClass}
          >
            {pueOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Location / Climate Zone"
          hint={selectedClimate ? `Design: ${selectedClimate.dryBulb}°F DB / ${selectedClimate.wetBulb}°F WB` : undefined}
        >
          <select
            value={inputs.climateZone}
            onChange={e => handleChange('climateZone', e.target.value)}
            className={selectClass}
          >
            {climateZones.map(z => (
              <option key={z.id} value={z.id}>
                {z.label} — {z.examples}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Cooling Approach">
          <select
            value={inputs.coolingApproach}
            onChange={e => handleChange('coolingApproach', e.target.value)}
            className={selectClass}
          >
            {coolingOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FormField>
      </Card>

      {/* Advanced Options */}
      <Card
        title="Advanced Options"
        badge="Optional"
        collapsed={!showAdvanced}
        onToggle={() => setShowAdvanced(!showAdvanced)}
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Dry Bulb Temp" unit="°F">
            <input
              type="number"
              value={inputs.dryBulbTemp}
              onChange={e => handleChange('dryBulbTemp', parseFloat(e.target.value) || 0)}
              className={inputWithUnitClass}
            />
          </FormField>
          <FormField label="Wet Bulb Temp" unit="°F">
            <input
              type="number"
              value={inputs.wetBulbTemp}
              onChange={e => handleChange('wetBulbTemp', parseFloat(e.target.value) || 0)}
              className={inputWithUnitClass}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Supply Air Temp" unit="°F">
            <input
              type="number"
              value={inputs.supplyAirTemp}
              onChange={e => handleChange('supplyAirTemp', parseFloat(e.target.value) || 0)}
              className={inputWithUnitClass}
            />
          </FormField>
          <FormField label="Return Air Temp" unit="°F">
            <input
              type="number"
              value={inputs.returnAirTemp}
              onChange={e => handleChange('returnAirTemp', parseFloat(e.target.value) || 0)}
              className={inputWithUnitClass}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="CHW Supply" unit="°F">
            <input
              type="number"
              value={inputs.chilledWaterSupply}
              onChange={e => handleChange('chilledWaterSupply', parseFloat(e.target.value) || 0)}
              className={inputWithUnitClass}
            />
          </FormField>
          <FormField label="CHW Return" unit="°F">
            <input
              type="number"
              value={inputs.chilledWaterReturn}
              onChange={e => handleChange('chilledWaterReturn', parseFloat(e.target.value) || 0)}
              className={inputWithUnitClass}
            />
          </FormField>
        </div>

        <FormField label="Redundancy">
          <select
            value={inputs.redundancy}
            onChange={e => handleChange('redundancy', e.target.value)}
            className={selectClass}
          >
            {redundancyOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FormField>
      </Card>
    </div>
  )
}
