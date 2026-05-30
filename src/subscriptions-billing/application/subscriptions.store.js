import { defineStore } from 'pinia'
import { ref } from 'vue'
import { subscriptionsApi } from '../infrastructure/subscriptions-api.js'
import { useIamStore } from '../../iam/application/iam.store.js'

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const loading = ref(false)
  const errors  = ref([])

  // US02 – Plan upgrade
  async function upgradePlan(planKey) {
    const iamStore = useIamStore()
    if (!iamStore.currentUser?.id) return false
    loading.value = true
    errors.value  = []
    try {
      await subscriptionsApi.upgradePlan(iamStore.currentUser.id, planKey)
      iamStore.applyPlanUpgrade(planKey)
      return true
    } catch {
      errors.value = ['upgradeError']
      return false
    } finally {
      loading.value = false
    }
  }

  return { loading, errors, upgradePlan }
})
