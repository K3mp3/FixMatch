import type { ITimeSlot } from './ITimeSlot'

export interface IRepairShopInfo {
  selectedTimes: ITimeSlot[]
  workWarranty: string
  partsWarranty: string
  isRentalCar: boolean
  paymentOptions: string[]
  email: string
  dropOffTime: string
}
