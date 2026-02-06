<script setup lang="ts">
import type { IRepairShopAnswer } from '@/models/IRepairShopAnswer'
import type { IRepairShopUser } from '@/models/IRepairShopUser'
import type { PropType } from 'vue'

type PaymentOption = 'cash' | 'creditCard' | 'invoice' | 'swish' | 'financing'

const props = defineProps({
  answer: {
    type: Object as PropType<IRepairShopAnswer>,
    required: true
  },
  repairShopData: {
    type: Object as PropType<IRepairShopUser>,
    required: true
  }
})

const paymentTranslations: Record<PaymentOption, { text: string; icon: string }> = {
  cash: {
    text: 'Kontant',
    icon: 'money-bill-1-wave'
  },
  creditCard: {
    text: 'Kreditkort',
    icon: 'credit-card'
  },
  invoice: {
    text: 'Faktura',
    icon: 'file-invoice'
  },
  swish: {
    text: 'Swish',
    icon: 'mobile-screen-button'
  },
  financing: {
    text: 'Finansiering',
    icon: 'piggy-bank'
  }
} as const
</script>

<template>
  <section class="w-full flex flex-col gap-4">
    <div>
      <strong>Inlämning:</strong>
      <p class="flex flex-col">
        Verkstaden föredrar inläming
        <span>kl. {{ props.repairShopData.dropOffTime }} </span>
      </p>
    </div>
    <div>
      <strong>Inkluderat:</strong>
      <p class="flex flex-col">
        <span
          >{{
            `${props.answer.typeOfFix}  ${props.answer.typeOfFix === 'Felsökning' ? ' - upp till en timme' : ''}`
          }}
        </span>
        <span>{{ props.answer.priceOffer }} kr </span>
      </p>
    </div>

    <div>
      <strong>Garanti:</strong>
      <p class="flex flex-col mb-1">
        <span class="w-full flex justify-between">Garanti på arbete</span>
        <span>{{ props.repairShopData.workWarranty }} mån. </span>
      </p>

      <p class="flex flex-col">
        <span>Garanti på delar</span>
        <span>{{ props.repairShopData.partsWarranty }} mån.</span>
      </p>
    </div>

    <div>
      <strong>Betalning:</strong>
      <p class="flex flex-col mb-2">
        <span
          >Betalning görs
          {{ props.repairShopData.whenIsPayment === 'before' ? 'före' : 'efter' }} inlämning
        </span>
      </p>
    </div>

    <div>
      <strong>Betal alternativ:</strong>
      <p class="flex flex-col mb-2">
        <span
          v-for="(options, index) in props.repairShopData.paymentOptions"
          :key="index"
          class="flex items-center gap-2"
        >
          <fontAwesome
            :icon="['fas', paymentTranslations[options as PaymentOption].icon]"
            class="w-5"
          />
          {{ paymentTranslations[options as PaymentOption].text }}
        </span>
      </p>
    </div>

    <div>
      <strong>Hyrbil:</strong>
      <p class="flex flex-col mb-2">
        <span>{{ props.repairShopData.isRentalCar ? 'Erbjuds' : 'Erbjuds inte' }} </span>
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <p>
        Offerten är skickad utan att verkstaden har inspekterat din bil. Den baseras på den
        information du har lämnat och annan tillgänglig information om din bil. Erbjudandet är
        endast bindande när verkstaden har bekräftat tid och datum för inlämning av bilen.
      </p>
      <p>
        Det kan finnas fel, defekter eller reparationsbehov som endast kan upptäckas vid en fysisk
        inspektion av bilen. Om arbetet inte kan utföras enligt den angivna offerten ska verkstaden
        alltid att kontakta dig för att få ditt godkännande för eventuella ändringar.
      </p>
      <p>
        All information i offerten lämnas av verkstaden själv, och FixMatch tar därför inget ansvar
        för eventuella fel eller brister i offerten.
      </p>
    </div>
  </section>
</template>
