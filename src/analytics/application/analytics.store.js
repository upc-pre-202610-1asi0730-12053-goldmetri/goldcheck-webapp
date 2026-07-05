import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { analyticsApi } from '../infrastructure/analytics-api.js'
import { useIamStore } from '../../iam/application/iam.store.js'

export const useAnalyticsStore = defineStore('analytics', () => {
  const batches      = ref([])
  const vehicles     = ref([])
  const jewelryItems = ref([])
  const loading      = ref(false)
  const errors       = ref([])

  // US38/US39 – server-composed metric reports.
  const shrinkage       = ref(null)
  const validatedVolume = ref(null)

  // Map MaterialResource → batch-like shape
  function toAnalyticsBatch(r) {
    return {
      id:            r.id,
      routeId:       r.routeId,
      status:        r.routeStatus === 'Active' ? 'En Tránsito' : r.routeStatus || r.status,
      initialWeight: r.productionTons  || 0,
      finalWeight:   null
    }
  }

  const batchesWithShrinkage = computed(() =>
    batches.value.filter(b => b.initialWeight && b.finalWeight)
  )

  const avgShrinkage = computed(() => {
    const eligible = batchesWithShrinkage.value
    if (!eligible.length) return 0
    const total = eligible.reduce((sum, b) =>
      sum + ((b.initialWeight - b.finalWeight) / b.initialWeight) * 100, 0)
    return (total / eligible.length).toFixed(2)
  })

  const totalBatches    = computed(() => batches.value.length)
  const activeBatches   = computed(() => batches.value.filter(b => b.status === 'En Tránsito').length)
  const totalJewels     = computed(() => jewelryItems.value.length)
  const certifiedJewels = computed(() => jewelryItems.value.filter(j => j.certificateIdRef).length)

  async function fetchAnalyticsData() {
    loading.value = true
    errors.value  = []
    try {
      const [rRes, mRes, jRes] = await Promise.all([
        analyticsApi.getAllRoutes(),
        analyticsApi.getAllMachinery(),
        analyticsApi.getAllJewelryMaterials()
      ])
      batches.value      = (rRes.data  || []).map(toAnalyticsBatch)
      vehicles.value     = mRes.data   || []
      jewelryItems.value = jRes.data   || []
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  // US38 – monthly mining shrinkage report.
  async function fetchShrinkage(year, month) {
    loading.value = true
    errors.value  = []
    try {
      shrinkage.value = (await analyticsApi.getMiningShrinkage(year, month)).data
    } catch {
      errors.value = ['fetchError']
      shrinkage.value = null
    } finally {
      loading.value = false
    }
  }

  // US39 – jewelry validated-gold volume (optionally filtered by supplier origin).
  async function fetchValidatedVolume(supplierId = null) {
    const iamStore = useIamStore()
    const jewelerId = String(iamStore.currentUser?.userId || iamStore.currentUser?.id || '')
    loading.value = true
    errors.value  = []
    try {
      validatedVolume.value = (await analyticsApi.getValidatedVolume(jewelerId, supplierId)).data
    } catch {
      errors.value = ['fetchError']
      validatedVolume.value = null
    } finally {
      loading.value = false
    }
  }

  // US40 – export mining batch history. Returns { deferred } (202) or triggers a CSV download.
  async function exportBatchHistory(email = null) {
    errors.value = []
    try {
      const res = await analyticsApi.exportBatchHistory(email)
      if (res.status === 202) {
        const text = await res.data.text()
        return { ok: true, deferred: true, info: JSON.parse(text) }
      }
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `batch-history-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
      return { ok: true, deferred: false }
    } catch {
      errors.value = ['exportError']
      return { ok: false }
    }
  }

  return {
    batches, vehicles, jewelryItems, loading, errors,
    shrinkage, validatedVolume,
    batchesWithShrinkage, avgShrinkage,
    totalBatches, activeBatches, totalJewels, certifiedJewels,
    fetchAnalyticsData, fetchShrinkage, fetchValidatedVolume, exportBatchHistory
  }
})
