import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { materialOperationsApi } from '../infrastructure/material-operations-api.js'
import { MaterialReceptionAssembler } from '../infrastructure/material-reception.assembler.js'

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

  async function fetchReceptions() {
    loading.value = true
    errors.value  = []
    try {
      const res = await materialOperationsApi.getAllMaterials()
      receptions.value = MaterialReceptionAssembler.toEntitiesFromResponse(res)
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  // US21 – Final weighing: download to dumping point
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

  // US16 – Mineral Classification
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

  // US20 – Arrival Confirmation: track at plant
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

  return {
    receptions, loading, errors,
    pendingCount, underInvestigation, criticalBatches,
    fetchReceptions, registerFinalWeight, classifyMineral, confirmArrival
  }
})
