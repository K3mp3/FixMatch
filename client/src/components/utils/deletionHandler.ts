/**
 * Check if a timestamp is within the specified window before deletion
 * @param deletionTimestamp Firebase Timestamp
 * @param windowMinutes Minutes before deletion to check
 * @returns boolean
 */
export function isWithinDeletionWindow(
  deletionTimestamp: { seconds: number },
  windowMinutes: number = 20
): boolean {
  if (!deletionTimestamp) return false

  const deletionDate = new Date(deletionTimestamp.seconds * 1000)
  const now = new Date()
  const diffInMinutes = (deletionDate.getTime() - now.getTime()) / (1000 * 60)

  return diffInMinutes >= 0 && diffInMinutes <= windowMinutes
}

/**
 * Check if it's time to show the warning alert
 * @param deletionTimestamp Firebase Timestamp
 * @returns boolean
 */
export function shouldShowDeletionWarning(deletionTimestamp: { seconds: number }): boolean {
  if (!deletionTimestamp) return false

  const deletionDate = new Date(deletionTimestamp.seconds * 1000)
  const now = new Date()
  const diffInMinutes = (deletionDate.getTime() - now.getTime()) / (1000 * 60)

  return diffInMinutes >= 1 && diffInMinutes <= 2
}

/**
 * Check if it's time to perform the deletion
 * @param deletionTimestamp Firebase Timestamp
 * @returns boolean
 */
export function shouldPerformDeletion(deletionTimestamp: { seconds: number }): boolean {
  if (!deletionTimestamp) return false

  const deletionDate = new Date(deletionTimestamp.seconds * 1000)
  const now = new Date()
  const diffInMinutes = (deletionDate.getTime() - now.getTime()) / (1000 * 60)

  return diffInMinutes <= 0
}
