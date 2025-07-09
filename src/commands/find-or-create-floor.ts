import { Floor } from '@/payload-types'

export async function findOrCreateFloor(
  payload: any,
  floorName: string,
  unmappedFloors: Set<string> = new Set(),
): Promise<Floor | null> {
  if (!floorName || floorName.trim() === '') return null

  const cleanFloorName = floorName.trim()

  // Predefined floor mapping
  const floorMapping: { [key: string]: string } = {
    // Direct matches
    B1: 'B1',
    B2: 'B2',
    GF: 'GF',
    UG: 'UG',
    MF: 'MF',
    '1F': '1F',
    '2F': '2F',
    '3F': '3F',
    '4F': '4F',
    '5F': '5F',
    '6F': '6F',
    '7F': '7F',
    '8F': '8F',

    // Common variations
    'basement 1': 'B1',
    'basement 2': 'B2',
    'ground floor': 'GF',
    'upper ground': 'UG',
    'mezzanine floor': 'MF',
    mezzanine: 'MF',
    'first floor': '1F',
    'second floor': '2F',
    'third floor': '3F',
    'fourth floor': '4F',
    'fifth floor': '5F',
    'sixth floor': '6F',
    'seventh floor': '7F',
    'eighth floor': '8F',
    M: 'MF',
    G: 'GF',
    BM1: 'B1',
    BM2: 'B2',

    // Number variations
    '1': '1F',
    '2': '2F',
    '3': '3F',
    '4': '4F',
    '5': '5F',
    '6': '6F',
    '7': '7F',
    '8': '8F',

    // With "Floor" suffix
    'B1 Floor': 'B1',
    'B2 Floor': 'B2',
    'GF Floor': 'GF',
    'UG Floor': 'UG',
    'MF Floor': 'MF',
    '1F Floor': '1F',
    '2F Floor': '2F',
    '3F Floor': '3F',
    '4F Floor': '4F',
    '5F Floor': '5F',
    '6F Floor': '6F',
    '7F Floor': '7F',
    '8F Floor': '8F',

    //   special case
    'Fl. 1': '1f',
    'Fl. 2': '2F',
    'Fl. 3': '3F',
    'Fl. 4': '4F',
    'Fl. 5': '5F',
    'Fl. 6': '6F',
    'Fl. 7': '7F',
    'Fl. G': 'GF',
    'Fl. M': 'MF',
    'Fl. U': 'UG',
    'Fl. B1': 'B1',
    'Fl. B2': 'B2',

    ',1': '1F',
    '2,3': '2F',
    '7,7A,8A': '7F',
    BM: 'BM',
    'Fl. BM1': 'BM1',
    'Fl. BM1,G': 'BM1',
  }

  // Try to map the floor name
  const mappedFloorName =
    floorMapping[cleanFloorName.toUpperCase()] ||
    floorMapping[cleanFloorName.toLowerCase()] ||
    floorMapping[cleanFloorName]

  if (!mappedFloorName) {
    // Track unmapped floor names
    unmappedFloors.add(cleanFloorName)
    console.log(`⚠️  Could not map floor name: "${cleanFloorName}" - skipping floor assignment`)
    return null
  }

  try {
    // Find existing floor
    const existingFloor = await payload.find({
      collection: 'floors',
      where: {
        name: {
          equals: mappedFloorName,
        },
      },
      limit: 1,
    })

    if (existingFloor.docs.length > 0) {
      return existingFloor.docs[0]
    }

    // If mapped floor doesn't exist, create it with proper order
    const floorOrder: { [key: string]: number } = {
      B1: 1,
      B2: 2,
      GF: 3,
      UG: 4,
      MF: 5,
      '1F': 6,
      '2F': 7,
      '3F': 8,
      '4F': 9,
      '5F': 10,
      '6F': 11,
    }

    const newFloor = await payload.create({
      collection: 'floors',
      data: {
        name: mappedFloorName,
        order: floorOrder[mappedFloorName] || 1,
      },
    })

    console.log(`✅ Created floor: ${mappedFloorName} (mapped from "${cleanFloorName}")`)
    return newFloor
  } catch (error) {
    console.error(`❌ Error finding or creating floor ${mappedFloorName}:`, error)
    return null
  }
}
