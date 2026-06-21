import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mineralApi } from '../infrastructure/mineral-api.js'
import { MineralBatchAssembler } from '../infrastructure/mineral-batch.assembler.js'

export const useMineralStore = defineStore('mineral', () => {
  const batches  = ref([])
  const vehicles = ref([])
  const alerts   = ref([])
  const errors   = ref([])
  const loading  = ref(false)

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
      batches.value = MineralBatchAssembler.toEntitiesFromResponse(res)
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function fetchSupporting() {
    try {
      const vRes = await mineralApi.getAllVehicles()
      vehicles.value = vRes.data || []
    } catch {
      errors.value = ['fetchError']
    }
  }

  // US13 – Start Hauling Cycle
  async function createBatch(vehicleId, loadingPoint) {
    errors.value = []
    loading.value = true
    try {
      const res = await mineralApi.startHaulingCycle(vehicleId, loadingPoint)
      const batch = MineralBatchAssembler.toEntityFromResource(res.data)
      batches.value.unshift(batch)
      return res.data
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
    batches, vehicles, alerts, errors, loading,
    activeBatchCount, totalTonsToday, alertCount,
    fetchBatches, fetchSupporting, createBatch, registerInitialWeight, completeHaulingCycle
  }
})
