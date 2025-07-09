import configPromise from '@/payload.config'
import { seed } from '@/seeds'
import { getPayload } from 'payload'

export const seedCommand = async (): Promise<void> => {
  console.log('🌱 Starting seeding process...')
  try {
    const payload = await getPayload({ config: configPromise })
    await seed(payload)
    console.log('✅ Seeding completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

seedCommand()
