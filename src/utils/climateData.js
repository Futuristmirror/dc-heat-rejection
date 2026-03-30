export const climateZones = [
  {
    id: 'hot-humid',
    label: 'Hot-Humid',
    dryBulb: 95,
    wetBulb: 78,
    examples: 'Houston, Miami, New Orleans',
  },
  {
    id: 'hot-dry',
    label: 'Hot-Dry',
    dryBulb: 105,
    wetBulb: 70,
    examples: 'Phoenix, Las Vegas, El Paso',
  },
  {
    id: 'temperate',
    label: 'Temperate',
    dryBulb: 90,
    wetBulb: 73,
    examples: 'Atlanta, Dallas, Kansas City',
  },
  {
    id: 'cool',
    label: 'Cool',
    dryBulb: 85,
    wetBulb: 68,
    examples: 'Chicago, Denver, Salt Lake',
  },
  {
    id: 'cold',
    label: 'Cold',
    dryBulb: 80,
    wetBulb: 65,
    examples: 'Minneapolis, Buffalo, Fargo',
  },
  {
    id: 'mild',
    label: 'Mild',
    dryBulb: 85,
    wetBulb: 62,
    examples: 'San Francisco, Seattle, Portland',
  },
]

export const climateFactors = {
  'hot-humid': 0.9,
  'hot-dry': 1.1,
  'temperate': 0.8,
  'cool': 0.6,
  'cold': 0.5,
  'mild': 0.7,
}

export function getClimateZone(id) {
  return climateZones.find(z => z.id === id)
}
