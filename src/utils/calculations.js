import { climateFactors } from './climateData'

const MW_TO_TONS = 284.35
const BTU_PER_KW = 3412
const AIR_CONSTANT = 1.08

// Heat rejection multiplier by cooling approach
const HEAT_REJECTION_FACTOR = {
  'air-cooled': 1.15,
  'chilled-water': 1.05,
  'evaporative': 1.08,
  'hybrid': 1.10,
}

export function calculate(inputs) {
  const {
    itLoad, // MW
    pue,
    climateZone,
    coolingApproach,
    dryBulbTemp,
    wetBulbTemp,
    supplyAirTemp = 55,
    returnAirTemp = 95,
    chilledWaterSupply = 44,
    chilledWaterReturn = 56,
    redundancy = 'n+1',
  } = inputs

  const itLoadKW = itLoad * 1000

  // Core heat balance
  const totalFacilityLoad = itLoad * pue // MW
  const coolingOverhead = totalFacilityLoad - itLoad // MW
  const heatRejectionFactor = HEAT_REJECTION_FACTOR[coolingApproach] || 1.10
  const heatRejectionLoad = itLoad * heatRejectionFactor // MW thermal

  // Cooling capacity in tons
  const coolingCapacityTons = heatRejectionLoad * MW_TO_TONS

  // Actual PUE based on selections
  const actualPUE = pue

  // Airflow requirements
  const deltaT = returnAirTemp - supplyAirTemp
  const airflowCFM = (itLoadKW * BTU_PER_KW) / (AIR_CONSTANT * deltaT)

  // Chilled water flow
  const chilledWaterDeltaT = chilledWaterReturn - chilledWaterSupply
  // GPM = tons * 24 / deltaT (rule of thumb)
  const chilledWaterFlow = (coolingCapacityTons * 24) / chilledWaterDeltaT

  // Condenser water
  const condenserRange = 10 // °F typical
  const condenserWaterFlow = (coolingCapacityTons * 24) / condenserRange

  // Chiller sizing
  const chillerSizes = [500, 750, 1000, 1500, 2000]
  const optimalChillerSize = chillerSizes.reduce((best, size) => {
    const count = Math.ceil(coolingCapacityTons / size)
    const bestCount = Math.ceil(coolingCapacityTons / best)
    // Prefer sizes that give 2-6 units
    if (count >= 2 && count <= 6) return size
    if (bestCount >= 2 && bestCount <= 6) return best
    return Math.abs(count - 4) < Math.abs(bestCount - 4) ? size : best
  }, 1000)

  const baseChillerCount = Math.ceil(coolingCapacityTons / optimalChillerSize)
  const redundancyAdd = redundancy === '2n' ? baseChillerCount : redundancy === 'n+1' ? 1 : 0
  const totalChillerCount = baseChillerCount + redundancyAdd

  // Cooling tower sizing (10% margin)
  const coolingTowerCapacity = Math.round(coolingCapacityTons * 1.1)
  const towerApproach = coolingApproach === 'air-cooled' ? (dryBulbTemp ? 20 : 20) : 8
  const towerRange = condenserRange

  // Base tower count matches chiller count for balance
  const baseTowerCount = baseChillerCount
  const totalTowerCount = baseTowerCount + redundancyAdd
  const towerUnitSize = Math.round(coolingTowerCapacity / baseTowerCount)

  // CRAH units (typically 40,000 CFM each)
  const crahSize = 40000
  const crahCount = Math.ceil(airflowCFM / crahSize)

  // Pump sizing
  const pumpCount = totalChillerCount
  const pumpHP = Math.round(chilledWaterFlow / pumpCount * 0.15) // rough HP estimate

  // Water consumption (evaporative systems)
  const heatRejectionBTU = heatRejectionLoad * 1000 * BTU_PER_KW
  const evaporationGPM = heatRejectionBTU / 8333
  const cyclesOfConcentration = 4
  const blowdownGPM = evaporationGPM / (cyclesOfConcentration - 1)
  const circulationRate = condenserWaterFlow
  const driftGPM = circulationRate * 0.0005
  const makeupGPM = evaporationGPM + blowdownGPM + driftGPM

  const climateFactor = climateFactors[climateZone] || 0.8
  const operatingHours = 8760 // 24/7 operation
  const annualWaterGallons = makeupGPM * 60 * operatingHours * climateFactor

  // For air-cooled, water consumption is zero
  const isWaterCooled = coolingApproach !== 'air-cooled'
  const actualMakeupGPM = isWaterCooled ? makeupGPM : 0
  const actualAnnualWater = isWaterCooled ? annualWaterGallons : 0

  // Dry cooler sizing (air-cooled)
  const dryCoolerCapacity = coolingApproach === 'air-cooled'
    ? heatRejectionLoad * 1.1
    : null

  return {
    // Primary results
    heatRejectionLoad: Math.round(heatRejectionLoad * 100) / 100,
    coolingCapacityTons: Math.round(coolingCapacityTons),
    actualPUE,
    totalFacilityLoad: Math.round(totalFacilityLoad * 100) / 100,
    coolingOverhead: Math.round(coolingOverhead * 100) / 100,

    // Detailed results
    airflowCFM: Math.round(airflowCFM),
    chilledWaterFlow: Math.round(chilledWaterFlow),
    condenserWaterFlow: Math.round(condenserWaterFlow),
    makeupGPM: Math.round(actualMakeupGPM),
    annualWaterGallons: Math.round(actualAnnualWater),
    annualWaterMillionGal: Math.round(actualAnnualWater / 1e6 * 10) / 10,

    // Equipment
    chillerCount: totalChillerCount,
    chillerSize: optimalChillerSize,
    baseChillerCount,
    towerCount: totalTowerCount,
    towerSize: towerUnitSize,
    baseTowerCount,
    crahCount,
    crahSize,
    pumpCount,
    pumpHP: Math.round(pumpHP),
    coolingTowerCapacity,

    // Tower parameters
    towerApproach,
    towerRange,

    // Air-cooled
    dryCoolerCapacity: dryCoolerCapacity ? Math.round(dryCoolerCapacity * 100) / 100 : null,

    // Redundancy label
    redundancyLabel: redundancy === '2n' ? '2N' : redundancy === 'n+1' ? 'N+1' : 'N',

    // Climate
    climateFactor,
    evaporationGPM: isWaterCooled ? Math.round(evaporationGPM) : 0,
    blowdownGPM: isWaterCooled ? Math.round(blowdownGPM) : 0,
    driftGPM: isWaterCooled ? Math.round(driftGPM * 10) / 10 : 0,
  }
}

// Compare all cooling approaches for the same inputs
export function compareApproaches(inputs) {
  const approaches = ['air-cooled', 'chilled-water', 'evaporative', 'hybrid']
  return approaches.map(approach => ({
    approach,
    label: {
      'air-cooled': 'Air-Cooled',
      'chilled-water': 'Chilled Water',
      'evaporative': 'Evaporative',
      'hybrid': 'Hybrid',
    }[approach],
    results: calculate({ ...inputs, coolingApproach: approach }),
  }))
}
