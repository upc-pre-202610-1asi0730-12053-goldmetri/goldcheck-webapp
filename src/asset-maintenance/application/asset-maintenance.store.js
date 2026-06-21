import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { assetMaintenanceApi } from '../infrastructure/asset-maintenance-api.js'

function toVehicle(r) {
  return {
    id:               r.id,
    machineryId:      r.machineryId,
    name:             `${r.oem} ${r.model}`,
    plate:            r.machineryId,
    type:             'Camión Minero',
    maintenanceStatus: r.maintenanceStatus,
    status:           r.maintenanceStatus === 'UnderMaintenance' ? 'Mantenimiento' : 'Disponible',
    engineHours:      r.engineHours || 0
  }
}

export const useAssetMaintenanceStore = defineStore('asset-maintenance', () => {
  const machinery = ref([])
  const loading   = ref(false)
  const errors    = ref([])

  const activeMachinery      = computed(() => machinery.value.filter(m => m.maintenanceStatus !== 'UnderMaintenance'))
  const maintenanceMachinery = computed(() => machinery.value.filter(m => m.maintenanceStatus === 'UnderMaintenance'))
  const activeCount          = computed(() => activeMachinery.value.length)

  const vehicles            = machinery
  const maintenanceVehicles = maintenanceMachinery

  async function fetchVehicles() {
    loading.value = true
    errors.value  = []
    try {
      const res = await assetMaintenanceApi.getAllMachinery()
      machinery.value = (res.data || []).map(toVehicle)
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function sendToMaintenance(machineryId, engineHours = 0) {
    errors.value = []
    try {
      const res = await assetMaintenanceApi.scheduleMaintenance(machineryId, engineHours)
      const idx = machinery.value.findIndex(m => m.id === machineryId || m.machineryId === machineryId)
      if (idx !== -1) machinery.value[idx] = toVehicle(res.data)
      return true
    } catch {
      errors.value = ['updateError']
      return false
    }
  }

  async function dischargeMachinery(machineryId, reason) {
    errors.value = []
    try {
      const res = await assetMaintenanceApi.dischargeMachinery(machineryId, reason)
      const idx = machinery.value.findIndex(m => m.id === machineryId || m.machineryId === machineryId)
      if (idx !== -1) machinery.value[idx] = toVehicle(res.data)
      return true
    } catch {
      errors.value = ['updateError']
      return false
    }
  }

  async function registerMachinery(data) {
    errors.value = []
    try {
      const res = await assetMaintenanceApi.registerMachinery(data)
      machinery.value.push(res.data)
      return true
    } catch {
      errors.value = ['registerError']
      return false
    }
  }

  return {
    machinery, vehicles, loading, errors,
    activeMachinery, maintenanceMachinery, maintenanceVehicles, activeCount,
    fetchVehicles, sendToMaintenance, dischargeMachinery, registerMachinery
  }
})
