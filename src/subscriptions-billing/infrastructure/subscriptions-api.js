import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class SubscriptionsApi extends BaseApi {
  #users

  constructor() {
    super()
    this.#users = new BaseEndpoint(this.http, '/users')
  }

  // US02 – Plan listing (static, no endpoint needed; kept for plan upgrade)
  upgradePlan(userId, plan) {
    return this.#users.patch(userId, { plan })
  }

  getUserById(id) {
    return this.#users.getById(id)
  }
}

export const subscriptionsApi = new SubscriptionsApi()
