import type { IMessage } from '@/models/IMessage'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export async function contactUs(messageData: IMessage) {
  try {
    const response = await axios.post<IMessage>(`${BASE_URL}/contact/contactUs`, messageData)

    return response.status
  } catch (error: any) {
    return 500
  }
}

export const contactFromRepairShop = async (messageData: IMessage) => {
  try {
    const response = await axios.post<IMessage>(
      `${BASE_URL}/contact/contactFromRepairShop`,
      messageData
    )

    return response.status
  } catch (error: any) {
    return 500
  }
}
