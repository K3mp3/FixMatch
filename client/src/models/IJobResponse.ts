import type { ITimeSlot } from './ITimeSlot'

export interface IJobResponse {
  customerEmail: string
  customerMessage: {
    id: string
    message: string
    milage: number
    type: string
    work: string
  }
  gearType: string
  id: string
  location: string
  registrationNumber: string
  repairShopAnswers: {
    address: string
    customerMessageId: string
    declined: boolean
    id: string
    pdfFileName: string
    priceOffer?: number
    registrationNumber?: string
    repairShopEmail?: string
    repairShopName?: string
    repairShopPhoneNumber?: string
    type?: string
    typeOfFix?: string
    uuid: string
    validOfferDate: Date
    work?: string
    workTime: number
    postalCode: string
    location: string
    validDate: Date
  }
  repairShops: [
    {
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
  ]
}
