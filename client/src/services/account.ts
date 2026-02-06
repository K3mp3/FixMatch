import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export async function deleteAccount(user: object) {
  try {
    const response = await axios.post<object>(`${BASE_URL}/users/deleteAccount`, user)

    return response.status
  } catch (error: any) {
    return error.status
  }
}

export async function cancelDelete(user: object) {
  try {
    const response = await axios.post<object>(`${BASE_URL}/users/cancelDelete`, user)

    const data = response.data
    const status = response.status

    return { data, status }
  } catch (error: any) {
    return error.status
  }
}

export async function checkTrialPeriod(user: object) {
  try {
    const response = await axios.post<object>(`${BASE_URL}/users/checkTrialPeriod`, user)

    const data = response.data
    const status = response.status

    return { data, status }
  } catch (error: any) {
    return error.status
  }
}
