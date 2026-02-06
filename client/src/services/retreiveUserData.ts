import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export async function retrieveUserData(user: Object) {
  try {
    const response = await axios.post(`${BASE_URL}/users/retrieveUserData`, user)
    return response.data
  } catch (error: any) {
    return 500
  }
}

export async function retrieveRepairShopData(uuid: Object) {
  try {
    const response = await axios.post(`${BASE_URL}/users/retrieveRepairShopData`, uuid)
    return response
  } catch (error: any) {
    return 500
  }
}
