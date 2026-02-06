import type { IRepairShopAnswer } from './IRepairShopAnswer'
import type { IPairedMessage } from './IRepairShopContact'
import type { ITimeSlot } from './ITimeSlot'

export interface IBookingMessage {
  dateOne: Date
  dateTwo: Date
  dateThree: Date
  customerMessageId: string
  repairShopUid: string
  requestId: string
  customerEmail: string
  priceOffer: number
  registrationNumber: string
  typeOfFix: string
  customerMessage: string
  type: string
  work: string
  repairShopEmail: string
  saveAcceptedDate?: {
    acceptedDate: string
    requestId: string
    uid: string
    repairShopName: string
  }
  declined?: boolean
}

export interface IBookingResponse {
  message: IBookingMessage[]
}

export interface IBookingUpdateDates {
  dateOne: Date
  dateTwo: Date
  dateThree: Date
  customerMessageId: string
  uid: string
  requestId: string
  customerEmail: string
}

export type BookingWithSuggestedDates = IBookingMessage & {
  suggestedDates: {
    firstDate: string
    secondDate: string
    thirdDate: string
    requestId: string
    uid: string
  }
  repairShopName: string
  repairShopAddress: string
  selectedTimes: ITimeSlot[]
}

export type BookingWithId = IBookingMessage & { id: string }

export interface IBookingRequest {
  id?: string
  dateOne?: string
  dateTwo?: string
  dateThree?: string
  acceptedDate?: string
  repairShopUid: string
  requestId: string
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
  }[]
  repairShopAnswer?: string
  customerAnswer?: string
  priceOffer?: string
  isLineActive?: boolean
  repairShopAnswers?: IRepairShopAnswer[]
  pairedMessages?: IPairedMessage[]
  seen: boolean
  acceptedByCustomer?: {
    acceptedDate: string
    requestId: string
    uid: string
  }
  acceptedByRepairShop?: {
    uid: string
  }
  suggestedDates?: {
    uid: string
    requestId: string
    firstDate: string
    secondDate: string
    thirdDate: string
  }
  saveAcceptedDate?: {
    uid: string
    requestId: string
    acceptedDate: string
  }
  priceToPay?: number
  isTrialBooking?: boolean
  subscriptionType?: string
  paymentCompleted?: boolean
  dateAccepted?: Date
  declined: boolean
}
