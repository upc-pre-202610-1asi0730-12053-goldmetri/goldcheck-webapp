import { SubscriptionPlan } from '../domain/model/subscription-plan.entity.js'

export class SubscriptionPlanAssembler {
  static toEntity(r) {
    return new SubscriptionPlan({
      id: r.id, planKey: r.planKey || r.id,
      name: r.name, price: r.price || 0,
      currency: r.currency || 'PEN',
      billingCycle: r.billingCycle || 'monthly',
      features: r.features || [],
      maxBatchesPerMonth: r.maxBatchesPerMonth || 0,
      hasAnalytics: r.hasAnalytics || false,
      hasIoT: r.hasIoT || false,
      hasApiAccess: r.hasApiAccess || false,
      isActive: r.isActive !== undefined ? r.isActive : true
    })
  }

  static toEntities(response) {
    return (response.data || []).map(r => this.toEntity(r))
  }
}
