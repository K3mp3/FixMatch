export interface IRepairShopTimeBooking {
  customerEmail: string
  uid: string
  requestId: string
  acceptedDate?: string
  customerMessageId: string
  firstDate?: Date
  secondDate?: Date
  thirdDate?: Date
  subscriptionType?: string
  isTrialBooking?: boolean
}
