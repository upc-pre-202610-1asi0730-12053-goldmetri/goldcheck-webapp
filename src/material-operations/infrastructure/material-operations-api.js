import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class MaterialOperationsApi extends BaseApi {
  #batches

  constructor() {
    super()
    this.#batches = new BaseEndpoint(this.http, '/mineralBatches')
  }

  // US20 – Arrival confirmation: set status to "En Planta"
  confirmArrival(id) {
    return this.#batches.patch(id, { status: 'En Planta' })
  }

  // US21 – Final weighing (reception)
  registerFinalWeight(id, finalWeight) {
    return this.#batches.patch(id, { finalWeight, status: 'En Balanza' })
  }

  // US16 – Mineral classification
  classifyMineral(id, mineralType) {
    return this.#batches.patch(id, { mineralType })
  }

  // US22 – Shrinkage calculation: flags batch as "Under Investigation" if shrinkage exceeds 5%
  markUnderInvestigation(id) {
    return this.#batches.patch(id, { status: 'Bajo Investigación' })
  }

  // US29 – Client material entry (batch with no mining history)
  createClientMaterial(data) {
    return this.#batches.create(data)
  }

  getBatches(params) { return this.#batches.getAll(params) }
  getBatchById(id)   { return this.#batches.getById(id) }
}

export const materialOperationsApi = new MaterialOperationsApi()
