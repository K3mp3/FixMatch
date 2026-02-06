import type { IUserSignIn } from '@/models/IUserSignIn'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export async function signOutUser(user: IUserSignIn) {
  try {
    const response = await axios.post(`${BASE_URL}/users/signOutUser`, user)
    localStorage.setItem('isSignedIn', false.toString())
    return response.status
  } catch (error: any) {
    if (
      error &&
      error.response.status === 500 &&
      error.response.data.message === 'Internal Server Error'
    ) {
      return 500
    }
  }
}
