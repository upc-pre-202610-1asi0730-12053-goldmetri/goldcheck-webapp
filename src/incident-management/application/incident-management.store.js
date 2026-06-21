import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { incidentManagementApi } from '../infrastructure/incident-management-api.js'
import { IncidentAssembler } from '../infrastructure/incident.assembler.js'
import { useIamStore } from '../../iam/application/iam.store.js'

export const useIncidentManagementStore = defineStore('incident-management', () => {
  const incidents = ref([])
  const loading   = ref(false)
  const errors    = ref([])

  const openIncidents     = computed(() => incidents.value.filter(i => i.status !== 'Closed'))
  const criticalIncidents = computed(() => incidents.value.filter(i => i.severity === 'critical'))
  const openCount         = computed(() => openIncidents.value.length)

  async function fetchIncidents() {
    loading.value = true
    errors.value  = []
    try {
      const res = await incidentManagementApi.getAllIncidents()
      incidents.value = IncidentAssembler.toEntitiesFromResponse(res)
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function createIncident(data) {
    errors.value = []
    loading.value = true
    try {
      const iamStore  = useIamStore()
      const operatorId = iamStore.currentUser?.userId || iamStore.currentUser?.id || 'unknown'
      const assetId    = data.assetId || data.batchId || 'unknown'

      let res
      if (data.incidentType === 'SMOKE') {
        res = await incidentManagementApi.detectSmoke(assetId)
      } else if (data.incidentType === 'FATIGUE') {
        res = await incidentManagementApi.detectFatigue(operatorId, assetId)
      } else {
        res = await incidentManagementApi.commitAccident(operatorId, data.description || '')
      }

      incidents.value.unshift(IncidentAssembler.toEntityFromResource(res.data))
      return true
    } catch {
      errors.value = ['createError']
      return false
    } finally {
      loading.value = false
    }
  }

  async function escalateIncident(id, newRiskLevel = 'High') {
    errors.value = []
    try {
      const res = await incidentManagementApi.escalateRiskLevel(id, newRiskLevel)
      const idx = incidents.value.findIndex(i => i.id === id)
      if (idx !== -1) incidents.value[idx] = IncidentAssembler.toEntityFromResource(res.data)
      return true
    } catch {
      errors.value = ['updateError']
      return false
    }
  }

  // kept for backward compatibility with views that call closeIncident
  async function closeIncident(id) {
    return escalateIncident(id, 'Low')
  }

  return {
    incidents, loading, errors,
    openIncidents, criticalIncidents, openCount,
    fetchIncidents, createIncident, closeIncident, escalateIncident
  }
})
