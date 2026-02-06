<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  // checkInputData: {
  //   type: Function,
  //   required: true
  // },
  selectData: {
    type: Function,
    required: true
  },
  // selectDataType: {
  //   type: Function,
  //   required: true
  // },
  selectedWork: {
    type: Array,
    required: true
  }
})

const workType = ref('')
const selectedTypes = ref<string[]>([])

const route = useRoute()

function handleChange() {
  // props.checkInputData('isTypeOfWork')
  props.selectData(workType.value)
}

watch(
  () => props.selectedWork as [string[], string, string][],
  (newVal: [string[], string, string][]) => {
    selectedTypes.value = []
    newVal.forEach((entry) => {
      selectedTypes.value.push(entry[2])
    })

    if (workType.value && selectedTypes.value.includes(workType.value)) {
      workType.value = ''
    }
  },
  { deep: true }
)

onMounted(() => {
  if (route.query.job) {
    const jobTypeMap: Record<string, string> = {
      detailing: 'Bilvård',
      service: 'Service',
      'ac-service': 'AC'
    }

    const jobParam = route.query.job as string
    const mappedJobType = jobTypeMap[jobParam]

    if (mappedJobType && !selectedTypes.value.includes(mappedJobType)) {
      workType.value = mappedJobType
      handleChange()
    }
  }
})
</script>

<template>
  <label for="workType" class="font-text-light flex flex-col gap-1 text-main"
    ><span>Typ av arbete</span>
    <select
      name="workType"
      class="select-light text-sm max-w-full"
      v-model="workType"
      @change="handleChange"
    >
      <option value="" selected default disabled>Välj typ av arbete</option>
      <option value="AC">AC</option>
      <option value="Avgaser">Avgaser</option>
      <option value="Batteri">Batteri</option>
      <option value="Besiktning och förkontroll">Besiktning och förkontroll</option>
      <option value="Bilvård">Fordonsvård</option>
      <option value="Bromsar">Bromsar</option>
      <option value="Hjulinställning">Hjulinställning</option>
      <option value="Service">Service</option>
    </select>
  </label>
</template>
