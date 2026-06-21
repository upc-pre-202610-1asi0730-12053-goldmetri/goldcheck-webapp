import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { analyticsApi } from '../infrastructure/analytics-api.js'

export const useAnalyticsStore = defineStore('analytics', () => {
  const batches      = ref([])
  const vehicles     = ref([])
  const jewelryItems = ref([])
  const loading      = ref(false)
  const errors       = ref([])

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

  return {
    batches, vehicles, jewelryItems, loading, errors,
    batchesWithShrinkage, avgShrinkage,
    totalBatches, activeBatches, totalJewels, certifiedJewels,
    fetchAnalyticsData
  }
})
