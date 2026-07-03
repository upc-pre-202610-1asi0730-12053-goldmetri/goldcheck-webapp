import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { monitoringApi } from '../infrastructure/monitoring-api.js'
import { useIamStore } from '../../iam/application/iam.store.js'

const QUEUE_KEY = () => {
  const iamStore = useIamStore()
  return `gc_checkpoint_queue_${iamStore.currentUser?.userId || 'guest'}`
}

function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY()) || '[]') } catch { return [] }
}
function writeQueue(list) {
  localStorage.setItem(QUEUE_KEY(), JSON.stringify(list))
}

export const useCheckpointStore = defineStore('checkpoint', () => {
  const checkpoints = ref([])       // synced checkpoints for the selected batch
  const pending     = ref(readQueue()) // offline-stored, not yet synced
  const offline     = ref(false)    // simulated connection state
  const loading     = ref(false)
  const errors      = ref([])

  const pendingCount = computed(() => pending.value.length)

  async function fetchCheckpoints(batchId) {
    if (!batchId) { checkpoints.value = []; return }
    loading.value = true
    errors.value = []
    try {
      const res = await monitoringApi.getCheckpoints(batchId)
      checkpoints.value = (res.data || []).map(c => ({
        id: c.id ?? c.Id,
        batchId: c.batchId ?? c.BatchId,
        controlPointName: c.controlPointName ?? c.ControlPointName,
        latitude: c.latitude ?? c.Latitude,
        longitude: c.longitude ?? c.Longitude,
        recordedAt: c.recordedAt ?? c.RecordedAt,
      }))
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  // US18 – Scenario 1 (online) registers immediately; while "offline" it is stored locally.
  async function registerCheckpoint(batchId, controlPointName, latitude, longitude) {
    errors.value = []
    if (!batchId || !controlPointName) { errors.value = ['fieldsRequired']; return { ok: false } }

    const payload = {
      BatchId: String(batchId),
      ControlPointName: controlPointName,
      Latitude: Number(latitude),
      Longitude: Number(longitude),
      RecordedAt: new Date().toISOString(),
    }

    if (offline.value) {
      pending.value = [...pending.value, payload]
      writeQueue(pending.value)
      return { ok: true, queued: true }
    }

    try {
      await monitoringApi.registerCheckpoint(payload)
      await fetchCheckpoints(batchId)
      return { ok: true, queued: false }
    } catch (e) {
      errors.value = [e?.response?.status === 409 ? 'notInTransit' : 'registerError']
      return { ok: false }
    }
  }

  // US18 – Scenario 2: on reconnect, sync the locally-stored checkpoints.
  async function syncPending(batchId) {
    errors.value = []
    if (!pending.value.length) return { ok: true, synced: 0 }
    loading.value = true
    try {
      const res = await monitoringApi.syncCheckpoints(pending.value)
      const synced = res.data?.synced ?? res.data?.Synced ?? 0
      pending.value = []
      writeQueue(pending.value)
      if (batchId) await fetchCheckpoints(batchId)
      return { ok: true, synced }
    } catch {
      errors.value = ['syncError']
      return { ok: false }
    } finally {
      loading.value = false
    }
  }

  function toggleOffline() { offline.value = !offline.value }

  return {
    checkpoints, pending, offline, loading, errors, pendingCount,
    fetchCheckpoints, registerCheckpoint, syncPending, toggleOffline
  }
})
