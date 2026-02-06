<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  checkInputData: {
    type: Function,
    required: false
  },
  inputData: {
    type: Function,
    required: true
  },
  inputName: {
    type: String,
    required: true
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
  (newValue) => {
    inputValue.value = newValue
  }
)

function handleChange() {
  if (props.checkInputData) props.checkInputData(props.inputName)
  props.inputData(inputValue.value)
  emit('update:modelValue', inputValue.value)
}
</script>

<template>
  <textarea
    :name="props.inputName"
    placeholder=""
    v-model="inputValue"
    @input="handleChange"
    :class="['w-full px-2', props.light ? 'textarea-input-light' : 'textarea-input']"
  ></textarea>
</template>
