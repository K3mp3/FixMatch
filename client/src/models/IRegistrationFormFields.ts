export interface RegistrationFormFields {
  name: string
  email: string
  confirmEmail: string
  password: string
  confirmPassword: string
  [key: string]: string
}

export interface RegistrationErrors {
  [key: string]: { message: string; type: 'validation' | 'server' } | undefined
}

export interface InputField {
  key: string
  type: string
  placeholder: string
  label: string
}
