export function booleanLexicalToValue(value: string) {
  if (value === 'true' || value === '1') {
    return true
  } else if (value === 'false' || value === '0') {
    return false
  }

  // Defaulting to false for unrecognised value.
  return false
}
