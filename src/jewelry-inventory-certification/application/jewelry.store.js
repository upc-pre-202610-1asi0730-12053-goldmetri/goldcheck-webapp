import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jewelryApi } from '../infrastructure/jewelry-api.js'
import { JewelryItemAssembler } from '../infrastructure/jewelry-item.assembler.js'
import { useIamStore } from '../../iam/application/iam.store.js'

export const useJewelryStore = defineStore('jewelry', () => {
  const items        = ref([])
  const certificates = ref([])
  const errors       = ref([])
  const loading      = ref(false)

  const pendingCount   = computed(() => items.value.filter(i => i.status === 'Pendiente').length)
  const validatedCount = computed(() => items.value.filter(i => i.status === 'Validado').length)
  const certifiedCount = computed(() => items.value.filter(i => i.status === 'Certificado').length)
  const totalValue     = computed(() => items.value.reduce((s, i) => s + (i.price || 0), 0))

  async function fetchItems() {
    loading.value = true
    try {
      const res = await jewelryApi.getAllMaterials()
      items.value = JewelryItemAssembler.toEntitiesFromResponse(res)
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function fetchCertificates() {
    // Certificates are retrieved per-item when needed
    certificates.value = []
  }

  async function registerItem(data) {
    errors.value = []
    loading.value = true
    try {
      const iamStore  = useIamStore()
      const jewelerId = iamStore.currentUser?.userId || iamStore.currentUser?.id || 'unknown'
      const materialId = data.materialId || data.batchRef || `GM-${String(Date.now()).slice(-5)}`
      const res = await jewelryApi.registerMaterial(materialId, jewelerId)
      items.value.unshift(JewelryItemAssembler.toEntityFromResource(res.data))
      return res.data
    } catch {
      errors.value = ['createError']
      return null
    } finally {
      loading.value = false
    }
  }

  async function validateItem(itemId) {
    errors.value = []
    try {
      const item = items.value.find(i => i.id === itemId)
      const materialId = item?.sku || String(itemId)
      const qrCode = `QR-${materialId}`
      const res = await jewelryApi.scanQR(materialId, qrCode)
      const idx = items.value.findIndex(i => i.id === itemId)
      if (idx !== -1) items.value[idx] = JewelryItemAssembler.toEntityFromResource(res.data)
      return true
    } catch {
      errors.value = ['validateError']
      return false
    }
  }

  async function issueCertificate(itemId) {
    errors.value = []
    try {
      const item = items.value.find(i => i.id === itemId)
      if (!item) return null
      const res = await jewelryApi.generateCertificate(item.sku)
      const updatedItem = JewelryItemAssembler.toEntityFromResource(res.data)
      const idx = items.value.findIndex(i => i.id === itemId)
      if (idx !== -1) items.value[idx] = updatedItem
      return res.data
    } catch {
      errors.value = ['certError']
      return null
    }
  }

  return {
    items, certificates, errors, loading,
    pendingCount, validatedCount, certifiedCount, totalValue,
    fetchItems, fetchCertificates, registerItem, validateItem, issueCertificate
  }
})
