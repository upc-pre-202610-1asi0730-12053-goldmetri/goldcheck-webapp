import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class MaterialOperationsApi extends BaseApi {
  #batches

  constructor() {
    super()
    this.#batches = new BaseEndpoint(this.http, '/mineralBatches')
  }

  // US20 – Confirmación de llegada: cambiar status a "En Planta"
  confirmArrival(id) {
    return this.#batches.patch(id, { status: 'En Planta' })
  }

  // US21 – Pesaje final (recepción)
  registerFinalWeight(id, finalWeight) {
    return this.#batches.patch(id, { finalWeight, status: 'En Balanza' })
  }

  // US16 – Tipificación de mineral
  classifyMineral(id, mineralType) {
    return this.#batches.patch(id, { mineralType })
  }

  // US22 – Cálculo de merma: mark lote "Bajo Investigación" if shrinkage > 5%
  markUnderInvestigation(id) {
    return this.#batches.patch(id, { status: 'Bajo Investigación' })
  }

  // US29 – Ingreso de material de cliente (lote sin historial minero)
  createClientMaterial(data) {
    return this.#batches.create(data)
  }

  getBatches(params) { return this.#batches.getAll(params) }
  getBatchById(id)   { return this.#batches.getById(id) }
}

export const materialOperationsApi = new MaterialOperationsApi()
