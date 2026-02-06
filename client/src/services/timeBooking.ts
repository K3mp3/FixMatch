import type { IBookingMessage, IBookingUpdateDates } from '@/models/IBookingResponse'
import type { IRepairShopTimeBooking } from '@/models/IRepairShopTimeBooking'

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export async function sendSelectedDatesToServer(data: IBookingMessage) {
  try {
    const response = await axios.post<IBookingMessage>(`${BASE_URL}/booking/saveDate`, data)

    return response.status
  } catch (error) {
    return 500
  }
}

export async function sendAcceptedDateToServer(data: IRepairShopTimeBooking) {
  try {
    const response = await axios.post<IRepairShopTimeBooking>(
      `${BASE_URL}/booking/saveAcceptedDate`,
      data
    )

    return response.status
  } catch (error) {
    return 500
  }
}

export async function createPaymentIntent(paymentData: object) {
  try {
    const response = await axios.post(`${BASE_URL}/payments/create-intent`, paymentData)
    return {
      data: response.data,
      status: response.status
    }
  } catch (error: any) {
    console.error('Payment intent creation error:', error)
    return {
      error: true,
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Ett fel uppstod vid förberedelse av betalning'
    }
  }
}

export async function saveNewDates(data: IRepairShopTimeBooking) {
  try {
    const response = await axios.post<IRepairShopTimeBooking>(
      `${BASE_URL}/booking/saveNewDates`,
      data
    )

    return response.status
  } catch (error) {
    return 500
  }
}

export async function fetchBooking(data: Object) {
  try {
    const response = await axios.post(`${BASE_URL}/booking/fetchBooking`, data)

    const responseData = response.data
    const status = response.status

    return { responseData, status }
  } catch (error) {
    return 500
  }
}

export async function fetchBookings(user: Object) {
  try {
    const response = await axios.post(`${BASE_URL}/booking/fetchBookings`, user)

    if (response.status === 204) return 204
    return response
  } catch (error) {
    return 500
  }
}

export async function fetchAcceptedBookings(user: Object) {
  try {
    const response = await axios.post(`${BASE_URL}/booking/fetchAcceptedBookings`, user)

    const responseData = response.data
    const status = response.status

    return { responseData, status }
  } catch (error) {
    return 500
  }
}

export async function fetchDataForBooking(requestId: Object) {
  try {
    const response = await axios.post(`${BASE_URL}/booking/fetchRequestData`, requestId)

    if (response.status === 204) return 204

    return response
  } catch (error) {
    return 500
  }
}

export async function cancelBooking(user: Object) {
  try {
    const response = await axios.post(`${BASE_URL}/booking/cancelAcceptedBooking`, user)

    const responseData = response.data
    const status = response.status

    return { responseData, status }
  } catch (error) {
    return 500
  }
}

export async function fetchAcceptedBookingsForRepairShop(user: Object) {
  try {
    const response = await axios.post(
      `${BASE_URL}/booking/fetchAcceptedBookingsForRepairShop`,
      user
    )

    const responseData = response.data
    const status = response.status

    return { responseData, status }
  } catch (error) {
    return 500
  }
}

export async function cancelBookingForRepairShop(user: Object) {
  try {
    const response = await axios.post(`${BASE_URL}/booking/cancelBookingForRepairShop`, user)

    const responseData = response.data
    const status = response.status

    return { responseData, status }
  } catch (error) {
    return 500
  }
}

export async function fetchBookingsWithNewDates(user: Object) {
  try {
    const response = await axios.post(`${BASE_URL}/booking/fetchBookingsWithNewDates`, user)

    const responseData = response.data
    const status = response.status

    return { responseData, status }
  } catch (error: any) {
    return error.response.status
  }
}

export async function sendNewAcceptedDatesToServer(data: IRepairShopTimeBooking) {
  try {
    const response = await axios.post<IRepairShopTimeBooking>(
      `${BASE_URL}/booking/saveNewAcceptedDates`,
      data
    )

    return response.status
  } catch (error: any) {
    return error.response.status
  }
}

export async function updateSavedDates(data: IBookingUpdateDates) {
  try {
    const response = await axios.post<IBookingUpdateDates>(
      `${BASE_URL}/booking/updateSavedDates`,
      data
    )

    return response.status
  } catch (error: any) {
    return error.response.status
  }
}
