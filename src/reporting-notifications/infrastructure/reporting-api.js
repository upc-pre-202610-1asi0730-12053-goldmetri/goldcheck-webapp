import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class ReportingApi extends BaseApi {
  #batches
  #jewelryItems
  #alerts

  constructor() {
    super()
    this.#batches      = new BaseEndpoint(this.http, '/mineralBatches')
    this.#jewelryItems = new BaseEndpoint(this.http, '/jewelryItems')
    this.#alerts       = new BaseEndpoint(this.http, '/anomalyAlerts')
  }

  getBatchReport(params)   { return this.#batches.getAll(params) }
  getJewelryReport(params) { return this.#jewelryItems.getAll(params) }
  getAlertReport(params)   { return this.#alerts.getAll(params) }
}

export const reportingApi = new ReportingApi()
