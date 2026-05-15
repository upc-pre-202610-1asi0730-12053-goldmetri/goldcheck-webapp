import { defineStore } from 'pinia'
import { ref } from 'vue'
import { consumerApi } from '../infrastructure/consumer-api.js'

export const useConsumerStore = defineStore('consumer', () => {
  const pieces       = ref([])
  const certificates = ref([])
  const errors       = ref([])
  const loading      = ref(false)

  async function fetchPieces(ownerId) {
    loading.value = true
    try {
      const params = ownerId ? { ownerId } : {}
      const res = await consumerApi.getPieces(params)
      if (res.status !== 200) { console.error(`${res.status}, ${res.statusText}`); return }
      pieces.value = res.data
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function fetchCertificates() {
    try {
      const res = await consumerApi.getCertificates()
      if (res.status !== 200) { console.error(`${res.status}, ${res.statusText}`); return }
      const allCerts = res.data || []
      const certIds = pieces.value.map(p => p.certificationId).filter(Boolean)
      certificates.value = allCerts.filter(c => certIds.includes(c.id))
    } catch {
      errors.value = ['certFetchError']
    }
  }

  // US – Verify piece by traceability code
  async function verifyPiece(code) {
    loading.value = true
    errors.value = []
    try {
      const res = await consumerApi.getPieces({ traceabilityCode: code })
      const found = (res.data || []).find(p => p.traceabilityCode === code)
      if (!found) {
        // try searching by sku derived from QR code (QR-GJ-XXXXX -> GJ-XXXXX)
        const sku = code.startsWith('QR-') ? code.slice(3) : code
        const jRes = await consumerApi.getJewelryItem(sku)
        const jewel = (jRes.data || [])[0]
        return jewel ? { ...jewel, traceabilityCode: code, verified: true } : null
      }
      // enrich consumerPiece with batchRef from the corresponding jewelryItem
      const sku   = found.sku || (code.startsWith('QR-') ? code.slice(3) : code)
      const jRes  = await consumerApi.getJewelryItem(sku)
      const jewel = (jRes.data || [])[0]
      return { ...found, batchRef: jewel?.batchRef || jewel?.materialOrigin || null, verified: true }
    } catch {
      errors.value = ['verifyError']
      return null
    } finally {
      loading.value = false
    }
  }

  async function linkPiece(data) {
    errors.value = []
    loading.value = true
    try {
      const payload = { ...data, status: 'Activo', purchaseDate: new Date().toISOString() }
      const res = await consumerApi.linkPiece(payload)
      pieces.value.unshift(res.data)
      return res.data
    } catch {
      errors.value = ['linkError']
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchBatch(batchCode) {
    try {
      const res  = await consumerApi.getBatchByCode(batchCode)
      const list = res.data || []
      return list[0] || null
    } catch {
      return null
    }
  }

  return { pieces, certificates, errors, loading, fetchPieces, fetchCertificates, verifyPiece, linkPiece, fetchBatch }
})
