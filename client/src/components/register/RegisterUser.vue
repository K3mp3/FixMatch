<!-- src/components/RegisterUser.vue -->
<script setup lang="ts">
import UserAgreement from '../agreements/UserAgreement.vue'
import RegistrationForm from './RegistrationForm.vue'

const userInputFields = [
  {
    key: 'name',
    type: 'text',
    placeholder: 'Andrey Johnsson',
    label: 'För- och efternamn'
  },
  {
    key: 'email',
    type: 'email',
    placeholder: 'namn@mail.se',
    label: 'E-mailadress'
  },
  {
    key: 'confirmEmail',
    type: 'email',
    placeholder: 'namn@mail.se',
    label: 'Bekräfta e-mailadress'
  },
  {
    key: 'password',
    type: 'password',
    placeholder: 'Lösenord',
    label: 'Lösenord'
  },
  {
    key: 'confirmPassword',
    type: 'password',
    placeholder: 'Lösenord',
    label: 'Bekräfta lösenord'
  }
]

const initialUserFields = {
  name: '',
  email: '',
  confirmEmail: '',
  password: '',
  confirmPassword: ''
}

const userValidators = {
  name: (value: string) => /^[^\s]+\s[^\s]+$/.test(value.trim())
}
</script>

<template>
  <RegistrationForm
    title="Registrera dig"
    registrationType="user"
    :inputFields="userInputFields"
    :initialFields="initialUserFields"
    :additionalValidators="userValidators"
    :agreementComponent="UserAgreement"
  />
</template>
