import type { IRepairShopInfo } from '@/models/IRepairShopInfo'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export async function saveRepairShopInfo(info: IRepairShopInfo) {
  try {
    const response = await axios.post<IRepairShopInfo>(
      `${BASE_URL}/repairShop/saveInfoOnboarding`,
      info
    )
    return response
  } catch (error: any) {
    return error.response
  }
}
export async function saveRepairShopInfoSettings(info: IRepairShopInfo) {
  try {
    const response = await axios.post<IRepairShopInfo>(
      `${BASE_URL}/repairShop/saveInfoSettings`,
      info
    )
    return response
  } catch (error: any) {
    return error.response
  }
}
