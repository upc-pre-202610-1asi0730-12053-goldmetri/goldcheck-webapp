import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { monitoringApi } from '../infrastructure/monitoring-api.js'
import { AnomalyAlertAssembler } from '../infrastructure/anomaly-alert.assembler.js'
import { useIamStore } from '../../iam/application/iam.store.js'

function getUserMachineryIds() {
  const iamStore = useIamStore()
  const userId   = iamStore.currentUser?.userId
  if (!userId) return []
  try { return JSON.parse(localStorage.getItem(`gc_machinery_${userId}`) || '[]') } catch { return [] }
}

export const useMonitoringStore = defineStore('monitoring', () => {
  const alerts          = ref([])
  const activeBatches   = ref([])
  const temperatureData = ref(null)
  const speedData       = ref(null)
  const pressureData    = ref(null)
  const gnssData        = ref(null)
  const selectedAssetId = ref('')
  const loading         = ref(false)
  const errors          = ref([])

  const userMachineryIds = computed(() => getUserMachineryIds())

  const activeAlerts   = computed(() => alerts.value.filter(a => a.status === 'Activa'))
  const criticalAlerts = computed(() => alerts.value.filter(a =>
    ['CRITICAL', 'HIGH'].includes(a.severity) && a.status === 'Activa'
  ))
  const alertCount = computed(() => activeAlerts.value.length)

  async function fetchAlerts() {
    loading.value = true
    errors.value  = []
    try {
      const iamStore = useIamStore()
      const userId   = String(iamStore.currentUser?.userId || '')
      const res      = await monitoringApi.getAllIncidents()
      if (res.status !== 200) { alerts.value = []; return }
      const resources = Array.isArray(res.data) ? res.data : []
      const filtered  = userId ? resources.filter(r => String(r.operatorId ?? r.OperatorId ?? '') === userId) : []
      alerts.value    = filtered.map(r => AnomalyAlertAssembler.toEntityFromResource(r))
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function fetchActiveBatches() {
    try {
      const iamStore = useIamStore()
      const userId   = iamStore.currentUser?.userId
      const res      = await monitoringApi.getActiveCycles()
      const all      = res.data || []
      if (userId) {
        const ids = JSON.parse(localStorage.getItem(`gc_cycles_${userId}`) || '[]')
        activeBatches.value = all.filter(c => ids.includes(c.id))
      } else {
        activeBatches.value = []
      }
    } catch {
      errors.value = ['fetchError']
    }
  }

  async function monitorTemperature(assetId) {
    try {
      await monitoringApi.monitorTemperature(assetId)
      const res = await monitoringApi.getTemperature(assetId)
      temperatureData.value = res.data || null
    } catch { temperatureData.value = null }
  }

  async function monitorSpeed(assetId) {
    try {
      await monitoringApi.monitorSpeed(assetId)
      const res = await monitoringApi.getSpeed(assetId)
      speedData.value = res.data || null
    } catch { speedData.value = null }
  }

  async function monitorPressure(assetId) {
    try {
      await monitoringApi.monitorPressure(assetId)
      const res = await monitoringApi.getPressure(assetId)
      pressureData.value = res.data || null
    } catch { pressureData.value = null }
  }

  async function monitorGNSS(assetId) {
    try {
      await monitoringApi.monitorGNSS(assetId)
      const res = await monitoringApi.getGNSS(assetId)
      gnssData.value = res.data || null
    } catch { gnssData.value = null }
  }

  async function monitorAll(assetId) {
    selectedAssetId.value = assetId
    await Promise.allSettled([
      monitorTemperature(assetId),
      monitorSpeed(assetId),
      monitorPressure(assetId),
      monitorGNSS(assetId)
    ])
  }

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

  async function resolveAlert(alertId, assetId = '') {
    errors.value = []
    try {
      await monitoringApi.validateTelemetry(assetId, String(alertId))
      const idx = alerts.value.findIndex(a => a.id === alertId)
      if (idx !== -1) alerts.value[idx] = { ...alerts.value[idx], status: 'Resuelta' }
      return true
    } catch {
      errors.value = ['updateError']
      return false
    }
  }

  return {
    alerts, activeBatches, loading, errors,
    temperatureData, speedData, pressureData, gnssData,
    selectedAssetId, userMachineryIds,
    activeAlerts, criticalAlerts, alertCount,
    fetchAlerts, fetchActiveBatches, monitorAll,
    monitorTemperature, monitorSpeed, monitorPressure, monitorGNSS,
    createAlert, resolveAlert
  }
})
