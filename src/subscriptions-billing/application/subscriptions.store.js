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

  // Stripe – start a hosted checkout and redirect the browser to Stripe.
  async function checkoutPlan(planKey, billingCycle = 'Monthly') {
    const userId = currentUserId()
    if (!userId) return { ok: false }
    loading.value = true
    errors.value  = []
    try {
      const mappedPlan = PLAN_KEY_MAP[planKey] || planKey
      const res = await subscriptionsApi.startCheckout(userId, mappedPlan, billingCycle)
      const url = res.data?.url
      if (!url) { errors.value = ['checkoutError']; return { ok: false } }
      // Remember what was purchased so we can activate it on return (webhook fallback).
      localStorage.setItem('gc_pending_plan', JSON.stringify({ plan: mappedPlan, cycle: billingCycle }))
      window.location.href = url // hand off to Stripe Checkout
      return { ok: true }
    } catch {
      errors.value = ['checkoutError']
      return { ok: false }
    } finally {
      loading.value = false
    }
  }

  // Called when returning from Stripe with ?checkout=success. Ensures the backend subscription
  // is active for the paid plan even if the Stripe webhook hasn't reached the backend (e.g. in
  // local dev without the Stripe CLI). Safe fallback so the plan/limit reflects the payment.
  async function activatePendingPlan() {
    const iamStore = useIamStore()
    const userId   = currentUserId()
    let pending = null
    try { pending = JSON.parse(localStorage.getItem('gc_pending_plan') || 'null') } catch { pending = null }
    localStorage.removeItem('gc_pending_plan')
    if (!userId || !pending?.plan) return
    try {
      let exists = false
      try { exists = !!(await subscriptionsApi.getUserSubscription(userId)).data } catch { exists = false }
      if (!exists) await subscriptionsApi.selectPlan(userId, pending.plan, pending.cycle || 'Monthly')
      iamStore.applyPlanUpgrade && iamStore.applyPlanUpgrade(pending.plan)
    } catch { /* ignore — webhook may have already handled it */ }
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

  return { loading, errors, upgradePlan, checkoutPlan, activatePendingPlan, fetchSubscription }
})
