<script setup lang="ts">
import { onMounted, ref, watch, type PropType } from 'vue'

const props = defineProps({
  checkInputData: {
    type: Function,
    required: true
  },
  inputData: {
    type: Function,
    required: true
  },
  inputType: {
    type: String,
    required: true
  },
  inputName: {
    type: String,
    required: true
  },
  isDataCorrect: {
    type: Boolean,
    required: true
  },
  dataError: {
    type: String as PropType<'validation' | 'server' | ''>
  },
  predefinedValue: {
    type: String
  },
  onBlur: {
    type: Function
  },
  modelValue: {
    type: String,
    default: ''
  },
  light: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const inputValue = ref(props.modelValue || '')

watch(
  () => props.modelValue,
  async (newValue) => {
    inputValue.value = newValue
  }
)

function handleChange() {
  props.checkInputData(props.inputName)
  props.inputData(inputValue.value)
  emit('update:modelValue', inputValue.value)
}

function handleBlur() {
  if (props.onBlur) {
    props.onBlur(inputValue.value)
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue
  }
)

onMounted(() => {
  inputValue.value = props.predefinedValue || ''
})
</script>

<template>
  <input
    :type="props.inputType"
    :name="props.inputName"
    placeholder=""
    v-model="inputValue"
    @input="handleChange"
    @blur="handleBlur"
    :class="[
      'w-full px-2',
      !props.isDataCorrect && props.dataError === 'validation' && !props.light && 'input-warning',
      !props.isDataCorrect &&
        props.dataError === 'validation' &&
        props.light &&
        'input-warning-light',
      !props.isDataCorrect && props.dataError === 'server' && !props.light && 'input-error',
      !props.isDataCorrect && props.dataError === 'server' && props.light && 'input-error-light',
      $attrs.class,
      props.light ? 'text-input-light' : 'text-input'
    ]"
  />
</template>
