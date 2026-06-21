import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { materialOperationsApi } from '../infrastructure/material-operations-api.js'
import { MaterialReceptionAssembler } from '../infrastructure/material-reception.assembler.js'
import { useIamStore } from '../../iam/application/iam.store.js'

function getUserCycleIds() {
  const iamStore = useIamStore()
  const userId   = iamStore.currentUser?.userId
  if (!userId) return []
  try { return JSON.parse(localStorage.getItem(`gc_cycles_${userId}`) || '[]') } catch { return [] }
}

export const useMaterialOperationsStore = defineStore('material-operations', () => {
  const receptions = ref([])
  const loading    = ref(false)
  const errors     = ref([])

  const pendingCount       = computed(() => receptions.value.filter(r => r.status === 'MaterialIdentified').length)
  const underInvestigation = computed(() => receptions.value.filter(r => r.status === 'MaterialClassified').length)
  const criticalBatches    = computed(() => receptions.value.filter(r =>
    r.initialWeight > 0 && r.receivedWeight > 0 &&
    parseFloat(((r.initialWeight - r.receivedWeight) / r.initialWeight * 100).toFixed(2)) > 5
  ))

  // Fetch only materials linked to the current user's hauling cycles
  async function fetchReceptions() {
    loading.value = true
    errors.value  = []
    try {
      const userCycleIds = getUserCycleIds()
      const res          = await materialOperationsApi.getAllMaterials()
      const all          = MaterialReceptionAssembler.toEntitiesFromResponse(res)
      receptions.value = userCycleIds.length
        ? all.filter(r => userCycleIds.includes(Number(r.batchId)) || userCycleIds.includes(String(r.batchId)))
        : []
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  // US16 – Identify mineral type → evento Mineral type identified
  async function identifyMineral(batchId, mineralType, payloadTons) {
    errors.value  = []
    loading.value = true
    try {
      const res    = await materialOperationsApi.identifyMineralType(batchId, mineralType, payloadTons)
      const entity = MaterialReceptionAssembler.toEntityFromResource(res.data)
      const idx    = receptions.value.findIndex(r => String(r.batchId) === String(batchId))
      if (idx !== -1) receptions.value[idx] = entity
      else receptions.value.unshift(entity)
      return true
    } catch (e) {
      errors.value = [e?.response?.status === 409 ? 'materialExists' : 'createError']
      return false
    } finally {
      loading.value = false
    }
  }

  // US16 – Classify material
  async function classifyMineral(batchId, mineralType) {
    errors.value = []
    try {
      const res = await materialOperationsApi.classifyMaterial(batchId, mineralType)
      const idx = receptions.value.findIndex(r => r.batchId === batchId)
      if (idx !== -1) receptions.value[idx] = MaterialReceptionAssembler.toEntityFromResource(res.data)
      return true
    } catch {
      errors.value = ['updateError']
      return false
    }
  }

  // US20 – Track material movement → evento Material movement tracked
  async function confirmArrival(batchId) {
    errors.value = []
    try {
      const res = await materialOperationsApi.trackMaterialMovement(batchId, 'Planta Principal')
      const idx = receptions.value.findIndex(r => r.batchId === batchId)
      if (idx !== -1) receptions.value[idx] = MaterialReceptionAssembler.toEntityFromResource(res.data)
      return true
    } catch {
      errors.value = ['updateError']
      return false
    }
  }

  // US21 – Download material → evento Material downloaded
  async function registerFinalWeight(batchId, finalWeight) {
    errors.value = []
    try {
      if (!finalWeight || finalWeight <= 0) { errors.value = ['weightRequired']; return false }
      const res = await materialOperationsApi.downloadMaterial(batchId, 'Planta Principal')
      const idx = receptions.value.findIndex(r => r.batchId === batchId)
      if (idx !== -1) receptions.value[idx] = MaterialReceptionAssembler.toEntityFromResource(res.data)
      return true
    } catch {
      errors.value = ['updateError']
      return false
    }
  }

  return {
    receptions, loading, errors,
    pendingCount, underInvestigation, criticalBatches,
    fetchReceptions, identifyMineral, classifyMineral, confirmArrival, registerFinalWeight
  }
})
