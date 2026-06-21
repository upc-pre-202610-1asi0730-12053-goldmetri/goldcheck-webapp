import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { assetMaintenanceApi } from '../infrastructure/asset-maintenance-api.js'
import { useIamStore } from '../../iam/application/iam.store.js'

function getMachineryKey() {
  const iamStore = useIamStore()
  return `gc_machinery_${iamStore.currentUser?.userId || 'guest'}`
}
function getUserMachineryIds() {
  try { return JSON.parse(localStorage.getItem(getMachineryKey()) || '[]') } catch { return [] }
}
function addUserMachineryId(id) {
  const ids = getUserMachineryIds()
  if (!ids.includes(id)) { ids.push(id); localStorage.setItem(getMachineryKey(), JSON.stringify(ids)) }
}

function toVehicle(r) {
  const machineryId       = r.machineryId       ?? r.MachineryId       ?? ''
  const model             = r.model             ?? r.Model             ?? ''
  const oem               = r.oem               ?? r.OEM               ?? r.oEM ?? ''
  const maintenanceStatus = r.maintenanceStatus ?? r.MaintenanceStatus ?? ''
  const engineHours       = r.engineHours       ?? r.EngineHours       ?? 0
  return {
    id:                r.id ?? r.Id,
    machineryId,
    name:              `${oem} ${model}`.trim() || machineryId,
    plate:             machineryId,
    model,
    oem,
    type:              'Camión Minero',
    maintenanceStatus,
    status:            maintenanceStatus === 'UnderMaintenance' ? 'Mantenimiento' : 'Disponible',
    engineHours
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
      const res    = await assetMaintenanceApi.getAllMachinery()
      const all    = (res.data || []).map(toVehicle)
      const userIds = getUserMachineryIds()
      machinery.value = userIds.length ? all.filter(m => userIds.includes(m.machineryId)) : []
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  // US – Register Machinery → evento Machinery registered
  async function registerMachinery(data) {
    errors.value = []
    loading.value = true
    try {
      const res = await assetMaintenanceApi.registerMachinery(data)
      const mapped = toVehicle(res.data)
      addUserMachineryId(mapped.machineryId || data.machineryId)
      machinery.value.push(mapped)
      return true
    } catch (e) {
      errors.value = [e?.response?.status === 409 ? 'machineryExists' : 'registerError']
      return false
    } finally {
      loading.value = false
    }
  }

  // US – Update Machinery Data → evento Machinery data updated
  async function updateEngineHours(machineryId, currentEngineHours) {
    errors.value = []
    try {
      const res = await assetMaintenanceApi.updateEngineHours(machineryId, currentEngineHours)
      const idx = machinery.value.findIndex(m => m.machineryId === machineryId)
      if (idx !== -1) machinery.value[idx] = toVehicle(res.data)
      return true
    } catch {
      errors.value = ['updateError']
      return false
    }
  }

  // US – Schedule Preventive Maintenance → evento Preventive maintenance scheduled
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

  // US – Discharge Machinery → evento Machinery discharged
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

  return {
    machinery, vehicles, loading, errors,
    activeMachinery, maintenanceMachinery, maintenanceVehicles, activeCount,
    fetchVehicles, registerMachinery, updateEngineHours, sendToMaintenance, dischargeMachinery
  }
})
