import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export async function fetchRepairShops() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/getRepairShops`)

    const data = response.data
    const status = response.status

    return { data, status }
  } catch (error: any) {
    return error.response.status
  }
}

export async function deleteRepairShop(user: Object) {
  try {
    const response = await axios.post(`${BASE_URL}/admin/deleteRepairShop`, user)

    return response.status
  } catch (error: any) {
    return error.response.status
  }
}

export async function saveRepairShop(repairShop: Object) {
  try {
    const response = await axios.post(`${BASE_URL}/admin/saveRepairShop`, repairShop)

    return response.status
  } catch (error: any) {
    return error.response.status
  }
}

export async function saveEditorContent(content: FormData) {
  try {
    const response = await axios.post(`${BASE_URL}/admin/saveContent`, content)

    return response.status
  } catch (error: any) {
    return 500
  }
}

export async function fetchEditorContent() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/fetchContent`)

    const data = response.data
    const status = response.status

    return { data, status }
  } catch (error: any) {
    return error.response.status
  }
}
