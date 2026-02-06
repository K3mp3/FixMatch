import { db } from '@/main'
import type { IAuthState } from '@/models/IAuthState'
import router from '@/router'
import { signInUser } from '@/services/signInUser'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: (): IAuthState => ({
    user: null,
    loading: true,
    error: null,
    verificationError: false,
    noUserError: false
  }),

  actions: {
    async customSignIn(email: string, password: string) {
      this.loading = true
      this.error = null
      this.verificationError = false
      this.noUserError = false

      try {
        const auth = getAuth()
        let userCredential

        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password)
        } catch (authError) {
          if (
            authError instanceof Error &&
            'code' in authError &&
            authError.code === 'auth/user-not-found'
          ) {
            this.noUserError = true
            throw new Error('auth/user-not-found')
          }
          throw authError
        }

        const response = await signInUser({ email, password, signedIn: true })

        if (response === 403) {
          this.verificationError = true
          throw new Error('auth/not-verified')
        }

        if (response === 404) throw new Error('No user found')

        if (response !== 201) {
          throw new Error('Custom sign-in failed')
        }

        const { email: userEmail, uid } = userCredential.user

        const usersCollection = collection(db, 'users')
        const emailQuery = query(usersCollection, where('email', '==', userEmail))
        const querySnapshot = await getDocs(emailQuery)

        if (querySnapshot.empty) {
          throw new Error('User document not found')
        }

        const userDoc = querySnapshot.docs[0]
        const userData = userDoc.data()

        this.user = {
          email: userData.email,
          uid,
          location: userData.location,
          name: userData.name,
          phoneNumber: userData.phoneNumber,
          repairShop: userData.repairShop,
          address: userData.address || '',
          firstSignIn: userData.firstSignIn || false,
          paymentOptions: userData.paymentOptions || [],
          selectedTimes: userData.selectedTimes || [],
          workWarranty: userData.workWarranty || '',
          partsWarranty: userData.partsWarranty || '',
          isRentalCar: userData.isRentalCar || false,
          whenIsPayment: userData.whenIsPayment || '',
          postalCode: userData.postalCode || '',
          deleted: userData.deleted ? userData.deleted : null,
          dropOffTime: userData.dropOffTime,
          newPaymentDate: userData.newPaymentDate,
          subscriptionType: userData.subscriptionType,
          createdAt: userData.createdAt,
          nextFeeDate: userData.nextFeeDate,
          admin: userData.admin,
          sessionId: userData.sessionId
        }

        return this.user
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'An unknown error occurred'
        throw error
      } finally {
        this.loading = false
      }
    },

    signOut() {
      const auth = getAuth()
      auth
        .signOut()
        .then(() => {
          this.user = null
          router.push({ name: 'landing page' })
        })
        .catch((error) => {
          this.error = error instanceof Error ? error.message : 'Sign out error occurred'
        })
    },

    async initAuth() {
      const auth = getAuth()

      return new Promise<void>((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          try {
            if (user && user.email) {
              const usersCollection = collection(db, 'users')
              const emailQuery = query(usersCollection, where('email', '==', user.email))
              const querySnapshot = await getDocs(emailQuery)

              if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0]
                const userData = userDoc.data()

                this.user = {
                  email: user.email,
                  uid: user.uid,
                  location: userData.location,
                  name: userData.name,
                  phoneNumber: userData.phoneNumber,
                  repairShop: userData.repairShop,
                  address: userData.address,
                  firstSignIn: userData.firstSignIn || false,
                  paymentOptions: userData.paymentOptions || [],
                  selectedTimes: userData.selectedTimes || [],
                  workWarranty: userData.workWarranty || '',
                  partsWarranty: userData.partsWarranty || '',
                  isRentalCar: userData.isRentalCar || false,
                  whenIsPayment: userData.whenIsPayment || '',
                  postalCode: userData.postalCode || '',
                  deleted: userData.deleted ? userData.deleted : null,
                  dropOffTime: userData.dropOffTime,
                  newPaymentDate: userData.newPaymentDate,
                  subscriptionType: userData.subscriptionType,
                  createdAt: userData.createdAt,
                  nextFeeDate: userData.nextFeeDate,
                  admin: userData.admin,
                  sessionId: userData.sessionId
                }
              } else this.user = null
            } else this.user = null
          } catch (error) {
            this.user = null
          } finally {
            this.loading = false
            resolve()
          }
        })
      })
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    getUser: (state) => state.user,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    isVerificationError: (state) => state.verificationError,
    isNoUserError: (state) => state.noUserError
  }
})
