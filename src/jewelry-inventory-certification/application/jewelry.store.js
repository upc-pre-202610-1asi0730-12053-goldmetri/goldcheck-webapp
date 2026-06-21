import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jewelryApi } from '../infrastructure/jewelry-api.js'

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

  async function fetchItems() {
    loading.value = true
    errors.value  = []
    try {
      const res      = await jewelryApi.getAllMaterials()
      materials.value = Array.isArray(res.data) ? res.data : []
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function registerItem(materialId, jewelerId) {
    errors.value  = []
    loading.value = true
    try {
      const res = await jewelryApi.registerMaterial(materialId, jewelerId)
      materials.value.unshift(res.data)
      return res.data
    } catch {
      errors.value = ['createError']
      return null
    } finally {
      loading.value = false
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
    fetchItems, registerItem, scanQR, generateCertificate, signCertificate, fetchCertificates
  }
})
