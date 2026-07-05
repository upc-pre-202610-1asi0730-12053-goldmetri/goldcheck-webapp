import { BaseApi } from '../../shared/infrastructure/base-api.js'

class SubscriptionsApi extends BaseApi {
  constructor() {
    super()
  }

  selectPlan(userId, planType, billingCycle) {
    return this.http.post('/subscriptions', { userId, planType, billingCycle })
  }

  // Stripe – create a hosted checkout session for a plan upgrade.
  startCheckout(userId, planType, billingCycle) {
    return this.http.post('/subscriptions/checkout', { userId, planType, billingCycle })
  }

  getUserSubscription(userId) {
    return this.http.get(`/subscriptions/${userId}`)
  }

  getAllSubscriptions() {
    return this.http.get('/subscriptions')
  }

  confirmSubscription(userId, paymentMethod) {
    return this.http.put(`/subscriptions/${userId}/confirm`, { paymentMethod })
  }

  requestDowngrade(userId, newPlanType) {
    return this.http.put(`/subscriptions/${userId}/downgrade`, { newPlanType })
  }

  checkFeatureAccess(userId, featureName) {
    return this.http.post(`/subscriptions/${userId}/feature-access`, { featureName })
  }

  requestInvoice(userId) {
    return this.http.post(`/subscriptions/${userId}/invoices`)
  }

  getInvoiceById(userId, invoiceId) {
    return this.http.get(`/subscriptions/${userId}/invoices/${invoiceId}`)
  }

  getPaymentHistory(userId) {
    return this.http.get(`/subscriptions/${userId}/payment-history`)
  }
}

export const subscriptionsApi = new SubscriptionsApi()
