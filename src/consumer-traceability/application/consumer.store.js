import { defineStore } from 'pinia'
import { ref } from 'vue'
import { consumerApi } from '../infrastructure/consumer-api.js'
import { ConsumerPieceAssembler } from '../infrastructure/consumer-piece.assembler.js'

export const useConsumerStore = defineStore('consumer', () => {
  const pieces       = ref([])
  const certificates = ref([])
  const errors       = ref([])
  const loading      = ref(false)

  async function fetchPieces() {
    loading.value = true
    try {
      pieces.value = []
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
      const res    = await consumerApi.getProductByQR(qrCode)
      if (!res.data) return null
      const piece = ConsumerPieceAssembler.toEntityFromResource(res.data)
      return { ...piece, traceabilityCode: qrCode, verified: true }
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
      const qrCode = data.traceabilityCode || `QR-${data.sku || Date.now()}`
      const res    = await consumerApi.scanProductQR(data.sku || null, qrCode)
      const piece  = ConsumerPieceAssembler.toEntityFromResource(res.data)
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
      const res = await consumerApi.getTraceabilityJourney(qrCode)
      return res.data || null
    } catch {
      return null
    }
  }

  async function lookupInventoryItem(traceabilityCode) {
    try {
      const qrCode = traceabilityCode.startsWith('QR-') ? traceabilityCode : `QR-${traceabilityCode}`
      const res    = await consumerApi.getProductByQR(qrCode)
      return res.data || null
    } catch {
      return null
    }
  }

  async function downloadCertificate(certificateId, consumerId) {
    errors.value = []
    try {
      const res = await consumerApi.downloadCertificate(certificateId, consumerId)
      return res.data || null
    } catch {
      errors.value = ['downloadError']
      return null
    }
  }

  async function getCertificate(certificateId) {
    try {
      const res = await consumerApi.getCertificateById(certificateId)
      return res.data || null
    } catch {
      return null
    }
  }

  return {
    pieces, certificates, errors, loading,
    fetchPieces, fetchCertificates, verifyPiece, linkPiece,
    fetchBatch, lookupInventoryItem, downloadCertificate, getCertificate
  }
})
