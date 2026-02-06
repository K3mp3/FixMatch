import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export async function deleteJob(data: Object) {
  try {
    const response = await axios.post(`${BASE_URL}/contactRepairShops/deleteJob`, data)
    return response.status
  } catch (error: any) {
    return error.response.status
  }
}
