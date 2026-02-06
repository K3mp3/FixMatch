export interface IRepairShopAnswer {
  id: string
  type?: string
  work?: string
  registrationNumber?: string
  uuid: string
  customerMessageId: string
  repairShopName?: string
  repairShopEmail?: string
  repairShopPhoneNumber?: string
  priceOffer?: number
  typeOfFix?: string
  declined: boolean
  address: string
  postalCode: string
  location: string
  workTime: number
  pdfFileName: string
  validDate: Date
  validOfferDate: Date
}
