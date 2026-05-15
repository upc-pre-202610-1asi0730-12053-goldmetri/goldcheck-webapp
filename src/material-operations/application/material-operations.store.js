import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { materialOperationsApi } from '../infrastructure/material-operations-api.js'

export const useMaterialOperationsStore = defineStore('material-operations', () => {
  const receptions = ref([])
  const loading    = ref(false)
  const errors     = ref([])

  const pendingCount        = computed(() => receptions.value.filter(r => r.status === 'En Planta').length)
  const underInvestigation  = computed(() => receptions.value.filter(r => r.status === 'Bajo Investigación').length)
  const criticalBatches     = computed(() => receptions.value.filter(r =>
    r.initialWeight > 0 && parseFloat(((r.initialWeight - r.receivedWeight) / r.initialWeight * 100).toFixed(2)) > 5
  ))

  async function fetchReceptions() {
    loading.value = true
    errors.value  = []
    try {
      const res = await materialOperationsApi.getBatches()
      if (res.status !== 200) { console.error(`${res.status}, ${res.statusText}`); return }
      receptions.value = res.data
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  // US21 – Pesaje Final (Recepción)
  async function registerFinalWeight(batchId, finalWeight, initialWeight) {
    errors.value = []
    try {
      if (!finalWeight || finalWeight <= 0) {
        errors.value = ['weightRequired']
        return false
      }
      if (finalWeight > initialWeight) {
        errors.value = ['weightExceedsInitial']
        return false
      }
      await materialOperationsApi.registerFinalWeight(batchId, finalWeight)
      const shrinkage = ((initialWeight - finalWeight) / initialWeight) * 100
      if (shrinkage > 5) {
        await materialOperationsApi.markUnderInvestigation(batchId)
      }
      await fetchReceptions()
      return true
    } catch {
      errors.value = ['updateError']
      return false
    }
  }

  // US16 – Tipificación de Mineral
  async function classifyMineral(batchId, mineralType) {
    errors.value = []
    try {
      await materialOperationsApi.classifyMineral(batchId, mineralType)
      const idx = receptions.value.findIndex(r => r.id === batchId)
      if (idx !== -1) {
        receptions.value[idx] = { ...receptions.value[idx], mineralType }
      }
      return true
    } catch {
      errors.value = ['updateError']
      return false
    }
  }

  // US20 – Confirmación de Llegada
  async function confirmArrival(batchId) {
    errors.value = []
    try {
      await materialOperationsApi.confirmArrival(batchId)
      await fetchReceptions()
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
