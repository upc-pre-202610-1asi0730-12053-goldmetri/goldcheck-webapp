import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class MonitoringApi extends BaseApi {
  #alerts
  #batches

  constructor() {
    super()
    this.#alerts  = new BaseEndpoint(this.http, '/anomalyAlerts')
    this.#batches = new BaseEndpoint(this.http, '/mineralBatches')
  }

  // US19 – Delay or route deviation alert endpoints
  getAlerts(params)        { return this.#alerts.getAll(params) }
  getAlertById(id)         { return this.#alerts.getById(id) }
  createAlert(data)        { return this.#alerts.create(data) }
  resolveAlert(id)         { return this.#alerts.patch(id, { status: 'Resuelta' }) }

  // US17 / US18 – Batches in transit for monitoring
  getActiveBatches()       { return this.#batches.getAll({ status: 'En Tránsito' }) }
  updateBatchStatus(id, status) { return this.#batches.patch(id, { status }) }
}

export const monitoringApi = new MonitoringApi()
