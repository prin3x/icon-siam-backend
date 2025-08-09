import { getPayload } from 'payload'
import config from '../src/payload.config'

async function checkContent() {
  const payload = await getPayload({ config })

  try {
    // Check a specific promotion that was updated
    const promotion = await payload.findByID({
      collection: 'promotions',
      id: 33, // This was one of the updated ones
    })

    console.log('Promotion found:')
    console.log('ID:', promotion.id)
    console.log('Original ID:', promotion.system?.original_id)
    console.log(
      'Content TH:',
      typeof promotion.content?.th === 'string'
        ? promotion.content.th.substring(0, 100) + '...'
        : 'Not a string',
    )
    console.log(
      'Content EN:',
      typeof promotion.content?.en === 'string'
        ? promotion.content.en.substring(0, 100) + '...'
        : 'Not a string',
    )
    console.log(
      'Content ZH:',
      typeof promotion.content?.zh === 'string'
        ? promotion.content.zh.substring(0, 100) + '...'
        : 'Not a string',
    )
  } catch (error) {
    console.error('Error:', error)
  } finally {
    process.exit(0)
  }
}

checkContent().catch(console.error)
