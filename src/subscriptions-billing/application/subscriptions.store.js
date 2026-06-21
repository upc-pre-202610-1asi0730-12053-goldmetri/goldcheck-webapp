import { defineStore } from 'pinia'
import { ref } from 'vue'
import { subscriptionsApi } from '../infrastructure/subscriptions-api.js'
import { useIamStore } from '../../iam/application/iam.store.js'

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const loading = ref(false)
  const errors  = ref([])

  async function upgradePlan(planKey) {
    const iamStore = useIamStore()
    const userId   = iamStore.currentUser?.userId || iamStore.currentUser?.id
    if (!userId) return false
    loading.value = true
    errors.value  = []
    try {
      await subscriptionsApi.selectPlan(userId, planKey, 'Monthly')
      iamStore.applyPlanUpgrade && iamStore.applyPlanUpgrade(planKey)
      return true
    } catch {
      errors.value = ['upgradeError']
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchSubscription() {
    const iamStore = useIamStore()
    const userId   = iamStore.currentUser?.userId || iamStore.currentUser?.id
    if (!userId) return null
    try {
      const res = await subscriptionsApi.getUserSubscription(userId)
      return res.data || null
    } catch {
      return null
    }
  }

  return { loading, errors, upgradePlan, fetchSubscription }
})
