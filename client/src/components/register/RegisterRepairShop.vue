<script setup lang="ts">
import router from '@/router'
import { onMounted, ref } from 'vue'
import RepairShopAggrement from '../agreements/RepairShopAggrement.vue'
import { swedishKommunes } from '../utils/SwedishKommunes'
import RegistrationForm from './RegistrationForm.vue'

const subscriptionType = ref('')

const repairShopInputFields = [
  {
    key: 'name',
    type: 'text',
    placeholder: 'Min verkstad AB',
    label: 'Namn på din verkstad'
  },
  {
    key: 'phoneNumber',
    type: 'text',
    placeholder: '060 12 34 56',
    label: 'Telefonnummer'
  },
  {
    key: 'postalCode',
    type: 'text',
    placeholder: '000 11',
    label: 'Postnummer'
  },
  {
    key: 'address',
    type: 'text',
    placeholder: 'Verkstadsgatan 1',
    label: 'Adress'
  },
  {
    key: 'email',
    type: 'email',
    placeholder: 'minverkstad@mail.se',
    label: 'E-mailadress'
  },
  {
    key: 'confirmEmail',
    type: 'email',
    placeholder: 'minverkstad@mail.se',
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

const initialRepairShopFields = {
  name: '',
  phoneNumber: '',
  postalCode: '',
  address: '',
  email: '',
  confirmEmail: '',
  password: '',
  confirmPassword: ''
}

const repairShopValidators = {
  phoneNumber: (value: string) => /^((\d{2,4}\s?\d{2,3}\s?\d{2,3}\s?\d{2,3}))$/.test(value.trim()),
  postalCode: (value: string) => /^\d{3}\s?\d{2}$/.test(value.trim()),
  address: (value: string) =>
    /^[A-Za-zåäöÅÄÖéÉ]+\s\d{1,3}(?:\s?[A-Za-z])?(?:\s*(?:,\s*)?(?:L[gh]h\.?|l[gh]h\.?|Lägenhet)\s*\d{1,5})?$/.test(
      value.trim()
    )
}

onMounted(() => {
  const url = window.location.href
  if (!url.includes('?core') && !url.includes('?premium')) router.push('/price-plans')
  else {
    if (url.includes('?core')) subscriptionType.value = 'core'
    else if (url.includes('?premium')) subscriptionType.value = 'premium'
  }
})
</script>

<template>
  <section>
    <RegistrationForm
      title="Registrera dig"
      registrationType="repairShop"
      :inputFields="repairShopInputFields"
      :initialFields="initialRepairShopFields"
      :additionalValidators="repairShopValidators"
      :agreementComponent="RepairShopAggrement"
      :hasLocation="true"
      :locationOptions="swedishKommunes"
      :subscriptionType="subscriptionType"
    />
  </section>
</template>
