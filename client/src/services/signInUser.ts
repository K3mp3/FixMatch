import type { IUserSignIn } from '@/models/IUserSignIn'
import { useShowPopUp } from '@/stores/ShowPopUpStores'

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export async function signInUser(user: IUserSignIn) {
  try {
    const response = await axios.post<IUserSignIn>(`${BASE_URL}/users/signin`, user)

    return response.status
  } catch (error: any) {
    const showErrorDialog = useShowPopUp()

    if (error.response.status === 404) return 404
    else if (error.response.status === 403) return 403
    else if (error.response && error.response.status === 500) {
      showErrorDialog.showPopUpTab(
        true,
        'Whoops, tyvärr fungerade inte inloggningen på grund av ett fel. Vänligen försök igen eller vänta en liten stund.'
      )
      if (error.response.data.message === 'Payment not done')
        showErrorDialog.showPopUpTab(true, 'Vänligen betala för att aktivera ditt konto')
      window.location.href = error.response.data.url as string
      return 500
    }
  }
}
