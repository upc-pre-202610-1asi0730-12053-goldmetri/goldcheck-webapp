import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { assetMaintenanceApi } from '../infrastructure/asset-maintenance-api.js'

export const useAssetMaintenanceStore = defineStore('asset-maintenance', () => {
  const vehicles = ref([])
  const loading  = ref(false)
  const errors   = ref([])

  const activeVehicles      = computed(() => vehicles.value.filter(v => v.status !== 'Mantenimiento'))
  const maintenanceVehicles = computed(() => vehicles.value.filter(v => v.status === 'Mantenimiento'))
  const activeCount         = computed(() => activeVehicles.value.length)

  async function fetchVehicles() {
    loading.value = true
    errors.value  = []
    try {
      const res = await assetMaintenanceApi.getVehicles()
      vehicles.value = res.data || []
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function sendToMaintenance(vehicleId) {
    errors.value = []
    try {
      await assetMaintenanceApi.updateVehicleStatus(vehicleId, 'Mantenimiento')
      const idx = vehicles.value.findIndex(v => v.id === vehicleId)
      if (idx !== -1) vehicles.value[idx].status = 'Mantenimiento'
      return true
    } catch {
      errors.value = ['updateError']
      return false
    }
  }

  async function activateVehicle(vehicleId) {
    errors.value = []
    try {
      await assetMaintenanceApi.updateVehicleStatus(vehicleId, 'Activo')
      const idx = vehicles.value.findIndex(v => v.id === vehicleId)
      if (idx !== -1) vehicles.value[idx].status = 'Activo'
      return true
    } catch {
      errors.value = ['updateError']
      return false
    }
  }

  return {
    vehicles, loading, errors,
    activeVehicles, maintenanceVehicles, activeCount,
    fetchVehicles, sendToMaintenance, activateVehicle
  }
})
