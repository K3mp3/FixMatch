import type { IRepairShopAnswer } from './IRepairShopAnswer'
import type { VehicleData } from './IVehicleData'

export interface IPairedMessage {
  customerMessage: {
    id: string
    work: string
    message: string
    type: string
  }
  repairShopAnswers: IRepairShopAnswer
}

export interface IRepairShopContact {
  id?: string
  customerId?: string
  email: string
  messageId?: string
  customerName?: string
  customerEmail?: string
  repairShopEmail?: string
  repairShopName?: string
  location: string
  registrationNumber: string
  customerMessage: {
    id: string
    work: string
    message: string
    type: string
    mileage: number
    selectedBrakes: string
  }[]
  repairShopAnswer?: string
  customerAnswer?: string
  priceOffer?: string
  isLineActive?: boolean
  repairShopAnswers?: IRepairShopAnswer[]
  pairedMessages?: IPairedMessage[]
  date: Date
  vehicleData?: VehicleData
  gearType: string
  validDate: Date
}
