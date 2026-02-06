import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export async function unsubscribe(user: Object) {
  try {
    const response = await axios.post<Object>(`${BASE_URL}/repairShop/unsubscribe`, user)

    return response.status
  } catch (error: any) {
    return 500
  }
}
