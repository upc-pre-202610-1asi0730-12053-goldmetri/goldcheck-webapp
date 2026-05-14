import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jewelryApi } from '../infrastructure/jewelry-api.js'
import { JewelryItemAssembler } from '../infrastructure/jewelry-item.assembler.js'

export const useJewelryStore = defineStore('jewelry', () => {
  const items        = ref([])
  const certificates = ref([])
  const errors       = ref([])
  const loading      = ref(false)

  const pendingCount    = computed(() => items.value.filter(i => i.status === 'Pendiente').length)
  const validatedCount  = computed(() => items.value.filter(i => i.status === 'Validado').length)
  const certifiedCount  = computed(() => items.value.filter(i => i.status === 'Certificado').length)
  const totalValue      = computed(() => items.value.reduce((s, i) => s + (i.price || 0), 0))

  async function fetchItems() {
    loading.value = true
    try {
      const res = await jewelryApi.getItems()
      items.value = JewelryItemAssembler.toEntities(res)
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function fetchCertificates() {
    try {
      const res = await jewelryApi.getCertificates()
      certificates.value = JewelryItemAssembler.toCertificates(res)
    } catch {
      errors.value = ['certFetchError']
    }
  }

  async function registerItem(data) {
    errors.value = []
    loading.value = true
    try {
      const sku = `GJ-${String(Date.now()).slice(-5)}`
      const payload = { ...data, sku, status: 'Pendiente', createdAt: new Date().toISOString() }
      const res = await jewelryApi.createItem(payload)
      const newItem = JewelryItemAssembler.toEntity(res.data)
      items.value.unshift(newItem)
      return newItem
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
      await jewelryApi.validateItem(itemId)
      const idx = items.value.findIndex(i => i.id === itemId)
      if (idx !== -1) items.value[idx].status = 'Validado'
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
      const certData = {
        itemId, itemSku: item.sku, issuerName: 'GoldMetrics Cert Authority',
        purity: item.purity, weight: item.weight,
        qrCode: `QR-${item.sku}`, status: 'Activo',
        issueDate: new Date().toISOString()
      }
      const res = await jewelryApi.createCertificate(certData)
      const cert = JewelryItemAssembler.toCertificate(res.data)
      certificates.value.unshift(cert)
      await jewelryApi.updateItemStatus(itemId, 'Certificado')
      const idx = items.value.findIndex(i => i.id === itemId)
      if (idx !== -1) {
        items.value[idx].status = 'Certificado'
        items.value[idx].certificationId = cert.id
      }
      return cert
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
