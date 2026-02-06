export function validateEmail(email: string) {
  if (email === '') return
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return false
  } else {
    return true
  }
}
