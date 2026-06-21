import { defineStore } from 'pinia'
import { ref } from 'vue'
import { consumerApi } from '../infrastructure/consumer-api.js'
import { useIamStore } from '../../iam/application/iam.store.js'

const STORAGE_KEY = (userId) => `gc_consumer_pieces_${userId}`

export const useConsumerStore = defineStore('consumer', () => {
  const pieces       = ref([])
  const certificates = ref([])
  const errors       = ref([])
  const loading      = ref(false)

  function currentUserId() {
    const iamStore = useIamStore()
    return String(iamStore.currentUser?.userId || iamStore.currentUser?.id || '')
  }

  function loadFromStorage() {
    const userId = currentUserId()
    if (!userId) return []
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY(userId)) || '[]') } catch { return [] }
  }

  function saveToStorage(list) {
    const userId = currentUserId()
    if (!userId) return
    localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(list))
  }

  function fetchPieces() {
    pieces.value = loadFromStorage()
  }

  async function fetchCertificates() {
    certificates.value = []
  }

  // Verify a piece by QR code — does NOT save it, just looks it up
  async function verifyPiece(qrCode) {
    loading.value = true
    errors.value  = []
    try {
      const res     = await consumerApi.getProductByQR(qrCode)
      return res.data || null
    } catch {
      errors.value = ['verifyError']
      return null
    } finally {
      loading.value = false
    }
  }

  // Link a piece: POST /consumer/scan + save to localStorage
  async function linkPiece(qrCode) {
    errors.value  = []
    loading.value = true
    try {
      const userId = currentUserId()
      const res    = await consumerApi.scanProductQR(qrCode, userId)
      const product = res.data
      const existing = loadFromStorage()
      if (!existing.find(p => p.qrCode === product.qrCode)) {
        const updated = [product, ...existing]
        saveToStorage(updated)
        pieces.value = updated
      }
      return product
    } catch {
      errors.value = ['linkError']
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchJourney(qrCode) {
    try {
      const res = await consumerApi.getJourney(qrCode)
      return res.data || null
    } catch {
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
    fetchPieces, fetchCertificates, verifyPiece, linkPiece, fetchJourney, getCertificate
  }
})
