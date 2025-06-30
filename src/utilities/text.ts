export const getOnlyCharacters = (text: string) => {
  return text?.replace(/[^a-zA-Z]/g, '') || ''
}
