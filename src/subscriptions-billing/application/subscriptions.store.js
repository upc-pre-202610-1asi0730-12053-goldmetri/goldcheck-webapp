import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useIamStore } from '../../iam/application/iam.store.js'

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const loading = ref(false)
  const errors  = ref([])

  const PLAN_KEY_MAP = {
    FREE: 'Free', BRONZE: 'Basic', GOLD: 'Professional', PLATINUM: 'Enterprise',
    PRO: 'Professional',
    Free: 'Free', Basic: 'Basic', Professional: 'Professional', Enterprise: 'Enterprise'
  }

  async function upgradePlan(planKey) {
    const iamStore = useIamStore()
    if (!iamStore.currentUser) return false
    loading.value = true
    errors.value  = []

    await new Promise(r => setTimeout(r, 600))

    const mappedPlan = PLAN_KEY_MAP[planKey] || planKey
    iamStore.applyPlanUpgrade && iamStore.applyPlanUpgrade(mappedPlan)
    loading.value = false
    return true
  }

  async function fetchSubscription() {
    const iamStore = useIamStore()
    const plan     = iamStore.currentUser?.plan || 'Free'
    return { plan, status: 'Active' }
  }

  return { loading, errors, upgradePlan, fetchSubscription }
})
