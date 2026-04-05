export async function generatePDF(inputs, results, userInfo) {
  const module = await import('html2pdf.js')
  const html2pdf = module.default || module

  const formatNumber = (n) => {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
    return n.toLocaleString()
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

  // Build a self-contained HTML string
  const htmlStr = [
    '<div style="font-family:Helvetica,Arial,sans-serif;color:#1a1a2e;padding:32px;max-width:780px;font-size:13px;line-height:1.5;">',

    // Header
    '<div style="border-bottom:3px solid #0284c7;padding-bottom:16px;margin-bottom:24px;">',
    '<div style="font-size:22px;font-weight:bold;color:#0c4a6e;margin:0 0 6px 0;">Data Center Cooling Report</div>',
    '<div style="color:#64748b;font-size:13px;">Franc Engineering | ' + dateStr + '</div>',
    projectLine ? '<div style="color:#64748b;font-size:13px;">' + projectLine + '</div>' : '',
    '</div>',

    // Design Inputs
    '<div style="font-size:16px;font-weight:bold;color:#0c4a6e;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:12px;">Design Inputs</div>',
    '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">',
    tableRow('IT Load', inputs.itLoad + ' MW', true),
    tableRow('Target PUE', String(inputs.pue), false),
    tableRow('Climate Zone', climateLabel + ' (' + inputs.dryBulbTemp + '\u00B0F DB / ' + inputs.wetBulbTemp + '\u00B0F WB)', true),
    tableRow('Cooling Approach', coolingLabel, false),
    tableRow('Supply/Return Air', inputs.supplyAirTemp + '\u00B0F / ' + inputs.returnAirTemp + '\u00B0F', true),
    tableRow('Redundancy', results.redundancyLabel, false),
    '</table>',

    // Calculation Results
    '<div style="font-size:16px;font-weight:bold;color:#0c4a6e;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:12px;">Calculation Results</div>',
    '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">',
    '<tr style="background:#0284c7;color:white;">',
    '<th style="padding:8px 10px;text-align:left;">Parameter</th>',
    '<th style="padding:8px 10px;text-align:right;">Value</th>',
    '<th style="padding:8px 10px;text-align:left;">Unit</th>',
    '<th style="padding:8px 10px;text-align:left;">Notes</th>',
    '</tr>',
    resultRow('IT Load', inputs.itLoad.toFixed(1), 'MW', 'User input', true),
    resultRow('Total Facility Load', results.totalFacilityLoad.toFixed(1), 'MW', 'At PUE ' + inputs.pue, false),
    resultRow('Heat Rejection Load', results.heatRejectionLoad.toFixed(1), 'MW thermal', 'Including losses', true),
    resultRow('Cooling Capacity Required', formatNumber(results.coolingCapacityTons), 'tons', '', false),
    resultRow('Chiller Quantity', results.chillerCount + ' x ' + formatNumber(results.chillerSize), 'tons', results.redundancyLabel + ' redundancy', true),
    resultRow('Cooling Tower Capacity', formatNumber(results.coolingTowerCapacity), 'tons', '10% margin', false),
    resultRow('Data Hall Airflow', formatNumber(results.airflowCFM), 'CFM', 'At ' + deltaT + '\u00B0F rise', true),
    resultRow('Chilled Water Flow', formatNumber(results.chilledWaterFlow), 'GPM', chwDelta + '\u00B0F delta', false),
    resultRow('Condenser Water Flow', formatNumber(results.condenserWaterFlow), 'GPM', '10\u00B0F range', true),
    resultRow('Makeup Water', formatNumber(results.makeupGPM), 'GPM', coolingLabel, false),
    resultRow('Annual Water Use', String(results.annualWaterMillionGal), 'Million gal', 'Estimated', true),
    '</table>',

    // Equipment Summary
    '<div style="font-size:16px;font-weight:bold;color:#0c4a6e;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:12px;">Equipment Summary</div>',
    '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">',
    '<tr style="background:#0284c7;color:white;">',
    '<th style="padding:8px 10px;text-align:left;">Equipment</th>',
    '<th style="padding:8px 10px;text-align:right;">Quantity</th>',
    '<th style="padding:8px 10px;text-align:right;">Size</th>',
    '<th style="padding:8px 10px;text-align:left;">Notes</th>',
    '</tr>',
    equipRow('Centrifugal Chillers', results.chillerCount, formatNumber(results.chillerSize) + ' tons', results.redundancyLabel, true),
    equipRow('Cooling Towers', results.towerCount, formatNumber(results.towerSize) + ' tons', results.redundancyLabel + ', induced draft', false),
    equipRow('CRAH Units', results.crahCount, formatNumber(results.crahSize) + ' CFM', 'Based on density', true),
    equipRow('Chilled Water Pumps', results.pumpCount, results.pumpHP + ' HP', 'Variable speed', false),
    '</table>',

    // Footer
    '<div style="margin-top:32px;padding-top:16px;border-top:2px solid #0284c7;">',
    '<div style="font-size:13px;font-weight:bold;color:#0c4a6e;margin-bottom:6px;">Methodology</div>',
    '<div style="font-size:11px;color:#64748b;margin-bottom:10px;">This report provides preliminary screening-level estimates for data center cooling system sizing. Calculations use standard ASHRAE relationships for heat rejection, airflow, and water consumption. Results are suitable for early-stage feasibility evaluation and should not replace detailed engineering analysis.</div>',
    '<div style="font-size:12px;color:#0c4a6e;font-weight:bold;">For detailed thermal design and PE review, contact Franc Engineering</div>',
    '<div style="font-size:11px;color:#64748b;margin-top:4px;">franceng.com | caseym@franceng.com</div>',
    '</div>',

    '</div>',
  ].join('')

  // Create wrapper element
  const wrapper = document.createElement('div')
  wrapper.innerHTML = htmlStr
  wrapper.style.position = 'fixed'
  wrapper.style.left = '-9999px'
  wrapper.style.top = '0'
  wrapper.style.width = '800px'
  wrapper.style.background = 'white'
  document.body.appendChild(wrapper)

  // Small delay to ensure DOM rendering completes
  await new Promise(r => setTimeout(r, 100))

  const opt = {
    margin: [0.4, 0.4],
    filename: 'DC_Cooling_Report_' + inputs.itLoad + 'MW.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, width: 800 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }

  try {
    await html2pdf().set(opt).from(wrapper.firstChild).save()
  } finally {
    document.body.removeChild(wrapper)
  }
}

function tableRow(label, value, shaded) {
  const bg = shaded ? 'background:#f8fafc;' : ''
  return '<tr style="' + bg + '">' +
    '<td style="padding:7px 10px;border:1px solid #e2e8f0;font-weight:600;">' + label + '</td>' +
    '<td style="padding:7px 10px;border:1px solid #e2e8f0;">' + value + '</td>' +
    '</tr>'
}

function resultRow(label, value, unit, notes, shaded) {
  const bg = shaded ? 'background:#f8fafc;' : ''
  return '<tr style="' + bg + '">' +
    '<td style="padding:7px 10px;border:1px solid #e2e8f0;">' + label + '</td>' +
    '<td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:right;font-weight:600;">' + value + '</td>' +
    '<td style="padding:7px 10px;border:1px solid #e2e8f0;">' + unit + '</td>' +
    '<td style="padding:7px 10px;border:1px solid #e2e8f0;color:#64748b;">' + notes + '</td>' +
    '</tr>'
}

function equipRow(name, qty, size, notes, shaded) {
  const bg = shaded ? 'background:#f8fafc;' : ''
  return '<tr style="' + bg + '">' +
    '<td style="padding:7px 10px;border:1px solid #e2e8f0;">' + name + '</td>' +
    '<td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:right;">' + qty + '</td>' +
    '<td style="padding:7px 10px;border:1px solid #e2e8f0;text-align:right;">' + size + '</td>' +
    '<td style="padding:7px 10px;border:1px solid #e2e8f0;color:#64748b;">' + notes + '</td>' +
    '</tr>'
}
