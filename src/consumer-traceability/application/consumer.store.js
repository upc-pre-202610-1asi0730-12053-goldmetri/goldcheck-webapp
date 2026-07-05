import { defineStore } from 'pinia'
import { ref } from 'vue'
import { consumerApi } from '../infrastructure/consumer-api.js'
import { useIamStore } from '../../iam/application/iam.store.js'

const STORAGE_KEY = (userId) => `gc_consumer_pieces_${userId}`

export const useConsumerStore = defineStore('consumer', () => {
  const pieces       = ref([])
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

  // US36 – stable per-device identifier for the anti-spam rate limit (survives sessions).
  function deviceId() {
    let id = localStorage.getItem('gc_device_id')
    if (!id) {
      id = (crypto?.randomUUID?.() || `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`)
      localStorage.setItem('gc_device_id', id)
    }
    return id
  }

  // US36 – report a suspicious QR. Returns { ok } or { ok:false, rateLimited } when the
  // backend blocks the 4th report within 5 minutes (HTTP 429).
  async function reportIrregularity(qrCode, reason) {
    errors.value = []
    loading.value = true
    try {
      await consumerApi.reportIrregularity(qrCode, deviceId(), reason, currentUserId())
      return { ok: true }
    } catch (e) {
      const status = e?.response?.status
      if (status === 429) { errors.value = ['rateLimited']; return { ok: false, rateLimited: true } }
      errors.value = ['reportError']
      return { ok: false, rateLimited: false }
    } finally {
      loading.value = false
    }
  }

  // US34/US35 – real traceability life sheet composed server-side from the other BCs.
  async function fetchTraceabilitySheet(qrCode) {
    try {
      const res = await consumerApi.getTraceabilitySheet(qrCode)
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
    pieces, errors, loading,
    fetchPieces, verifyPiece, linkPiece, fetchJourney, fetchTraceabilitySheet, reportIrregularity, getCertificate
  }
})
