import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { reportingApi } from '../infrastructure/reporting-api.js'

export const useReportingStore = defineStore('reporting', () => {
  const batchReport    = ref([])
  const jewelryReport  = ref([])
  const alertReport    = ref([])
  const loading        = ref(false)
  const errors         = ref([])

  const totalBatches   = computed(() => batchReport.value.length)
  const processedBatches = computed(() => batchReport.value.filter(b => b.status === 'Completado' || b.status === 'Procesado').length)
  const totalAlerts    = computed(() => alertReport.value.length)
  const certifiedItems = computed(() => jewelryReport.value.filter(j => j.status === 'Certificado').length)

  async function fetchReports() {
    loading.value = true
    errors.value  = []
    try {
      const [bRes, jRes, aRes] = await Promise.all([
        reportingApi.getBatchReport(),
        reportingApi.getJewelryReport(),
        reportingApi.getAlertReport()
      ])
      batchReport.value   = bRes.data || []
      jewelryReport.value = jRes.data || []
      alertReport.value   = aRes.data || []
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  return {
    batchReport, jewelryReport, alertReport, loading, errors,
    totalBatches, processedBatches, totalAlerts, certifiedItems,
    fetchReports
  }
})
