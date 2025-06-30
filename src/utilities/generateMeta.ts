// import type { Metadata } from 'next'

// import type { Media, Config, GettingHere } from '../payload-types'

// import { mergeOpenGraph } from './mergeOpenGraph'
// import { getServerSideURL } from './getURL'

// const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
//   const serverUrl = getServerSideURL()

//   let url = serverUrl + '/website-template-OG.webp'

//   if (image && typeof image === 'object' && 'url' in image) {
//     const ogUrl = image.sizes?.og?.url

//     url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
//   }

//   return url
// }

// export const generateMeta = async (args: {
//   doc: Partial<GettingHere> | null
// }): Promise<Metadata> => {
//   const { doc } = args

//   const ogImage = getImageURL(doc?.media)

//   const title = doc?.title
//     ? doc?.title + ' | Payload Website Template'
//     : 'Payload Website Template'

//   return {
//     description: doc?.meta?.description,
//     openGraph: mergeOpenGraph({
//       description: doc?.meta?.description || '',
//       images: ogImage
//         ? [
//             {
//               url: ogImage,
//             },
//           ]
//         : undefined,
//       title,
//       url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
//     }),
//     title,
//   }
// }
