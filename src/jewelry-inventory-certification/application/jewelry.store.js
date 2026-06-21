import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jewelryApi } from '../infrastructure/jewelry-api.js'
import { JewelryItemAssembler } from '../infrastructure/jewelry-item.assembler.js'

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
    errors.value  = []
    try {
      const res   = await jewelryApi.getAllItems()
      items.value = JewelryItemAssembler.toEntitiesFromResponse(res)
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function fetchCertificates() {
    try {
      const res          = await jewelryApi.getAllCertificates()
      certificates.value = Array.isArray(res.data) ? res.data : []
    } catch {
      certificates.value = []
    }
  }

  async function registerItem(data) {
    errors.value  = []
    loading.value = true
    try {
      const res = await jewelryApi.registerItem(data)
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
      const res = await jewelryApi.updateItemStatus(itemId, 'Validado')
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
      const qrCode = `QR-${item.sku}`
      const certRes = await jewelryApi.createCertificate({
        itemId:    itemId,
        itemSku:   item.sku,
        purity:    item.purity,
        weight:    item.weight,
        qrCode,
        expiryDate: new Date(Date.now() + 5 * 365 * 24 * 3600 * 1000).toISOString()
      })
      await jewelryApi.updateItemStatus(itemId, 'Certificado')
      const idx = items.value.findIndex(i => i.id === itemId)
      if (idx !== -1) items.value[idx] = { ...items.value[idx], status: 'Certificado', certificationId: certRes.data.id }
      certificates.value.push(certRes.data)
      return certRes.data
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
