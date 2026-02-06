import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export const verifyStripeSub = async (
  sessionId: string
): Promise<{ valid: boolean; message?: string }> => {
  try {
    const response = await axios.post(`${BASE_URL}/stripe/verifyStripeSub`, { sessionId })

    return {
      valid: response.data.valid,
      message: response.data.message
    }
  } catch (error) {
    return {
      valid: false,
      message: 'Failed to verify subscription status'
    }
  }
}
