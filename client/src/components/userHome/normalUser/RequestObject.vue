<script setup lang="ts">
import LandingFooter from '@/components/footer/LandingFooter.vue'
import LandingNav from '@/components/nav/LandingNav.vue'
import type { IJobResponse } from '@/models/IJobResponse'
import type { IServerResponse } from '@/models/IServerResponse'
import { getJobResponse } from '@/services/userContact'
import { onMounted, ref } from 'vue'
import JobAnswer from './JobAnswer.vue'

const getJobIdFromUrl = () => {
  // First try to get from the pathname (for URLs like /job:id=xxx)
  const pathname = window.location.pathname
  if (pathname.includes(':id=')) {
    const idPart = pathname.split(':id=')[1]
    return idPart.split('&')[0]
  }
  
  const hashPart = window.location.hash
  if (hashPart.includes(':id=')) {
    const idPart = hashPart.split(':id=')[1]
    return idPart.split('&')[0]
  }
  
  return null
}

const disableBookingBtn = ref(false)

const error = ref('')

const jobResponseArray = ref<IJobResponse[]>([])

async function fetchJobResponse() {
  const jobId = getJobIdFromUrl()

  if (jobId) {
    try {
      const response = (await getJobResponse({ id: jobId })) as IServerResponse
      jobResponseArray.value = []

      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((item: IJobResponse) => {
          jobResponseArray.value.push(item)
        })
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        response.data.data.forEach((item: IJobResponse) => {
          jobResponseArray.value.push(item)
        })
      }
    } catch (err: any) {
      console.error('Error fetching job response:', err)
      error.value = 'Failed to load repair shop answers'
    } finally {
      // loading.value = false
    }
  } else {
    error.value = 'No job ID found in URL'
    // loading.value = false
  }
}

onMounted(() => {
  fetchJobResponse()
  // filterRepairShopAnswers()
})
</script>

<template>
  <header class="flex flex-col gap-24 lg:gap-36 items-center h-[90px]">
    <nav class="w-full fixed z-10">
      <LandingNav :backgroundColor="true" />
    </nav>
  </header>

  <main>
    <section
      v-for="job in jobResponseArray"
      :key="job.id"
      class="flex flex-col gap-6 items-center lg:mt-8 p-4 max-w-[750px] m-auto"
    >
      <div class="w-full">
        <RouterLink to="/my-jobs" class="flex items-center gap-2 text-sky-blue inter-normal"
          ><fontAwesome :icon="['fas', 'chevron-left']" /> Tillbaka till alla uppdrag</RouterLink
        >
      </div>
      <div class="flex flex-col gap-4 w-full bg-sky-white p-4 rounded-lg drop-shadow-lg">
        <div class="flex gap-2">
          <div class="rounded-lg blue-100 p-2 text-sky-blue absolute">
            <fontAwesome :icon="['fas', 'car-side']" />
          </div>

          <div class="flex flex-col gap-2 ml-12">
            <p class="text-lg">{{ job.registrationNumber }}</p>
            <p class="text-third">
              {{
                Array.isArray(job.customerMessage) && job.customerMessage[0]
                  ? job.customerMessage[0].work
                  : ''
              }}
            </p>
            <p class="text-third">
              Välj den offert som passar dig bäst baserat på pris och avstånd
            </p>
          </div>
        </div>
      </div>
    </section>

    <div v-if="jobResponseArray.length">
      <div v-for="job in jobResponseArray" :key="job.id">
        <template v-if="Array.isArray(job.repairShopAnswers)">
          <JobAnswer
            v-for="(answer, i) in job.repairShopAnswers"
            :key="`${job.id}-${i}`"
            :answer="answer"
            :customerMessage="job.customerMessage"
            :request="job"
            :repairShop="i < job.repairShops.length ? job.repairShops[i] : job.repairShops[0]"
            :disableBookingBtn="disableBookingBtn"
            @disableButtons="disableBookingBtn = true"
          />
        </template>
        <template v-else>
          <JobAnswer
            :key="job.id"
            :answer="job.repairShopAnswers"
            :customerMessage="job.customerMessage"
            :request="job"
            :repairShop="job.repairShops[0]"
            :disableBookingBtn="disableBookingBtn"
            @disableButtons="disableBookingBtn = true"
          />
        </template>
      </div>
    </div>
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    <div v-else class="loading-message">Loading...</div>
  </main>

  <footer>
    <LandingFooter />
  </footer>
</template>
