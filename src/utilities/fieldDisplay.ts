export const shouldHideField = (name: string) => {
  const lower = String(name || '').toLowerCase()
  // Hide system fields that should never be user-editable or sent back
  return (
    lower === 'id' ||
    lower === 'createdat' ||
    lower === 'updatedat' ||
    lower === 'created_at' ||
    lower === 'updated_at' ||
    lower === '_status'
  )
}
