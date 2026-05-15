import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mineralApi } from '../infrastructure/mineral-api.js'

export const useMineralStore = defineStore('mineral', () => {
  const batches  = ref([])
  const deposits = ref([])
  const vehicles = ref([])
  const alerts   = ref([])
  const errors   = ref([])
  const loading  = ref(false)

  const activeBatchCount = computed(() =>
    batches.value.filter(b => ['Cargando', 'En Tránsito', 'En Balanza'].includes(b.status)).length
  )
  const totalTonsToday = computed(() =>
    batches.value.reduce((sum, b) => sum + (b.initialWeight || 0), 0)
  )
  const alertCount = computed(() => alerts.value.length)

  async function fetchBatches() {
    loading.value = true
    try {
      const res = await mineralApi.getBatches()
      if (res.status !== 200) { console.error(`${res.status}, ${res.statusText}`); return }
      batches.value = res.data
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function fetchSupporting() {
    const [dRes, vRes, aRes] = await Promise.all([
      mineralApi.getDeposits(),
      mineralApi.getVehicles(),
      mineralApi.getAlerts()
    ])
    deposits.value = dRes.data || []
    vehicles.value = vRes.data || []
    alerts.value   = aRes.data || []
  }

  // US13 – Creación de Lote (Batch) — Paso 1
  async function createBatch(depositId, vehicleId) {
    errors.value = []
    loading.value = true
    try {
      const deposit   = deposits.value.find(d => d.id === depositId)
      const vehicle   = vehicles.value.find(v => v.id === vehicleId)
      const batchCode = `GM-${String(Date.now()).slice(-4)}`
      const payload   = {
        batchCode, depositId, depositName: deposit?.name || '',
        vehicleId, vehicleName: vehicle?.name || '',
        status: 'Cargando', destination: deposit?.defaultDestination || 'Planta Principal',
        initialWeight: 0, mineralType: 'Oro', createdAt: new Date().toISOString()
      }
      const res = await mineralApi.createBatch(payload)
      batches.value.unshift(res.data)
      return res.data
    } catch {
      errors.value = ['createError']
      return null
    } finally {
      loading.value = false
    }
  }

  // US14 – Registro de Pesaje Inicial — Paso 2
  async function registerInitialWeight(batchId, weight) {
    errors.value = []
    try {
      if (!weight || weight <= 0) { errors.value = ['weightRequired']; return false }
      await mineralApi.registerInitialWeight(batchId, weight)
      const idx = batches.value.findIndex(b => b.id === batchId)
      if (idx !== -1) {
        batches.value[idx] = { ...batches.value[idx], initialWeight: weight, status: 'En Tránsito' }
      }
      return true
    } catch {
      errors.value = ['weightError']
      return false
    }
  }

  return {
    batches, deposits, vehicles, alerts, errors, loading,
    activeBatchCount, totalTonsToday, alertCount,
    fetchBatches, fetchSupporting, createBatch, registerInitialWeight
  }
})
