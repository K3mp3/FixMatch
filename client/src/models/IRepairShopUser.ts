import type { ITimeSlot } from './ITimeSlot'

export interface IRepairShopUser {
  address: string
  email: string
  firstSignIn: boolean
  isRentalCar: boolean
  lastSignIn: string
  location: string
  name: string
  partsWarranty: string
  paymentOptions: []
  phoneNumber: string
  postalCode: string
  repairShop: boolean
  selectedTimes: ITimeSlot[]
  uid: string
  whenIsPayment: string
  workWarranty: string
  dropOffTime: string
}
