export const formatDate = (dateString: Date) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('sv-SE')
}
