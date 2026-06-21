import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { monitoringApi } from '../infrastructure/monitoring-api.js'
import { AnomalyAlertAssembler } from '../infrastructure/anomaly-alert.assembler.js'

export const useMonitoringStore = defineStore('monitoring', () => {
  const alerts        = ref([])
  const activeBatches = ref([])
  const loading       = ref(false)
  const errors        = ref([])

  const activeAlerts   = computed(() => alerts.value.filter(a => a.status === 'Activa'))
  const criticalAlerts = computed(() => alerts.value.filter(a =>
    ['CRITICAL', 'HIGH'].includes(a.severity) && a.status === 'Activa'
  ))
  const alertCount = computed(() => activeAlerts.value.length)

  async function fetchAlerts() {
    loading.value = true
    errors.value  = []
    try {
      const res = await monitoringApi.getAllIncidents()
      alerts.value = AnomalyAlertAssembler.toEntitiesFromResponse(res)
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function fetchActiveBatches() {
    try {
      const res = await monitoringApi.getActiveCycles()
      activeBatches.value = res.data || []
    } catch {
      errors.value = ['fetchError']
    }
  }

  // US19 – Process telemetry anomaly for an asset
  async function createAlert(assetId, rawData = 'anomaly-detected') {
    errors.value = []
    try {
      const res = await monitoringApi.processTelemetry(assetId, rawData)
      alerts.value.unshift(AnomalyAlertAssembler.toEntityFromResource(res.data))
      return true
    } catch {
      errors.value = ['createError']
      return false
    }
  }

  // Validate (resolve) a telemetry record
  async function resolveAlert(alertId, assetId = '') {
    errors.value = []
    try {
      await monitoringApi.validateTelemetry(assetId, String(alertId))
      const idx = alerts.value.findIndex(a => a.id === alertId)
      if (idx !== -1) alerts.value[idx] = alerts.value[idx].clone({ status: 'Resuelta' })
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
