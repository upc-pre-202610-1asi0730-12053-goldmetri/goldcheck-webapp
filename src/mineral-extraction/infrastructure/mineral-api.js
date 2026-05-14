import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class MineralApi extends BaseApi {
  #batches
  #deposits
  #vehicles
  #alerts

  constructor() {
    super()
    this.#batches  = new BaseEndpoint(this.http, '/mineralBatches')
    this.#deposits = new BaseEndpoint(this.http, '/deposits')
    this.#vehicles = new BaseEndpoint(this.http, '/vehicles')
    this.#alerts   = new BaseEndpoint(this.http, '/anomalyAlerts')
  }

  // TS04 – Batches
  getBatches(params)      { return this.#batches.getAll(params) }
  getBatchById(id)        { return this.#batches.getById(id) }
  createBatch(data)       { return this.#batches.create(data) }         // US13
  updateBatchStatus(id, status) { return this.#batches.patch(id, { status }) } // TS05

  // US14 – Pesaje inicial (patch initialWeight)
  registerInitialWeight(id, weight) { return this.#batches.patch(id, { initialWeight: weight, status: 'En Tránsito' }) }

  // Supporting
  getDeposits()           { return this.#deposits.getAll() }
  getVehicles()           { return this.#vehicles.getAll() }
  getAlerts()             { return this.#alerts.getAll() }
}

export const mineralApi = new MineralApi()
