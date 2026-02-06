import type {
  InputField,
  RegistrationErrors,
  RegistrationFormFields
} from '@/models/IRegistrationFormFields'
import router from '@/router'
import { v4 as uuidv4 } from 'uuid'
import { computed, nextTick, ref, watch } from 'vue'

export function useRegistration(
  initialFields: RegistrationFormFields,
  inputFields: InputField[],
  registerFunction: (userData: any) => Promise<any>,
  additionalValidators: Record<string, (value: string) => boolean> = {},
  registrationType: 'user' | 'repairShop' = 'user' // Add this parameter
) {
  const formFields = ref<RegistrationFormFields>(initialFields)
  const errors = ref<RegistrationErrors>({})
  const formRef = ref<HTMLFormElement | null>(null)

  const isBtnDisabled = ref(true)
  const isAlertDialog = ref(false)
  const isLoading = ref(false)
  const isConfirmationSuccess = ref(false)
  const isRegistered = ref(false)
  const showErrorDialog = ref(false)
  const agreementAccepted = ref(false)
  const showAgreement = ref(false)
  const isVerifyDialog = ref(false)
  const isConfirmDialog = ref(false)
  const isActiveRegistration = ref(false)

  const paymentUrl = ref('')
  const confirmType = ref<'warning' | 'success' | 'error'>('warning')
  const confirmIcon = ref('')
  const confirmHeadline = ref('')
  const confirmMessage = ref('')
  const verificationEmail = ref('')

  const fieldKeys = Object.keys(initialFields)
  const inputsArray = fieldKeys.map((key) => {
    const needsMatching = ['email', 'confirmEmail', 'password', 'confirmPassword'].includes(key)

    return {
      key,
      value: false,
      valid: key === 'name',
      match: !needsMatching
    }
  })

  const addFieldToTrack = (key: string) => {
    if (!inputsArray.some((field) => field.key === key)) {
      inputsArray.push({
        key,
        value: false,
        valid: true,
        match: true
      })
    }
  }

  function checkInputData() {
    isBtnDisabled.value =
      inputsArray.some((field) => !field.value || !field.valid || !field.match) ||
      !agreementAccepted.value
  }

  function checkInputsData(key: string, value: string) {
    const index = inputsArray.findIndex((field) => field.key === key)
    let valid = true

    nextTick(() => {
      if (key === 'email' || key === 'confirmEmail') {
        if (value === '') {
          errors.value[key] = {
            message: 'Detta fält är obligatoriskt!',
            type: 'validation'
          }
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          valid = false
        } else {
          errors.value[key] = { message: '', type: 'validation' }
        }

        if (key === 'email' || key === 'confirmEmail') {
          checkFieldsMatch('email', 'confirmEmail')
        }
      } else if (key === 'password' || key === 'confirmPassword') {
        if (value === '') {
          errors.value[key] = {
            message: 'Detta fält är obligatoriskt!',
            type: 'validation'
          }
        } else if (value.length < 6) {
          valid = false
          errors.value[key] = {
            message: 'Lösenordet måste vara minst 6 tecken långt!',
            type: 'validation'
          }
        } else {
          errors.value[key] = { message: '', type: 'validation' }
        }

        if (key === 'password' || key === 'confirmPassword') {
          checkFieldsMatch('password', 'confirmPassword')
        }
      } else if (additionalValidators[key]) {
        valid = additionalValidators[key](value)
      }

      if (index !== -1) {
        inputsArray[index].value = value !== ''
        inputsArray[index].valid = valid
      } else {
        inputsArray.push({
          key: key,
          value: value !== '',
          valid: valid,
          match: true
        })
      }

      nextTick(() => {
        checkInputData()
      })
    })
  }

  function updateFormField(key: string, value: string) {
    if (key in formFields.value) {
      formFields.value[key] = value
      checkInputsData(key, value)
    }
  }

  function checkFieldsMatch(key1: string, key2: string) {
    if (!(key1 in formFields.value) || !(key2 in formFields.value)) return

    const index1 = inputsArray.findIndex((field) => field.key === key1)
    const index2 = inputsArray.findIndex((field) => field.key === key2)

    if (formFields.value[key1] === '' || formFields.value[key2] === '') {
      if (index1 !== -1) inputsArray[index1].match = false
      if (index2 !== -1) inputsArray[index2].match = false
      return
    }

    if (formFields.value[key1] === formFields.value[key2]) {
      if (index1 !== -1) inputsArray[index1].match = true
      if (index2 !== -1) inputsArray[index2].match = true
    } else {
      if (index1 !== -1) inputsArray[index1].match = false
      if (index2 !== -1) inputsArray[index2].match = false
    }
  }

  const translation = (string: string): string => {
    const translations: Record<string, string> = {
      name: 'namn',
      email: 'e-mailadress',
      phoneNumber: 'telefonnumret',
      password: 'lösenord',
      postalCode: 'postnumret',
      address: 'adressen'
    }

    return translations[string] || string
  }

  function validateInput(key: string) {
  if (!(key in formFields.value)) return

  const value = formFields.value[key]

  if (key === 'name') {
    if (value === '') {
      errors.value[key] = {
        message: 'Vänligen kontrollera namn!',
        type: 'validation'
      }
      return
    } else if (registrationType === 'user' && value.trim().split(' ').length < 2) {
      // Only require first and last name for regular users, not repair shops
      errors.value[key] = {
        message: 'Vänligen ange både för- och efternamn!',
        type: 'validation'
      }
      return
    } else {
      errors.value[key] = { message: '', type: 'validation' }
    }
  }

  if (key === 'email' || key === 'confirmEmail') {
    if (value === '') return
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      errors.value[key] = {
        message: 'Vänligen skriv en giltig e-mailadress!',
        type: 'validation'
      }
      return
    } else {
      errors.value[key] = { message: '', type: 'validation' }
    }

    if (formFields.value.email !== '' && formFields.value.confirmEmail !== '') {
      if (formFields.value.email !== formFields.value.confirmEmail) {
        errors.value.email = errors.value.confirmEmail = {
          message: 'Vänligen kontrollera så att e-mailadresserna matchar!',
          type: 'validation'
        }
      } else {
        errors.value.email = errors.value.confirmEmail = { message: '', type: 'validation' }
      }
    }
  } else if (key === 'password' || key === 'confirmPassword') {
    if (formFields.value.password !== '' && formFields.value.confirmPassword !== '') {
      if (formFields.value.password !== formFields.value.confirmPassword) {
        errors.value.password = errors.value.confirmPassword = {
          message: 'Vänligen kontrollera så att lösenorden matchar!',
          type: 'validation'
        }
      } else {
        errors.value.password = errors.value.confirmPassword = { message: '', type: 'validation' }
      }
    }
  } else if (additionalValidators[key]) {
    // Handle custom validators (like address, phoneNumber, postalCode)
    if (value === '') {
      errors.value[key] = {
        message: `Vänligen kontrollera ${translation(key)}!`,
        type: 'validation'
      }
    } else if (!additionalValidators[key](value)) {
      // Set specific error messages for different field types
      let errorMessage = `Vänligen kontrollera ${translation(key)}!`
      
      if (key === 'address') {
        errorMessage = 'Vänligen ange en giltig adress (t.ex. Verkstadsgatan 1)!'
      } else if (key === 'phoneNumber') {
        errorMessage = 'Vänligen ange ett giltigt telefonnummer (t.ex. 060 12 34 56)!'
      } else if (key === 'postalCode') {
        errorMessage = 'Vänligen ange ett giltigt postnummer (t.ex. 123 45)!'
      }
      
      errors.value[key] = {
        message: errorMessage,
        type: 'validation'
      }
    } else {
      errors.value[key] = { message: '', type: 'validation' }
    }
  }
}

  const acceptAgreement = () => {
    agreementAccepted.value = true
    showAgreement.value = false
    checkInputData()
  }

  async function handleRegistration(extraData: Record<string, any> = {}) {
    isLoading.value = true

    try {
      verificationEmail.value = formFields.value.email

      const registrationId = uuidv4()
      const code = uuidv4().replace(/-/g, '').substring(0, 6)

      const userData = computed(() => ({
        ...formFields.value,
        agreementAccepted: agreementAccepted.value,
        code: code,
        registrationId: registrationId,
        ...extraData
      }))

      const response = await registerFunction(userData.value)

      if (response.status === 201) {
        isLoading.value = false

        isVerifyDialog.value = true

        if (response.data?.url) {
          paymentUrl.value = response.data.url
        }
      } else if (response.status === 409 && response.data.message === 'Registration in progress!') {
        isLoading.value = false

        confirmType.value = 'error'
        confirmIcon.value = 'triangle-exclamation'
        confirmHeadline.value = 'Pågående registrering'
        confirmMessage.value =
          'Detta konto har redan en pågående registrering. Ett veriferingsmail har skickats till den angivna e-mailadressen.'

        isConfirmDialog.value = true
        isActiveRegistration.value = true
      } else if (response.status === 409 && response.data.message === 'Already registered!') {
        isLoading.value = false

        isRegistered.value = true
        isAlertDialog.value = true

        errors.value['email'] = {
          message: 'Denna e-mailadress används redan!',
          type: 'server'
        }

        errors.value['confirmEmail'] = {
          message: 'Denna e-mailadress används redan!',
          type: 'server'
        }
      } else {
        throw new Error('Registration failed')
      }
    } catch (err) {
      isLoading.value = false
      showErrorDialog.value = true
    } finally {
      for (const key in formFields.value) {
        formFields.value[key] = ''
      }

      inputsArray.forEach((field) => {
        field.value = false
        field.valid = field.key === 'name' ? true : false
        field.match = field.key === 'name' ? true : false
      })

      errors.value = {}
      isBtnDisabled.value = true

      nextTick(() => {
        if (formRef.value) {
          formRef.value.reset()
        }
      })
    }
  }

  const handleConfirm = () => {
    if (confirmType.value === 'success') router.push('/sign-in')
    else if (isActiveRegistration.value) isVerifyDialog.value = true

    isConfirmDialog.value = false
  }

  watch(showAgreement, (newValue) => {
    if (newValue) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  })

  return {
    formFields,
    errors,
    formRef,
    isBtnDisabled,
    isAlertDialog,
    isLoading,
    isConfirmationSuccess,
    isRegistered,
    showErrorDialog,
    agreementAccepted,
    showAgreement,
    isVerifyDialog,
    isConfirmDialog,
    paymentUrl,
    inputsArray,
    confirmType,
    confirmIcon,
    confirmHeadline,
    confirmMessage,
    verificationEmail,
    checkInputData,
    checkInputsData,
    updateFormField,
    validateInput,
    acceptAgreement,
    handleRegistration,
    addFieldToTrack,
    handleConfirm
  }
}
