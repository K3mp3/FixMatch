export interface IServerResponse {
  data: any // Updated to accept an array of IRepairShopAnswer or any
  status: number
  error: number
  success?: boolean // Optional success flag that might be in the response
  count?: number // Optional count that might be in the response
}
