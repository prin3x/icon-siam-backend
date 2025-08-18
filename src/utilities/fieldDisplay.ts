export const shouldHideField = (fieldOrName: string | { name: string; hidden?: boolean }) => {
  // If it's a field object, check the hidden property first
  if (typeof fieldOrName === 'object' && fieldOrName.hidden === true) {
    return true
  }

  // Otherwise, check by name for system fields
  const name = typeof fieldOrName === 'string' ? fieldOrName : fieldOrName.name
  const lower = String(name || '').toLowerCase()
  // Hide system fields that should never be user-editable or sent back
  return (
    lower === 'id' ||
    lower === 'createdat' ||
    lower === 'updatedat' ||
    lower === 'created_at' ||
    lower === 'updated_at' ||
    lower === '_status' ||
    lower === 'unique_id'
  )
}
