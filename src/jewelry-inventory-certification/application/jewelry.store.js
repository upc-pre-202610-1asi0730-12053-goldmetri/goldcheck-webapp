import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jewelryApi } from '../infrastructure/jewelry-api.js'
import { useIamStore } from '../../iam/application/iam.store.js'

function currentJewelerId() {
  const iamStore = useIamStore()
  return String(iamStore.currentUser?.userId || '')
}

export const useJewelryStore = defineStore('jewelry', () => {
  const materials    = ref([])
  const certificates = ref([])
  const errors       = ref([])
  const loading      = ref(false)

  // Keep 'items' as alias so existing dashboard template doesn't break
  const items = materials

  const pendingCount   = computed(() => materials.value.filter(m => m.status === 'Pending').length)
  const validatedCount = computed(() => materials.value.filter(m => m.status === 'Pending').length)
  const certifiedCount = computed(() => materials.value.filter(m => m.certificateId).length)
  const totalValue     = computed(() => 0)

  // Materials are scoped to the current jeweler server-side.
  async function fetchItems() {
    loading.value = true
    errors.value  = []
    try {
      const jewelerId = currentJewelerId()
      if (!jewelerId) { materials.value = []; return }
      const res      = await jewelryApi.getAllMaterials(jewelerId)
      materials.value = Array.isArray(res.data) ? res.data : []
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function registerItem(materialId, jewelerId, declaredKarats = null, massGrams = null) {
    errors.value  = []
    loading.value = true
    try {
      const res = await jewelryApi.registerMaterial(materialId, jewelerId, declaredKarats, massGrams)
      materials.value.unshift(res.data)
      return res.data
    } catch {
      errors.value = ['createError']
      return null
    } finally {
      loading.value = false
    }
  }

  // US24 – Registro de Prueba de Pureza
  async function registerPurityTest(materialId, verifiedKarats) {
    errors.value = []
    if (!verifiedKarats || verifiedKarats < 1 || verifiedKarats > 24) { errors.value = ['invalidPurity']; return { ok: false } }
    try {
      const res = await jewelryApi.registerPurityTest(materialId, verifiedKarats)
      const idx = materials.value.findIndex(m => m.materialId === materialId)
      if (idx !== -1) materials.value[idx] = res.data
      return {
        ok: true,
        verifiedKarats: res.data?.verifiedKarats,
        declaredKarats: res.data?.declaredKarats,
        hasDiscrepancy: res.data?.hasCommercialDiscrepancy ?? false,
      }
    } catch (e) {
      errors.value = [e?.response?.status === 400 ? 'invalidPurity' : 'purityError']
      return { ok: false }
    }
  }

  // US29 – ingreso de oro de cliente
  async function registerClientGold(massGrams, declaredKarats = null) {
    errors.value = []
    loading.value = true
    if (!massGrams || massGrams <= 0) { errors.value = ['massRequired']; loading.value = false; return { ok: false } }
    try {
      const res = await jewelryApi.registerClientGold(currentJewelerId(), massGrams, declaredKarats)
      materials.value.unshift(res.data)
      return { ok: true, material: res.data }
    } catch (e) {
      errors.value = [e?.response?.status === 400 ? 'massRequired' : 'clientGoldError']
      return { ok: false }
    } finally {
      loading.value = false
    }
  }

  // US30 – registro de merma por refinamiento
  async function registerRefinement(materialId, refinedWeightGrams) {
    errors.value = []
    if (!refinedWeightGrams || refinedWeightGrams <= 0) { errors.value = ['refinedRequired']; return { ok: false } }
    try {
      const res = await jewelryApi.registerRefinement(materialId, refinedWeightGrams)
      const idx = materials.value.findIndex(m => m.materialId === materialId)
      if (idx !== -1) materials.value[idx] = res.data
      return {
        ok: true,
        shrinkagePercent: res.data?.refinementShrinkagePercent,
        refinedWeightGrams: res.data?.refinedWeightGrams,
      }
    } catch (e) {
      const s = e?.response?.status
      errors.value = [s === 409 ? 'refinedExceeds' : 'refineError']
      return { ok: false }
    }
  }

  // US27 – asignar detalles (foto, descripción)
  async function assignDetails(materialId, photo, description) {
    errors.value = []
    try {
      const res = await jewelryApi.assignDetails(materialId, photo, description)
      const idx = materials.value.findIndex(m => m.materialId === materialId)
      if (idx !== -1) materials.value[idx] = res.data
      return { ok: true, material: res.data }
    } catch {
      errors.value = ['detailsError']
      return { ok: false }
    }
  }

  // US28 – marcar como vendida
  async function markAsSold(materialId) {
    errors.value = []
    try {
      const res = await jewelryApi.markAsSold(materialId)
      const idx = materials.value.findIndex(m => m.materialId === materialId)
      if (idx !== -1) materials.value[idx] = res.data
      return { ok: true }
    } catch (e) {
      errors.value = [e?.response?.status === 409 ? 'alreadySold' : 'soldError']
      return { ok: false }
    }
  }

  // US26 – Generación de Código QR
  async function generateQR(materialId) {
    errors.value = []
    try {
      const res = await jewelryApi.generateQR(materialId)
      const idx = materials.value.findIndex(m => m.materialId === materialId)
      if (idx !== -1) materials.value[idx] = res.data
      return { ok: true, qrCode: res.data?.qrCode }
    } catch (e) {
      errors.value = [e?.response?.status === 409 ? 'qrRequiresPurity' : 'qrError']
      return { ok: false }
    }
  }

  // US25 – Subdivisión de Lote
  async function splitBatch(materialId, childMasses) {
    errors.value = []
    try {
      const res = await jewelryApi.splitBatch(materialId, childMasses)
      const children = Array.isArray(res.data) ? res.data : []
      children.forEach(c => materials.value.unshift(c))
      return { ok: true, children }
    } catch (e) {
      const s = e?.response?.status
      errors.value = [s === 409 ? 'splitExceedsMass' : s === 400 ? 'invalidMass' : 'splitError']
      return { ok: false }
    }
  }

  async function scanQR(materialId, qrCode) {
    errors.value = []
    try {
      const res = await jewelryApi.scanQR(materialId, qrCode)
      const idx = materials.value.findIndex(m => m.materialId === materialId)
      if (idx !== -1) materials.value[idx] = res.data
      return true
    } catch {
      errors.value = ['scanError']
      return false
    }
  }

  async function generateCertificate(materialId) {
    errors.value = []
    try {
      const res = await jewelryApi.generateCertificate(materialId)
      const idx = materials.value.findIndex(m => m.materialId === materialId)
      if (idx !== -1) materials.value[idx] = { ...materials.value[idx], certificateId: res.data.certificateId }
      return res.data
    } catch {
      errors.value = ['certError']
      return null
    }
  }

  async function signCertificate(certificateId, jewelerId) {
    errors.value = []
    try {
      const res = await jewelryApi.signCertificate(certificateId, jewelerId)
      certificates.value.push(res.data)
      return res.data
    } catch {
      errors.value = ['signError']
      return null
    }
  }

  async function fetchCertificates() {
    // no-op: certificates are fetched individually by ID
  }

  return {
    items, materials, certificates, errors, loading,
    pendingCount, validatedCount, certifiedCount, totalValue,
    fetchItems, registerItem, scanQR, generateCertificate, signCertificate, fetchCertificates,
    registerPurityTest, splitBatch, generateQR, assignDetails, markAsSold,
    registerClientGold, registerRefinement
  }
})
