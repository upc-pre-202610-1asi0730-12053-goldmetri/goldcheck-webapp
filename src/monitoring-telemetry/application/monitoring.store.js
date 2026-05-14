import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { monitoringApi } from '../infrastructure/monitoring-api.js'
import { AnomalyAlertAssembler } from '../infrastructure/anomaly-alert.assembler.js'

export const useMonitoringStore = defineStore('monitoring', () => {
  const alerts        = ref([])
  const activeBatches = ref([])
  const loading       = ref(false)
  const errors        = ref([])

  const activeAlerts   = computed(() => alerts.value.filter(a => a.isActive))
  const criticalAlerts = computed(() => alerts.value.filter(a => a.isCritical && a.isActive))
  const alertCount     = computed(() => activeAlerts.value.length)

  async function fetchAlerts() {
    loading.value = true
    errors.value  = []
    try {
      const res = await monitoringApi.getAlerts()
      alerts.value = AnomalyAlertAssembler.toEntities(res)
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function fetchActiveBatches() {
    try {
      const res = await monitoringApi.getActiveBatches()
      activeBatches.value = res.data || []
    } catch {
      errors.value = ['fetchError']
    }
  }

  // US19 – Generar alerta de retraso o desvío
  async function createAlert(batchId, batchCode, vehicleId, alertType, severity, description) {
    errors.value = []
    try {
      const payload = {
        batchId, batchCode, vehicleId, alertType,
        severity, description, status: 'Activa',
        detectedAt: new Date().toISOString()
      }
      const res = await monitoringApi.createAlert(payload)
      alerts.value.unshift(AnomalyAlertAssembler.toEntity(res.data))
      return true
    } catch {
      errors.value = ['createError']
      return false
    }
  }

  async function resolveAlert(alertId) {
    errors.value = []
    try {
      await monitoringApi.resolveAlert(alertId)
      const idx = alerts.value.findIndex(a => a.id === alertId)
      if (idx !== -1) alerts.value[idx].status = 'Resuelta'
      return true
    } catch {
      errors.value = ['updateError']
      return false
    }
  }

  return {
    alerts, activeBatches, loading, errors,
    activeAlerts, criticalAlerts, alertCount,
    fetchAlerts, fetchActiveBatches, createAlert, resolveAlert
  }
})
