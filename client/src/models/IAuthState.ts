import type { Timestamp } from 'firebase/firestore'
import type { ITimeSlot } from './ITimeSlot'

export interface IAuthState {
  user: {
    email: string
    uid: string
    location: string
    postalCode: string
    name: string
    phoneNumber: string
    repairShop: boolean
    address: string
    firstSignIn: boolean
    paymentOptions: Array<string>
    selectedTimes: ITimeSlot[]
    workWarranty: string
    partsWarranty: string
    isRentalCar: boolean
    whenIsPayment: string
    deleted: Timestamp | null
    dropOffTime: string
    newPaymentDate: Timestamp | null
    subscriptionType: string
    createdAt: Timestamp
    nextFeeDate: Timestamp | null
    admin: boolean
    sessionId: string | null
  } | null
  loading: boolean
  error: string | null
  verificationError: boolean
  noUserError: boolean
}
