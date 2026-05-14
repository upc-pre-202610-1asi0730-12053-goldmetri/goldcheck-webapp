import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class AnalyticsApi extends BaseApi {
  #batches
  #vehicles
  #jewelryItems

  constructor() {
    super()
    this.#batches      = new BaseEndpoint(this.http, '/mineralBatches')
    this.#vehicles     = new BaseEndpoint(this.http, '/vehicles')
    this.#jewelryItems = new BaseEndpoint(this.http, '/jewelryItems')
  }

  getBatches(params)      { return this.#batches.getAll(params) }
  getVehicles(params)     { return this.#vehicles.getAll(params) }
  getJewelryItems(params) { return this.#jewelryItems.getAll(params) }
}

export const analyticsApi = new AnalyticsApi()
