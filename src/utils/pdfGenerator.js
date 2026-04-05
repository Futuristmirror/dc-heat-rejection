export async function generatePDF(inputs, results, userInfo) {
  const module = await import('html2pdf.js')
  const html2pdf = module.default || module

  const formatNumber = (n) => {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
    return n.toLocaleString('en-US')
  }

  const coolingLabel = {
    'air-cooled': 'Air-Cooled',
    'chilled-water': 'Chilled Water',
    'evaporative': 'Evaporative',
    'hybrid': 'Hybrid',
  }[inputs.coolingApproach] || inputs.coolingApproach

  const climateLabel = {
    'hot-humid': 'Hot-Humid',
    'hot-dry': 'Hot-Dry',
    'temperate': 'Temperate',
    'cool': 'Cool',
    'cold': 'Cold',
    'mild': 'Mild',
  }[inputs.climateZone] || inputs.climateZone

  const deltaT = inputs.returnAirTemp - inputs.supplyAirTemp
  const chwDelta = inputs.chilledWaterReturn - inputs.chilledWaterSupply
  const dateStr = new Date().toLocaleDateString()
  const projectLine = userInfo?.projectName ? 'Project: ' + userInfo.projectName : ''

  var coolingSVG = '<svg viewBox="0 0 80 80" width="70" height="70" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="40" cy="40" r="38" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1"/>' +
    '<line x1="40" y1="10" x2="40" y2="70" stroke="#0284c7" stroke-width="2.5"/>' +
    '<line x1="14" y1="25" x2="66" y2="55" stroke="#0284c7" stroke-width="2.5"/>' +
    '<line x1="14" y1="55" x2="66" y2="25" stroke="#0284c7" stroke-width="2.5"/>' +
    '<line x1="40" y1="10" x2="34" y2="18" stroke="#0284c7" stroke-width="2"/><line x1="40" y1="10" x2="46" y2="18" stroke="#0284c7" stroke-width="2"/>' +
    '<line x1="40" y1="70" x2="34" y2="62" stroke="#0284c7" stroke-width="2"/><line x1="40" y1="70" x2="46" y2="62" stroke="#0284c7" stroke-width="2"/>' +
    '<line x1="14" y1="25" x2="22" y2="21" stroke="#0284c7" stroke-width="2"/><line x1="14" y1="25" x2="18" y2="33" stroke="#0284c7" stroke-width="2"/>' +
    '<line x1="66" y1="55" x2="58" y2="59" stroke="#0284c7" stroke-width="2"/><line x1="66" y1="55" x2="62" y2="47" stroke="#0284c7" stroke-width="2"/>' +
    '<line x1="14" y1="55" x2="22" y2="59" stroke="#0284c7" stroke-width="2"/><line x1="14" y1="55" x2="18" y2="47" stroke="#0284c7" stroke-width="2"/>' +
    '<line x1="66" y1="25" x2="58" y2="21" stroke="#0284c7" stroke-width="2"/><line x1="66" y1="25" x2="62" y2="33" stroke="#0284c7" stroke-width="2"/>' +
    '<circle cx="40" cy="40" r="4" fill="#0284c7"/></svg>'

  var coolingTowerSVG = '<svg viewBox="0 0 120 120" width="90" height="90" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs>' +
    '<path d="M35 95 L45 35 L75 35 L85 95 Z" fill="url(#tg)" opacity="0.9"/>' +
    '<rect x="42" y="30" width="36" height="8" rx="2" fill="#0369a1"/>' +
    '<path d="M52 28 Q54 20 52 14" stroke="#7dd3fc" stroke-width="2" fill="none" opacity="0.7"/>' +
    '<path d="M60 26 Q62 16 60 8" stroke="#7dd3fc" stroke-width="2.5" fill="none" opacity="0.8"/>' +
    '<path d="M68 28 Q70 20 68 14" stroke="#7dd3fc" stroke-width="2" fill="none" opacity="0.7"/>' +
    '<circle cx="50" cy="12" r="4" fill="#bae6fd" opacity="0.5"/><circle cx="60" cy="6" r="5" fill="#bae6fd" opacity="0.4"/><circle cx="70" cy="12" r="4" fill="#bae6fd" opacity="0.5"/>' +
    '<line x1="48" y1="50" x2="72" y2="50" stroke="white" stroke-width="1" opacity="0.3"/>' +
    '<line x1="46" y1="60" x2="74" y2="60" stroke="white" stroke-width="1" opacity="0.3"/>' +
    '<line x1="44" y1="70" x2="76" y2="70" stroke="white" stroke-width="1" opacity="0.3"/>' +
    '<rect x="32" y="95" width="56" height="8" rx="2" fill="#075985"/>' +
    '<rect x="85" y="97" width="20" height="4" rx="1" fill="#0369a1"/></svg>'

  var maxVal = Math.max(results.heatRejectionLoad, results.totalFacilityLoad)
  var barScale = function(v) { return Math.round((v / maxVal) * 260) }
  var capacityChart = '<svg viewBox="0 0 400 80" width="400" height="80" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="75" y="5" width="' + barScale(inputs.itLoad) + '" height="18" rx="3" fill="#0284c7"/>' +
    '<text x="70" y="18" text-anchor="end" font-size="10" fill="#374151" font-family="Helvetica,Arial,sans-serif">IT Load</text>' +
    '<text x="' + (80 + barScale(inputs.itLoad)) + '" y="18" font-size="10" fill="#374151" font-family="Helvetica,Arial,sans-serif">' + inputs.itLoad.toFixed(1) + ' MW</text>' +
    '<rect x="75" y="28" width="' + barScale(results.totalFacilityLoad) + '" height="18" rx="3" fill="#38bdf8"/>' +
    '<text x="70" y="41" text-anchor="end" font-size="10" fill="#374151" font-family="Helvetica,Arial,sans-serif">Facility</text>' +
    '<text x="' + (80 + barScale(results.totalFacilityLoad)) + '" y="41" font-size="10" fill="#374151" font-family="Helvetica,Arial,sans-serif">' + results.totalFacilityLoad.toFixed(1) + ' MW</text>' +
    '<rect x="75" y="51" width="' + barScale(results.heatRejectionLoad) + '" height="18" rx="3" fill="#f59e0b"/>' +
    '<text x="70" y="64" text-anchor="end" font-size="10" fill="#374151" font-family="Helvetica,Arial,sans-serif">Heat Rej.</text>' +
    '<text x="' + (80 + barScale(results.heatRejectionLoad)) + '" y="64" font-size="10" fill="#374151" font-family="Helvetica,Arial,sans-serif">' + results.heatRejectionLoad.toFixed(1) + ' MW</text>' +
    '</svg>'

  var htmlStr = [
    '<div style="font-family:Helvetica,Arial,sans-serif;color:#1a1a2e;padding:24px 32px;max-width:760px;font-size:12px;line-height:1.35;">',

    // ===== PAGE 1 =====

    // Header
    '<div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #0284c7;padding-bottom:10px;margin-bottom:10px;">',
    '<div>',
    '<div style="font-size:20px;font-weight:bold;color:#0c4a6e;margin:0 0 2px 0;">Data Center Cooling Report</div>',
    '<div style="color:#64748b;font-size:11px;">Franc Engineering | ' + dateStr + '</div>',
    projectLine ? '<div style="color:#64748b;font-size:11px;">' + projectLine + '</div>' : '',
    '</div>',
    '<div>' + coolingSVG + '</div>',
    '</div>',

    // Results banner
    '<div style="background:linear-gradient(135deg,#0c4a6e,#0284c7);border-radius:8px;padding:12px 18px;margin-bottom:10px;color:white;display:flex;justify-content:space-around;text-align:center;">',
    '<div><div style="font-size:9px;opacity:0.8;margin-bottom:1px;">Total Heat Rejection</div><div style="font-size:20px;font-weight:bold;">' + results.heatRejectionLoad.toFixed(1) + '<span style="font-size:11px;font-weight:normal;opacity:0.8;"> MW</span></div></div>',
    '<div style="border-left:1px solid rgba(255,255,255,0.3);"></div>',
    '<div><div style="font-size:9px;opacity:0.8;margin-bottom:1px;">Cooling Capacity</div><div style="font-size:20px;font-weight:bold;">' + formatNumber(results.coolingCapacityTons) + '<span style="font-size:11px;font-weight:normal;opacity:0.8;"> tons</span></div></div>',
    '<div style="border-left:1px solid rgba(255,255,255,0.3);"></div>',
    '<div><div style="font-size:9px;opacity:0.8;margin-bottom:1px;">PUE</div><div style="font-size:20px;font-weight:bold;">' + inputs.pue + '</div></div>',
    '</div>',

    // Design Inputs - two columns
    '<div style="font-size:13px;font-weight:bold;color:#0c4a6e;border-bottom:1px solid #e2e8f0;padding-bottom:3px;margin-bottom:5px;">Design Inputs</div>',
    '<div style="display:flex;gap:6px;margin-bottom:8px;">',
    '<table style="flex:1;border-collapse:collapse;">',
    tRow('IT Load', inputs.itLoad + ' MW', true),
    tRow('Target PUE', String(inputs.pue), false),
    tRow('Climate Zone', climateLabel, true),
    '</table>',
    '<table style="flex:1;border-collapse:collapse;">',
    tRow('Cooling Approach', coolingLabel, true),
    tRow('Supply/Return Fluid Temp', inputs.supplyAirTemp + '\u00B0F / ' + inputs.returnAirTemp + '\u00B0F', false),
    tRow('Redundancy', results.redundancyLabel, true),
    '</table>',
    '</div>',

    // Load Breakdown
    '<div style="font-size:13px;font-weight:bold;color:#0c4a6e;border-bottom:1px solid #e2e8f0;padding-bottom:3px;margin-bottom:4px;">Load Breakdown</div>',
    '<div style="text-align:center;margin-bottom:6px;">' + capacityChart + '</div>',

    // Calculation Results
    '<div style="font-size:13px;font-weight:bold;color:#0c4a6e;border-bottom:1px solid #e2e8f0;padding-bottom:3px;margin-bottom:4px;">Calculation Results</div>',
    '<table style="width:100%;border-collapse:collapse;">',
    '<tr style="background:#0284c7;color:white;">',
    '<th style="vertical-align:middle;padding:4px 6px;text-align:left;font-size:10px;">Parameter</th>',
    '<th style="vertical-align:middle;padding:4px 6px;text-align:right;font-size:10px;">Value</th>',
    '<th style="vertical-align:middle;padding:4px 6px;text-align:left;font-size:10px;">Unit</th>',
    '<th style="vertical-align:middle;padding:4px 6px;text-align:left;font-size:10px;">Notes</th>',
    '</tr>',
    rRow('IT Load', inputs.itLoad.toFixed(1), 'MW', 'User input', true),
    rRow('Total Facility Load', results.totalFacilityLoad.toFixed(1), 'MW', 'At PUE ' + inputs.pue, false),
    rRow('Heat Rejection Load', results.heatRejectionLoad.toFixed(1), 'MW thermal', 'Including losses', true),
    rRow('Cooling Capacity', formatNumber(results.coolingCapacityTons), 'tons', '', false),
    rRow('Chiller Quantity', results.chillerCount + ' x ' + formatNumber(results.chillerSize), 'tons', results.redundancyLabel + ' redundancy', true),
    rRow('Cooling Tower Capacity', formatNumber(results.coolingTowerCapacity), 'tons', '10% margin', false),
    rRow('Data Hall Airflow', formatNumber(results.airflowCFM), 'CFM', 'At ' + deltaT + '\u00B0F rise', true),
    rRow('Chilled Water Flow', formatNumber(results.chilledWaterFlow), 'GPM', chwDelta + '\u00B0F delta', false),
    rRow('Condenser Water Flow', formatNumber(results.condenserWaterFlow), 'GPM', '10\u00B0F range', true),
    rRow('Makeup Water', formatNumber(results.makeupGPM), 'GPM', coolingLabel, false),
    rRow('Annual Water Use', String(results.annualWaterMillionGal), 'Million gal', 'Estimated', true),
    '</table>',

    // ===== SPACER - push page 2 content onto next page =====
    '<div style="height:420px;"></div>',

    // ===== PAGE 2 =====

    // Page 2 Header
    '<div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #0284c7;padding-bottom:12px;margin-bottom:18px;">',
    '<div>',
    '<div style="font-size:18px;font-weight:bold;color:#0c4a6e;">Equipment Summary &amp; Specifications</div>',
    '<div style="color:#64748b;font-size:11px;">Franc Engineering | ' + dateStr + '</div>',
    '</div>',
    '<div>' + coolingTowerSVG + '</div>',
    '</div>',

    // Equipment Table
    '<div style="font-size:14px;font-weight:bold;color:#0c4a6e;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:8px;">Major Equipment</div>',
    '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">',
    '<tr style="background:#0284c7;color:white;">',
    '<th style="vertical-align:middle;padding:7px 10px;text-align:left;font-size:11px;">Equipment</th>',
    '<th style="vertical-align:middle;padding:7px 10px;text-align:right;font-size:11px;">Quantity</th>',
    '<th style="vertical-align:middle;padding:7px 10px;text-align:right;font-size:11px;">Size</th>',
    '<th style="vertical-align:middle;padding:7px 10px;text-align:left;font-size:11px;">Notes</th>',
    '</tr>',
    eRow('Centrifugal Chillers', results.chillerCount, formatNumber(results.chillerSize) + ' tons', results.redundancyLabel, true),
    eRow('Cooling Towers', results.towerCount, formatNumber(results.towerSize) + ' tons', results.redundancyLabel + ', induced draft', false),
    eRow('CRAH Units', results.crahCount, formatNumber(results.crahSize) + ' CFM', 'Based on density', true),
    eRow('Chilled Water Pumps', results.pumpCount, results.pumpHP + ' HP', 'Variable speed', false),
    '</table>',

    // Water Consumption
    '<div style="font-size:14px;font-weight:bold;color:#0c4a6e;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:8px;">Water Consumption</div>',
    '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">',
    tRow('Evaporation Rate', results.evaporationGPM + ' GPM', true),
    tRow('Blowdown', results.blowdownGPM + ' GPM', false),
    tRow('Drift Loss', results.driftGPM + ' GPM', true),
    tRow('Total Makeup Water', results.makeupGPM + ' GPM', false),
    tRow('Annual Consumption', results.annualWaterMillionGal + ' Million gallons', true),
    tRow('Climate Factor', results.climateFactor + ' (' + climateLabel + ')', false),
    '</table>',

    // Design Conditions
    '<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 18px;margin-bottom:20px;">',
    '<div style="font-size:13px;font-weight:bold;color:#0c4a6e;margin-bottom:6px;">Design Conditions</div>',
    '<div style="display:flex;gap:28px;font-size:11px;color:#374151;">',
    '<div><span style="color:#64748b;">Dry Bulb:</span> ' + inputs.dryBulbTemp + '\u00B0F</div>',
    '<div><span style="color:#64748b;">Wet Bulb:</span> ' + inputs.wetBulbTemp + '\u00B0F</div>',
    '<div><span style="color:#64748b;">Supply Fluid:</span> ' + inputs.supplyAirTemp + '\u00B0F</div>',
    '<div><span style="color:#64748b;">Return Fluid:</span> ' + inputs.returnAirTemp + '\u00B0F</div>',
    '<div><span style="color:#64748b;">CHW:</span> ' + inputs.chilledWaterSupply + '\u00B0F / ' + inputs.chilledWaterReturn + '\u00B0F</div>',
    '</div>',
    '</div>',

    // Methodology
    '<div style="padding-top:14px;border-top:2px solid #0284c7;">',
    '<div style="font-size:12px;font-weight:bold;color:#0c4a6e;margin-bottom:5px;">Methodology &amp; Disclaimer</div>',
    '<div style="font-size:10px;color:#64748b;margin-bottom:10px;line-height:1.5;">This report provides preliminary screening-level estimates for data center cooling system sizing based on standard ASHRAE relationships for heat rejection, airflow, and water consumption. Equipment counts and sizes are approximate and suitable for early-stage feasibility evaluation, site comparisons, and preliminary mechanical scoping. Results should not replace detailed engineering analysis by a licensed Professional Engineer.</div>',
    '</div>',

    // CTA Footer
    '<div style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;border-radius:8px;padding:14px 18px;margin-top:10px;display:flex;align-items:center;justify-content:space-between;">',
    '<div>',
    '<div style="font-size:13px;font-weight:bold;color:#0c4a6e;">Need PE-Stamped Thermal Design?</div>',
    '<div style="font-size:11px;color:#374151;margin-top:2px;">Contact Franc Engineering for detailed cooling system design and specifications.</div>',
    '</div>',
    '<div style="text-align:right;">',
    '<div style="font-size:12px;font-weight:bold;color:#0284c7;">caseym@franceng.com</div>',
    '<div style="font-size:10px;color:#64748b;">franceng.com</div>',
    '</div>',
    '</div>',

    '</div>',
  ].join('')

  var wrapper = document.createElement('div')
  wrapper.innerHTML = htmlStr
  wrapper.style.position = 'fixed'
  wrapper.style.left = '-9999px'
  wrapper.style.top = '0'
  wrapper.style.width = '760px'
  wrapper.style.background = 'white'
  document.body.appendChild(wrapper)

  await new Promise(function(r) { setTimeout(r, 300) })

  var opt = {
    margin: [0.4, 0.5],
    filename: 'DC_Cooling_Report_' + inputs.itLoad + 'MW.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, width: 760 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }

  try {
    await html2pdf().set(opt).from(wrapper.firstChild).save()
  } finally {
    document.body.removeChild(wrapper)
  }
}

function tRow(label, value, shaded) {
  var bg = shaded ? 'background:#f8fafc;' : ''
  var s = 'padding:5px 8px;border:1px solid #e2e8f0;vertical-align:middle;font-size:10px;'
  return '<tr style="' + bg + '"><td style="' + s + 'font-weight:600;">' + label + '</td><td style="' + s + '">' + value + '</td></tr>'
}

function rRow(label, value, unit, notes, shaded) {
  var bg = shaded ? 'background:#f8fafc;' : ''
  var s = 'padding:5px 7px;border:1px solid #e2e8f0;vertical-align:middle;font-size:10px;'
  return '<tr style="' + bg + '"><td style="' + s + '">' + label + '</td><td style="' + s + 'text-align:right;font-weight:600;">' + value + '</td><td style="' + s + '">' + unit + '</td><td style="' + s + 'color:#64748b;font-size:9px;">' + notes + '</td></tr>'
}

function eRow(name, qty, size, notes, shaded) {
  var bg = shaded ? 'background:#f8fafc;' : ''
  var s = 'padding:6px 10px;border:1px solid #e2e8f0;vertical-align:middle;font-size:11px;'
  return '<tr style="' + bg + '"><td style="' + s + '">' + name + '</td><td style="' + s + 'text-align:right;">' + qty + '</td><td style="' + s + 'text-align:right;">' + size + '</td><td style="' + s + 'color:#64748b;font-size:10px;">' + notes + '</td></tr>'
}
