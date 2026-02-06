<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  options: Option[]
  setSelectedOption: (option: string[]) => void
  setSelectedKey: (key: string[]) => void
  emptyValues: Boolean
  selectedWork: [string[], string, string, string, number][]
}>()

type Option = {
  key: string
  value: string
}

const selectedOption = ref<string[]>([])
const selectedKey = ref<string[]>([])
const selectedOptions = ref<Option[]>([])
const keyType = ref('')
const selectedTypes = ref<string[]>([])

function handleSelectedValueRadio(optionValue: string, optionKey: string) {
  selectedOption.value = [optionValue]
  selectedKey.value = [optionKey]
  props.setSelectedOption(selectedOption.value)
  props.setSelectedKey(selectedKey.value)
}

function handleSelectedValueCheckBox(optionValue: string) {
  const index = selectedOption.value.indexOf(optionValue)
  if (index === -1) {
    selectedOption.value.push(optionValue)
  } else {
    selectedOption.value.splice(index, 1)
  }
  props.setSelectedOption(selectedOption.value)
}

watch(
  () => props.options,
  (newOptions) => {
    if (newOptions.length > 0) {
      keyType.value = newOptions[0].key
      selectedOptions.value = [...newOptions]
    } else {
      keyType.value = ''
      selectedOptions.value = []
    }
    if (props.emptyValues) {
      selectedOption.value = []
    }
    props.setSelectedOption(selectedOption.value)
  },
  { immediate: true, deep: true }
)

watch(
  () => props.selectedWork,
  (newVal) => {
    selectedTypes.value = newVal.map((work) => work[2])
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div v-if="keyType === 'radio'" class="flex flex-col gap-4">
    <button
      v-for="option in selectedOptions"
      :key="option.key"
      type="button"
      :class="[
        'text-main border-button-light text-sm',
        selectedOption.includes(option.value) && 'border-button-active-light'
      ]"
      @click="handleSelectedValueRadio(option.value, option.key)"
    >
      <p class="text-main">{{ option.value }}</p>
    </button>
  </div>

  <div v-if="keyType === 'checkBox'" class="flex flex-col gap-4">
    <button
      v-for="option in props.options"
      :key="option.key"
      type="button"
      :class="[
        'text-main border-button-light text-sm',
        selectedOption.includes(option.value) && 'border-button-active-light'
      ]"
      @click="handleSelectedValueCheckBox(option.value)"
    >
      <p class="text-main">{{ option.value }}</p>
    </button>
  </div>
</template>
