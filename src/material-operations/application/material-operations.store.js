import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { materialOperationsApi } from '../infrastructure/material-operations-api.js'
import { MaterialReceptionAssembler } from '../infrastructure/material-reception.assembler.js'
import { useIamStore } from '../../iam/application/iam.store.js'

function currentReporterId() {
  const iamStore = useIamStore()
  return String(iamStore.currentUser?.userId || '')
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

  // Materials are scoped to the current user server-side via reporterId.
  async function fetchReceptions() {
    loading.value = true
    errors.value  = []
    try {
      const reporterId = currentReporterId()
      if (!reporterId) { receptions.value = []; return }
      const res = await materialOperationsApi.getAllMaterials(reporterId)
      receptions.value = MaterialReceptionAssembler.toEntitiesFromResponse(res)
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  // US16 – Identify mineral type → evento Mineral type identified. Tagged with reporterId.
  async function identifyMineral(batchId, mineralType, payloadTons) {
    errors.value  = []
    loading.value = true
    try {
      const res    = await materialOperationsApi.identifyMineralType(batchId, mineralType, payloadTons, currentReporterId())
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

  // US16 – Tipificación de Mineral (cambiar el tipo de mineral del lote)
  async function changeMineralType(batchId, mineralType) {
    errors.value = []
    if (!mineralType) { errors.value = ['mineralTypeRequired']; return { ok: false } }
    try {
      const res = await materialOperationsApi.changeMineralType(batchId, mineralType)
      const idx = receptions.value.findIndex(r => String(r.batchId) === String(batchId))
      if (idx !== -1) receptions.value[idx] = MaterialReceptionAssembler.toEntityFromResource(res.data)
      return { ok: true }
    } catch (e) {
      const s = e?.response?.status
      errors.value = [s === 409 ? 'mineralTypeBlocked' : s === 400 ? 'mineralTypeInvalid' : 'updateError']
      return { ok: false }
    }
  }

  // US22 – Cálculo Automático de Merma
  async function calculateShrinkage(batchId, finalWeightTons) {
    errors.value = []
    if (!finalWeightTons || finalWeightTons <= 0) { errors.value = ['finalWeightRequired']; return { ok: false } }
    try {
      const res = await materialOperationsApi.calculateShrinkage(batchId, finalWeightTons)
      const entity = MaterialReceptionAssembler.toEntityFromResource(res.data)
      const idx = receptions.value.findIndex(r => String(r.batchId) === String(batchId))
      if (idx !== -1) receptions.value[idx] = entity
      return {
        ok: true,
        shrinkagePercent: res.data?.shrinkagePercent ?? res.data?.ShrinkagePercent ?? 0,
        underInvestigation: (res.data?.status ?? res.data?.Status) === 'UnderInvestigation',
      }
    } catch (e) {
      errors.value = [e?.response?.status === 400 ? 'finalWeightInvalid' : 'updateError']
      return { ok: false }
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
    fetchReceptions, identifyMineral, classifyMineral, changeMineralType, calculateShrinkage, confirmArrival, registerFinalWeight
  }
})
