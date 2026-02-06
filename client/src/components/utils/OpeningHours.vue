<script setup lang="ts">
import type { ITimeSlot } from '@/models/ITimeSlot'
import { computed, onMounted, ref, watch, type PropType } from 'vue'
import { timeOptions } from './timeOptions'

const props = defineProps({
  firstSignIn: {
    type: Boolean,
    required: true
  },
  userData: {
    type: Array as PropType<ITimeSlot[]>,
    required: false
  }
})

const emit = defineEmits<{ (e: 'selectedTimes', value: ITimeSlot[]): void }>()

const selectedTimes = ref<ITimeSlot[]>([])
const weekOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function timeToMinutes(time: string): number {
  if (!time) return 0
  const hours = parseInt(time.substring(0, 2))
  const minutes = parseInt(time.substring(2))
  return hours * 60 + minutes
}

function getFilteredTimeOptions(
  slot: ITimeSlot,
  type: 'open' | 'close' | 'lunchStart' | 'lunchEnd'
) {
  return computed(() => {
    let filteredOptions = timeOptions.map((option) => ({
      ...option,
      disabled: option.disabled || false
    }))

    switch (type) {
      case 'open':
        if (slot.close) {
          filteredOptions = filteredOptions.map((option) => ({
            ...option,
            disabled: Boolean(
              option.disabled || timeToMinutes(option.value) >= timeToMinutes(slot.close)
            )
          }))
        }
        break

      case 'close':
        if (slot.open) {
          filteredOptions = filteredOptions.map((option) => ({
            ...option,
            disabled: Boolean(
              option.disabled || timeToMinutes(option.value) <= timeToMinutes(slot.open)
            )
          }))
        }
        break

      case 'lunchStart':
        filteredOptions = filteredOptions.map((option) => ({
          ...option,
          disabled: Boolean(
            option.disabled ||
              timeToMinutes(option.value) <= timeToMinutes(slot.open) ||
              timeToMinutes(option.value) >= timeToMinutes(slot.close) ||
              (slot.lunchEnd && timeToMinutes(option.value) >= timeToMinutes(slot.lunchEnd))
          )
        }))
        break

      case 'lunchEnd':
        filteredOptions = filteredOptions.map((option) => ({
          ...option,
          disabled: Boolean(
            option.disabled ||
              (slot.lunchStart && timeToMinutes(option.value) <= timeToMinutes(slot.lunchStart)) ||
              timeToMinutes(option.value) >= timeToMinutes(slot.close)
          )
        }))
        break
    }

    return filteredOptions
  })
}

const weeklyHours = ref<ITimeSlot[]>([
  {
    day: 'monday',
    open: '0730',
    close: '1630',
    lunchStart: '1200',
    lunchEnd: '1300',
    id: '5ca5578b0c5d1',
    isOpen: true,
    hasLunch: false
  },
  {
    day: 'tuesday',
    open: '0730',
    close: '1630',
    lunchStart: '1200',
    lunchEnd: '1300',
    id: '5ca5578b0c5d8',
    isOpen: true,
    hasLunch: false
  },
  {
    day: 'wednesday',
    open: '0730',
    close: '1630',
    lunchStart: '1200',
    lunchEnd: '1300',
    id: '5ca5578b0c5df',
    isOpen: true,
    hasLunch: false
  },
  {
    day: 'thursday',
    open: '0730',
    close: '1630',
    lunchStart: '1200',
    lunchEnd: '1300',
    id: '5ca5578b0c5e6',
    isOpen: true,
    hasLunch: false
  },
  {
    day: 'friday',
    open: '0730',
    close: '1630',
    lunchStart: '1200',
    lunchEnd: '1300',
    id: '5ca5578b0c5ec',
    isOpen: true,
    hasLunch: false
  },
  {
    day: 'saturday',
    open: '0900',
    close: '1600',
    lunchStart: '',
    lunchEnd: '',
    id: '5ca5578b0c5f8',
    isOpen: false,
    hasLunch: false
  },
  {
    day: 'sunday',
    open: '',
    close: '',
    lunchStart: '',
    lunchEnd: '',
    id: '5ca5578b0c5c7',
    isOpen: false,
    hasLunch: false
  }
])

function handleSelectedTimes(time: string, slotId: string, type: 'open' | 'close') {
  const formattedTime = time.replace(':', '')

  const slot = weeklyHours.value.find((slot) => slot.id === slotId)
  if (!slot) return

  if (type === 'open') {
    slot.open = formattedTime

    if (slot.hasLunch && timeToMinutes(slot.lunchStart) <= timeToMinutes(formattedTime)) {
      slot.lunchStart = formattedTime

      if (timeToMinutes(slot.lunchEnd) <= timeToMinutes(formattedTime)) {
        slot.lunchEnd = slot.close
      }
    }
  } else if (type === 'close') {
    slot.close = formattedTime

    if (slot.hasLunch && timeToMinutes(slot.lunchEnd) >= timeToMinutes(formattedTime)) {
      slot.lunchEnd = formattedTime

      if (timeToMinutes(slot.lunchStart) >= timeToMinutes(formattedTime)) {
        slot.lunchStart = slot.open
      }
    }
  }

  emit('selectedTimes', weeklyHours.value)
}

function toggleDay(day: string) {
  const index = weekOrder.indexOf(day)
  const dayData = weeklyHours.value[index]

  if (!dayData) return

  dayData.isOpen = !dayData.isOpen

  if (!dayData.isOpen) {
    dayData.open = ''
    dayData.close = ''
    dayData.lunchStart = ''
    dayData.lunchEnd = ''
    dayData.hasLunch = false
  } else {
    const userDataSlot = props.userData?.[index]

    if (userDataSlot?.isOpen) {
      dayData.open = userDataSlot.open
      dayData.close = userDataSlot.close
      dayData.lunchStart = userDataSlot.lunchStart
      dayData.lunchEnd = userDataSlot.lunchEnd
      dayData.hasLunch = userDataSlot.hasLunch
    } else {
      dayData.open = '0730'
      dayData.close = '1630'
      dayData.lunchStart = '1200'
      dayData.lunchEnd = '1300'
      dayData.hasLunch = false
    }
  }
}

function toggleLunch(day: string) {
  const index = weekOrder.indexOf(day)
  const dayData = weeklyHours.value[index]

  if (!dayData) return

  dayData.hasLunch = !dayData.hasLunch

  if (!dayData.hasLunch) {
    dayData.lunchStart = ''
    dayData.lunchEnd = ''
  } else {
    const userDataSlot = props.userData?.[index]

    if (userDataSlot?.hasLunch) {
      dayData.lunchStart = userDataSlot.lunchStart
      dayData.lunchEnd = userDataSlot.lunchEnd
    } else {
      dayData.lunchStart = '1200'
      dayData.lunchEnd = '1300'
    }
  }

  emit('selectedTimes', weeklyHours.value)
}

watch(
  () => props.userData,
  (newUserData) => {
    if (newUserData?.length) {
      weeklyHours.value = newUserData.map((slot) => ({ ...slot }))
      emit('selectedTimes', weeklyHours.value)
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.userData?.length) {
    weeklyHours.value = props.userData.map((slot) => ({
      ...slot
    }))
  }

  emit('selectedTimes', props.userData ? selectedTimes.value : weeklyHours.value)
})
</script>

<template>
  <form class="">
    <h2 class="text-lg mb-4">Öppetider</h2>

    <div class="flex flex-col gap-6">
      <div v-for="(slot, index) in weeklyHours" :key="slot.id" class="">
        <div class="flex flex-col justify-center gap-4">
          <div class="capitalize">{{ weekOrder[index] }}</div>

          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              :checked="slot.isOpen"
              class="sr-only peer"
              @change="toggleDay(weekOrder[index])"
            />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
            ></div>
          </label>

          <div v-if="slot.isOpen" class="">
            <div class="flex flex-col justify-center gap-4 mb-4 border-b pb-4">
              <p>Öppettider</p>

              <select
                v-model="slot.open"
                class="select-light w-full"
                @change="
                  (e) => handleSelectedTimes((e.target as HTMLSelectElement).value, slot.id, 'open')
                "
              >
                <option
                  v-for="option in getFilteredTimeOptions(slot, 'open').value"
                  :key="option.value"
                  :value="option.value"
                  :disabled="option.disabled"
                >
                  {{ option.label }}
                </option>
              </select>

              <select
                v-model="slot.close"
                class="select-light w-full"
                @change="
                  (e) =>
                    handleSelectedTimes((e.target as HTMLSelectElement).value, slot.id, 'close')
                "
              >
                <option
                  v-for="option in getFilteredTimeOptions(slot, 'close').value"
                  :key="option.value"
                  :value="option.value"
                  :disabled="option.disabled"
                >
                  {{ option.label }}
                </option>
              </select>

              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="slot.hasLunch"
                  @change="toggleLunch(weekOrder[index])"
                  class="form-checkbox h-5 w-5"
                />
                <span>Lunchstängt</span>
              </label>

              <div v-if="slot.hasLunch" class="flex flex-col gap-4">
                <div class="font-medium">Lunchtid</div>
                <select v-model="slot.lunchStart" class="select-light w-full">
                  <option
                    v-for="option in getFilteredTimeOptions(slot, 'lunchStart').value"
                    :key="option.value"
                    :value="option.value"
                    :disabled="option.disabled"
                  >
                    {{ option.label }}
                  </option>
                </select>

                <select v-model="slot.lunchEnd" class="select-light w-full">
                  <option
                    v-for="option in getFilteredTimeOptions(slot, 'lunchEnd').value"
                    :key="option.value"
                    :value="option.value"
                    :disabled="option.disabled"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>
