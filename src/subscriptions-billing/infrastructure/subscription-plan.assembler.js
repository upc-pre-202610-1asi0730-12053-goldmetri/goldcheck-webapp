import { SubscriptionPlan } from '../domain/model/subscription-plan.entity.js'

/**
 * Maps subscription plan resources into domain entities.
 *
 * @class SubscriptionPlanAssembler
 */
export class SubscriptionPlanAssembler {
  /**
   * @param {Object} resource - SubscriptionPlan resource payload.
   * @returns {SubscriptionPlan} SubscriptionPlan entity.
   */
  static toEntityFromResource(resource) {
    return new SubscriptionPlan({
      id: resource.id, planKey: resource.planKey || resource.id,
      name: resource.name, price: resource.price || 0,
      currency: resource.currency || 'PEN',
      billingCycle: resource.billingCycle || 'monthly',
      features: resource.features || [],
      maxBatchesPerMonth: resource.maxBatchesPerMonth || 0,
      hasAnalytics: resource.hasAnalytics || false,
      hasIoT: resource.hasIoT || false,
      hasApiAccess: resource.hasApiAccess || false,
      isActive: resource.isActive !== undefined ? resource.isActive : true
    })
  }

  /**
   * Parses subscription plan resources from a response and maps them into entities.
   *
   * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with subscription plan resources.
   * @returns {SubscriptionPlan[]} SubscriptionPlan entities.
   */
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['plans']
    return resources.map(resource => this.toEntityFromResource(resource))
  }
}
