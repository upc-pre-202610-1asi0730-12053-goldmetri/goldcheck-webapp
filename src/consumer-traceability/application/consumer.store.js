import { defineStore } from 'pinia'
import { ref } from 'vue'
import { consumerApi } from '../infrastructure/consumer-api.js'
import { ConsumerPieceAssembler } from '../infrastructure/consumer-piece.assembler.js'
import { useIamStore } from '../../iam/application/iam.store.js'

export const useConsumerStore = defineStore('consumer', () => {
  const pieces       = ref([])
  const certificates = ref([])
  const errors       = ref([])
  const loading      = ref(false)

  async function fetchPieces() {
    loading.value = true
    errors.value  = []
    try {
      const iamStore = useIamStore()
      const userId   = iamStore.currentUser?.userId || iamStore.currentUser?.id
      if (!userId) { pieces.value = []; return }
      const res    = await consumerApi.getPiecesByOwner(userId)
      pieces.value = ConsumerPieceAssembler.toEntitiesFromResponse(res)
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function fetchCertificates() {
    certificates.value = []
  }

  async function verifyPiece(code) {
    loading.value = true
    errors.value  = []
    try {
      const qrCode = code.startsWith('QR-') ? code : `QR-${code}`
      const res    = await consumerApi.findByTraceabilityCode(qrCode)
      const list   = Array.isArray(res.data) ? res.data : []
      if (!list.length) {
        const resItem = await consumerApi.getJewelryItemBySku(code)
        const items   = Array.isArray(resItem.data) ? resItem.data : []
        if (!items.length) return null
        const item = items[0]
        return { ...ConsumerPieceAssembler.toEntityFromResource({ ...item, traceabilityCode: qrCode }), verified: true }
      }
      return { ...ConsumerPieceAssembler.toEntityFromResource(list[0]), verified: true }
    } catch {
      errors.value = ['verifyError']
      return null
    } finally {
      loading.value = false
    }
  }

  async function linkPiece(data) {
    errors.value  = []
    loading.value = true
    try {
      const iamStore = useIamStore()
      const userId   = iamStore.currentUser?.userId || iamStore.currentUser?.id
      const qrCode   = data.traceabilityCode || `QR-${data.sku || Date.now()}`
      const payload  = {
        ownerId:          userId,
        sku:              data.sku || '',
        name:             data.name || data.sku || 'Joya',
        type:             data.type || 'Anillo',
        purity:           data.purity || '18K',
        traceabilityCode: qrCode,
        status:           'Activo',
        purchaseDate:     new Date().toISOString()
      }
      const res   = await consumerApi.addPiece(payload)
      const piece = ConsumerPieceAssembler.toEntityFromResource(res.data)
      pieces.value.unshift(piece)
      return res.data
    } catch {
      errors.value = ['linkError']
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchBatch(qrCode) {
    try {
      const res  = await consumerApi.findByTraceabilityCode(qrCode)
      const list = Array.isArray(res.data) ? res.data : []
      return list.length ? list[0] : null
    } catch {
      return null
    }
  }

  async function lookupInventoryItem(traceabilityCode) {
    try {
      const qrCode = traceabilityCode.startsWith('QR-') ? traceabilityCode : `QR-${traceabilityCode}`
      const res    = await consumerApi.findByTraceabilityCode(qrCode)
      const list   = Array.isArray(res.data) ? res.data : []
      return list.length ? list[0] : null
    } catch {
      return null
    }
  }

  async function getCertificate(certId) {
    try {
      const res = await consumerApi.getCertificateById(certId)
      return res.data || null
    } catch {
      return null
    }
  }

  async function downloadCertificate(certId) {
    errors.value = []
    try {
      const res = await consumerApi.getCertificateById(certId)
      return res.data || null
    } catch {
      errors.value = ['downloadError']
      return null
    }
  }

  return {
    pieces, certificates, errors, loading,
    fetchPieces, fetchCertificates, verifyPiece, linkPiece,
    fetchBatch, lookupInventoryItem, getCertificate, downloadCertificate
  }
})
