import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class AssetMaintenanceApi extends BaseApi {
  #vehicles

  constructor() {
    super()
    // Vehicles collection tracks asset state; maintenance records would be a dedicated endpoint
    this.#vehicles = new BaseEndpoint(this.http, '/vehicles')
  }

  getVehicles(params)             { return this.#vehicles.getAll(params) }
  getVehicleById(id)              { return this.#vehicles.getById(id) }
  updateVehicleStatus(id, status) { return this.#vehicles.patch(id, { status }) }
  updateVehicle(id, data)         { return this.#vehicles.patch(id, data) }
}

export const assetMaintenanceApi = new AssetMaintenanceApi()
