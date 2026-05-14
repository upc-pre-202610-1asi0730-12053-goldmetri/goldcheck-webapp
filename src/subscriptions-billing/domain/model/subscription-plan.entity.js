import { BaseEntity } from '../../../shared/domain/model/base-entity.js'

export class SubscriptionPlan extends BaseEntity {
  constructor({
    id = null,
    planKey = '',
    name = '',
    price = 0,
    currency = 'PEN',
    billingCycle = 'monthly',
    features = [],
    maxBatchesPerMonth = 0,
    hasAnalytics = false,
    hasIoT = false,
    hasApiAccess = false,
    isActive = true
  } = {}) {
    super({ id })
    this.planKey             = planKey
    this.name                = name
    this.price               = price
    this.currency            = currency
    this.billingCycle        = billingCycle
    this.features            = features
    this.maxBatchesPerMonth  = maxBatchesPerMonth
    this.hasAnalytics        = hasAnalytics
    this.hasIoT              = hasIoT
    this.hasApiAccess        = hasApiAccess
    this.isActive            = isActive
  }
}
