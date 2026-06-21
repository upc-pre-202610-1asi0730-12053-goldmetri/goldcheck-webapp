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

  // Fetch only incidents belonging to the current operator
  async function fetchIncidents() {
    loading.value = true
    errors.value  = []
    try {
      const iamStore = useIamStore()
      const userId   = String(iamStore.currentUser?.userId || '')
      const res      = await incidentManagementApi.getAllIncidents()
      if (res.status !== 200) { incidents.value = []; return }
      const resources = Array.isArray(res.data) ? res.data : []
      const filtered  = userId ? resources.filter(r => String(r.operatorId ?? r.OperatorId ?? '') === userId) : []
      incidents.value = filtered.map(r => IncidentAssembler.toEntityFromResource(r))
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  // US – Commit Accident → evento Accident committed
  async function createIncident(data) {
    errors.value  = []
    loading.value = true
    try {
      const iamStore   = useIamStore()
      const operatorId = String(iamStore.currentUser?.userId || 'unknown')

      const res = await incidentManagementApi.commitAccident(operatorId, data.description || '')
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

  async function closeIncident(id) {
    return escalateIncident(id, 'Low')
  }

  return {
    incidents, loading, errors,
    openIncidents, criticalIncidents, openCount,
    fetchIncidents, createIncident, closeIncident, escalateIncident
  }
})
