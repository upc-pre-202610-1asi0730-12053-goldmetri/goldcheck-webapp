import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useIamStore } from '../../iam/application/iam.store.js'
import { subscriptionsApi } from '../infrastructure/subscriptions-api.js'

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const loading = ref(false)
  const errors  = ref([])

  const PLAN_KEY_MAP = {
    FREE: 'Free', BRONZE: 'Basic', GOLD: 'Professional', PLATINUM: 'Enterprise',
    PRO: 'Professional',
    Free: 'Free', Basic: 'Basic', Professional: 'Professional', Enterprise: 'Enterprise'
  }

  function currentUserId() {
    const iamStore = useIamStore()
    return String(iamStore.currentUser?.userId || iamStore.currentUser?.id || '')
  }

  async function upgradePlan(planKey) {
    const iamStore = useIamStore()
    if (!iamStore.currentUser) return false
    loading.value = true
    errors.value  = []

    const mappedPlan = PLAN_KEY_MAP[planKey] || planKey
    const userId     = currentUserId()

    try {
      // Persist the plan in SubscriptionsAndBilling. Create the subscription on the first
      // purchase (leaves it Active); an existing one is left untouched — plan changes go
      // through the downgrade flow, not a duplicate insert.
      if (userId) {
        let exists = false
        try { exists = !!(await subscriptionsApi.getUserSubscription(userId)).data } catch { exists = false }
        if (!exists) await subscriptionsApi.selectPlan(userId, mappedPlan, 'Monthly')
      }
      iamStore.applyPlanUpgrade && iamStore.applyPlanUpgrade(mappedPlan)
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
    const userId   = currentUserId()
    if (userId) {
      try {
        const sub = (await subscriptionsApi.getUserSubscription(userId)).data
        if (sub) return { plan: sub.planType || iamStore.currentUser?.plan || 'Free', status: sub.subscriptionStatus || 'Active' }
      } catch { /* no subscription yet — fall back to the local plan */ }
    }
    return { plan: iamStore.currentUser?.plan || 'Free', status: 'Active' }
  }

  return { loading, errors, upgradePlan, fetchSubscription }
})
