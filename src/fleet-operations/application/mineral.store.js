import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mineralApi } from '../infrastructure/mineral-api.js'
import { MineralBatchAssembler } from '../infrastructure/mineral-batch.assembler.js'
import { useIamStore } from '../../iam/application/iam.store.js'

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
      const iamStore = useIamStore()
      const userId = iamStore.currentUser?.id
      const res = await mineralApi.getBatches(userId ? { userId } : {})
      batches.value = MineralBatchAssembler.toEntitiesFromResponse(res)
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

  // US13 – Batch Creation — Step 1
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
      batches.value.unshift(MineralBatchAssembler.toEntityFromResource(res.data))
      return res.data
    } catch {
      errors.value = ['createError']
      return null
    } finally {
      loading.value = false
    }
  }

  // US14 – Initial Weighing Registration — Step 2
  async function registerInitialWeight(batchId, weight) {
    errors.value = []
    try {
      if (!weight || weight <= 0) { errors.value = ['weightRequired']; return false }
      await mineralApi.registerInitialWeight(batchId, weight)
      const idx = batches.value.findIndex(b => b.id === batchId)
      if (idx !== -1) {
        batches.value[idx] = batches.value[idx].clone({ initialWeight: weight, status: 'En Tránsito' })
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
