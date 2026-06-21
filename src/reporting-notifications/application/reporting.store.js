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
      const res = await reportingApi.getAllReports()
      const reports = res.data || []
      batchReport.value   = reports
      jewelryReport.value = []
      alertReport.value   = []
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function requestReport(incidentId, supervisorId) {
    errors.value = []
    try {
      const res = await reportingApi.requestAccidentData(incidentId, supervisorId)
      return res.data || null
    } catch {
      errors.value = ['requestError']
      return null
    }
  }

  return {
    batchReport, jewelryReport, alertReport, loading, errors,
    totalBatches, processedBatches, totalAlerts, certifiedItems,
    fetchReports, requestReport
  }
})
