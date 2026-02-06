import type { IPdfResponse } from '@/models/IPDFResponse'
import type { IRepairShopAnswer } from '@/models/IRepairShopAnswer'
import type { IRepairShopContact } from '@/models/IRepairShopContact'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export async function contactRepairShops(messageData: IRepairShopContact) {
  try {
    const response = await axios.post<IRepairShopContact>(
      `${BASE_URL}/contactRepairShops/contactRepairShops`,
      messageData
    )

    const data = response.data
    const status = response.status

    return { data, status }
  } catch (error) {
    return 500
  }
}

export async function retrieveRequestForRepairShops(user: Object | null) {
  try {
    const response = await axios.post<IRepairShopContact>(
      `${BASE_URL}/contactRepairShops/retrieveRequests`,
      user
    )

    return response.data
  } catch (error) {
    return error
  }
}

export async function answerFromRepairShop(user: IRepairShopAnswer | FormData) {
  try {
    const response = await axios.post<IRepairShopAnswer | FormData>(
      `${BASE_URL}/contactRepairShops/answerRequest`,
      user
    )

    const data = response.data
    const status = response.status

    return { data, status }
  } catch (error) {
    return error
  }
}

export async function retrieveSentRequests(user: Object | null) {
  try {
    const response = await axios.post<Object | null>(
      `${BASE_URL}/contactRepairShops/retrieveUserSentRequests`,
      user
    )

    const data = response.data
    const status = response.status

    return { data, status }
  } catch (error) {
    return error
  }
}
export async function getJobResponse(jobData: Object) {
  try {
    const response = await axios.post<Object>(
      `${BASE_URL}/contactRepairShops/fetchJobResponse`,
      jobData
    )

    const data = response.data
    const status = response.status

    return { data, status }
  } catch (error) {
    return error
  }
}

export async function fetchPdfFile(
  fileName: string
): Promise<{ status: number; data: IPdfResponse } | any> {
  try {
    const response = await fetch(`${BASE_URL}/contactRepairShops/getPdf/${fileName}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return {
      status: response.status,
      data: await response.json()
    }
  } catch (error: any) {
    return error.response
  }
}
