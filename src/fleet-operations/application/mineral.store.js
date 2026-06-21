import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mineralApi } from '../infrastructure/mineral-api.js'
import { MineralBatchAssembler } from '../infrastructure/mineral-batch.assembler.js'
import { useIamStore } from '../../iam/application/iam.store.js'

function getUserCycleKey() {
  const iamStore = useIamStore()
  return `gc_cycles_${iamStore.currentUser?.userId || 'guest'}`
}

function getUserCycleIds() {
  try { return JSON.parse(localStorage.getItem(getUserCycleKey()) || '[]') } catch { return [] }
}

function addUserCycleId(id) {
  const ids = getUserCycleIds()
  if (!ids.includes(id)) {
    ids.push(id)
    localStorage.setItem(getUserCycleKey(), JSON.stringify(ids))
  }
}

export const useMineralStore = defineStore('mineral', () => {
  const batches  = ref([])
  const vehicles = ref([])
  const alerts   = ref([])
  const errors   = ref([])
  const loading  = ref(false)
  const deposits = ref([
    { id: 'Zona A', name: 'Zona A', defaultDestination: 'Planta Principal' },
    { id: 'Zona B', name: 'Zona B', defaultDestination: 'Planta Principal' },
    { id: 'Zona C', name: 'Zona C', defaultDestination: 'Planta Principal' },
    { id: 'Zona D', name: 'Zona D', defaultDestination: 'Planta Principal' },
  ])

  const activeBatchCount = computed(() =>
    batches.value.filter(b => ['Cargando', 'En Tránsito'].includes(b.status)).length
  )
  const totalTonsToday = computed(() =>
    batches.value.reduce((sum, b) => sum + (b.initialWeight || 0), 0)
  )
  const alertCount = computed(() => alerts.value.length)

  async function fetchBatches() {
    loading.value = true
    try {
      const res = await mineralApi.getAllHaulingCycles()
      const all = MineralBatchAssembler.toEntitiesFromResponse(res)
      const userIds = getUserCycleIds()
      batches.value = userIds.length ? all.filter(b => userIds.includes(b.id)) : []
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  const VEHICLE_STATUS_MAP = {
    Available:     'Disponible',
    OnRoute:       'En Ruta',
    InMaintenance: 'Mantenimiento',
    Active:        'Disponible',
  }

  function mapVehicle(v) {
    return {
      id:         v.vehicleId,
      name:       v.vehicleId,
      plate:      v.vehicleId,
      operatorId: String(v.operatorId || ''),
      status:     VEHICLE_STATUS_MAP[v.status] || 'Disponible',
      type:       'Camión Minero',
      capacity:   50
    }
  }

  async function fetchSupporting() {
    const iamStore = useIamStore()
    const userId   = String(iamStore.currentUser?.userId || '')
    try {
      const vRes = await mineralApi.getAllVehicles()
      const all  = (vRes.data || []).map(mapVehicle)
      vehicles.value = userId ? all.filter(v => v.operatorId === userId) : []
    } catch {
      errors.value = ['fetchError']
    }
  }

  async function registerVehicle(vehicleId) {
    const iamStore   = useIamStore()
    const operatorId = String(iamStore.currentUser?.userId || '')
    errors.value = []
    try {
      const res = await mineralApi.registerVehicle(vehicleId, operatorId)
      vehicles.value.push(mapVehicle(res.data))
      return res.data
    } catch (e) {
      errors.value = [e?.response?.status === 409 ? 'vehicleExists' : 'registerVehicleError']
      return null
    }
  }

  // US13 – Start Hauling Cycle
  async function createBatch(vehicleId, loadingPoint) {
    errors.value = []
    loading.value = true
    try {
      const res = await mineralApi.startHaulingCycle(vehicleId, loadingPoint)
      const batch = MineralBatchAssembler.toEntityFromResource(res.data)
      addUserCycleId(batch.id)
      batches.value.unshift(batch)
      return batch
    } catch {
      errors.value = ['createError']
      return null
    } finally {
      loading.value = false
    }
  }

  // US14 – Load Material
  async function registerInitialWeight(cycleId, payloadTons) {
    errors.value = []
    try {
      if (!payloadTons || payloadTons <= 0) { errors.value = ['weightRequired']; return false }
      const res = await mineralApi.loadMaterial(cycleId, payloadTons)
      const idx = batches.value.findIndex(b => b.id === cycleId)
      if (idx !== -1) batches.value[idx] = MineralBatchAssembler.toEntityFromResource(res.data)
      return true
    } catch {
      errors.value = ['weightError']
      return false
    }
  }

  // Complete hauling cycle
  async function completeHaulingCycle(cycleId, dumpingPoint) {
    errors.value = []
    try {
      const res = await mineralApi.completeHaulingCycle(cycleId, dumpingPoint)
      const idx = batches.value.findIndex(b => b.id === cycleId)
      if (idx !== -1) batches.value[idx] = MineralBatchAssembler.toEntityFromResource(res.data)
      return true
    } catch {
      errors.value = ['completeError']
      return false
    }
  }

  return {
    batches, vehicles, deposits, alerts, errors, loading,
    activeBatchCount, totalTonsToday, alertCount,
    fetchBatches, fetchSupporting, registerVehicle, createBatch, registerInitialWeight, completeHaulingCycle
  }
})
