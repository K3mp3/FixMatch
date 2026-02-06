import type { IRepairShopRegistration } from '@/models/IRepairShopRegistration'
import type { IUserRegistration } from '@/models/IUserRegistration'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export async function registerUser(user: IUserRegistration) {
  try {
    const response = await axios.post<IUserRegistration>(`${BASE_URL}/users/createUser`, user)

    const data = response.data
    const status = response.status

    return { data, status }
  } catch (error: any) {
    const data = error.response.data
    const status = error.response.status

    return { data, status }
  }
}

export async function registerRepairShop(user: IRepairShopRegistration) {
  try {
    const response = await axios.post<IRepairShopRegistration>(
      `${BASE_URL}/users/createRepairShopUser`,
      user
    )

    const data = response.data
    const status = response.status

    return { data, status }
  } catch (error: any) {
    if (error.response) {
      return {
        status: error.response.status,
        data: error.response.data
      }
    }
    return { status: 500, data: { message: 'Unknown error' } }
  }
}

export async function verifyUser(code: Object) {
  try {
    const response = await axios.post<Object>(`${BASE_URL}/users/verifyUser`, code)

    const data = response.data
    const status = response.status

    return { data, status }
  } catch (error: any) {
    return error.response
  }
}

export async function resendCode(user: Object) {
  try {
    const response = await axios.post<Object>(`${BASE_URL}/users/resendCode`, user)

    const data = response.data
    const status = response.status

    return { data, status }
  } catch (error: any) {
    return error.response
  }
}
