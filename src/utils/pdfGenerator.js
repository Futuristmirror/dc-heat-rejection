export async function generatePDF(inputs, results, userInfo) {
  const html2pdf = (await import('html2pdf.js')).default

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

  const content = document.createElement('div')
  content.innerHTML = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; padding: 40px; max-width: 800px;">
      <div style="border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #0c4a6e; font-size: 24px; margin: 0;">Data Center Cooling Report</h1>
        <p style="color: #64748b; margin: 8px 0 0 0; font-size: 14px;">Franc Engineering | ${new Date().toLocaleDateString()}</p>
        ${userInfo?.projectName ? `<p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Project: ${userInfo.projectName}</p>` : ''}
      </div>

      <h2 style="color: #0c4a6e; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Design Inputs</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
        <tr style="background: #f8fafc;">
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">IT Load</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${inputs.itLoad} MW</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">Target PUE</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${inputs.pue}</td>
        </tr>
        <tr style="background: #f8fafc;">
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">Climate Zone</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${climateLabel} (${inputs.dryBulbTemp}°F DB / ${inputs.wetBulbTemp}°F WB)</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">Cooling Approach</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${coolingLabel}</td>
        </tr>
        <tr style="background: #f8fafc;">
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">Supply/Return Air</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${inputs.supplyAirTemp}°F / ${inputs.returnAirTemp}°F</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">Redundancy</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${results.redundancyLabel}</td>
        </tr>
      </table>

      <h2 style="color: #0c4a6e; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Calculation Results</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
        <thead>
          <tr style="background: #0284c7; color: white;">
            <th style="padding: 10px 12px; text-align: left;">Parameter</th>
            <th style="padding: 10px 12px; text-align: right;">Value</th>
            <th style="padding: 10px 12px; text-align: left;">Unit</th>
            <th style="padding: 10px 12px; text-align: left;">Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">IT Load</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${inputs.itLoad.toFixed(1)}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">MW</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">User input</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Total Facility Load</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${results.totalFacilityLoad.toFixed(1)}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">MW</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">At PUE ${inputs.pue}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Heat Rejection Load</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${results.heatRejectionLoad.toFixed(1)}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">MW thermal</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Including losses</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Cooling Capacity Required</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${formatNumber(results.coolingCapacityTons)}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">tons</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;"></td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Chiller Quantity</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${results.chillerCount} × ${formatNumber(results.chillerSize)}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">tons</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${results.redundancyLabel} redundancy</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Cooling Tower Capacity</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${formatNumber(results.coolingTowerCapacity)}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">tons</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">10% margin</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Data Hall Airflow</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${formatNumber(results.airflowCFM)}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">CFM</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">At ${inputs.returnAirTemp - inputs.supplyAirTemp}°F rise</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Chilled Water Flow</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${formatNumber(results.chilledWaterFlow)}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">GPM</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${inputs.chilledWaterReturn - inputs.chilledWaterSupply}°F delta</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Condenser Water Flow</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${formatNumber(results.condenserWaterFlow)}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">GPM</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">10°F range</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Makeup Water</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${results.makeupGPM}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">GPM</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${coolingLabel}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Annual Water Use</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${results.annualWaterMillionGal}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Million gal</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Estimated</td>
          </tr>
        </tbody>
      </table>

      <h2 style="color: #0c4a6e; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Equipment Summary</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
        <thead>
          <tr style="background: #0284c7; color: white;">
            <th style="padding: 10px 12px; text-align: left;">Equipment</th>
            <th style="padding: 10px 12px; text-align: right;">Quantity</th>
            <th style="padding: 10px 12px; text-align: right;">Size</th>
            <th style="padding: 10px 12px; text-align: left;">Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Centrifugal Chillers</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${results.chillerCount}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${formatNumber(results.chillerSize)} tons</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${results.redundancyLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Cooling Towers</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${results.towerCount}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${formatNumber(results.towerSize)} tons</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${results.redundancyLabel}, induced draft</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">CRAH Units</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${results.crahCount}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${formatNumber(results.crahSize)} CFM</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Based on density</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Chilled Water Pumps</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${results.pumpCount}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">${results.pumpHP} HP</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Variable speed</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #0284c7;">
        <h3 style="color: #0c4a6e; font-size: 14px; margin: 0 0 8px 0;">Methodology</h3>
        <p style="font-size: 11px; color: #64748b; line-height: 1.6; margin: 0 0 12px 0;">
          This report provides preliminary screening-level estimates for data center cooling system sizing.
          Calculations use standard ASHRAE relationships for heat rejection, airflow, and water consumption.
          Results are suitable for early-stage feasibility evaluation and should not replace detailed engineering analysis.
        </p>
        <p style="font-size: 12px; color: #0c4a6e; font-weight: 600; margin: 0;">
          For detailed thermal design and PE review, contact Franc Engineering
        </p>
        <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">
          franceng.com | info@franceng.com
        </p>
      </div>
    </div>
  `

  const opt = {
    margin: [0.5, 0.5],
    filename: `DC_Cooling_Report_${inputs.itLoad}MW.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }

  return html2pdf().set(opt).from(content).save()
}
