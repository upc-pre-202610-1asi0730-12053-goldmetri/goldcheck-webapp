import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { incidentManagementApi } from '../infrastructure/incident-management-api.js'

export const useIncidentManagementStore = defineStore('incident-management', () => {
  const incidents = ref([])
  const loading   = ref(false)
  const errors    = ref([])

  const openIncidents     = computed(() => incidents.value.filter(i => i.status === 'Abierto'))
  const criticalIncidents = computed(() => incidents.value.filter(i => i.severity === 'CRITICAL'))
  const openCount         = computed(() => openIncidents.value.length)

  async function fetchIncidents() {
    loading.value = true
    errors.value  = []
    try {
      const res = await incidentManagementApi.getIncidents()
      if (res.status !== 200) { console.error(`${res.status}, ${res.statusText}`); return }
      incidents.value = res.data
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function createIncident(data) {
    errors.value = []
    try {
      const res = await incidentManagementApi.createIncident({
        ...data, status: 'Abierto', reportedAt: new Date().toISOString()
      })
      incidents.value.unshift(res.data)
      return true
    } catch {
      errors.value = ['createError']
      return false
    }
  }

  async function closeIncident(id) {
    errors.value = []
    try {
      await incidentManagementApi.closeIncident(id)
      const idx = incidents.value.findIndex(i => i.id === id)
      if (idx !== -1) {
        incidents.value[idx] = { ...incidents.value[idx], status: 'Cerrado' }
      }
      return true
    } catch {
      errors.value = ['updateError']
      return false
    }
  }

  return {
    incidents, loading, errors,
    openIncidents, criticalIncidents, openCount,
    fetchIncidents, createIncident, closeIncident
  }
})
