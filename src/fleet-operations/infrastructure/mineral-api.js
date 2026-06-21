import { BaseApi } from '../../shared/infrastructure/base-api.js'

class MineralApi extends BaseApi {
  constructor() {
    super()
  }

  getAllHaulingCycles() {
    return this.http.get('/hauling-cycles')
  }

  getHaulingCycleById(cycleId) {
    return this.http.get(`/hauling-cycles/${cycleId}`)
  }

  startHaulingCycle(vehicleId, loadingPoint) {
    return this.http.post('/hauling-cycles', { VehicleId: vehicleId, LoadingPoint: loadingPoint })
  }

  loadMaterial(cycleId, payloadTons) {
    return this.http.put(`/hauling-cycles/${cycleId}/load`, { PayloadTons: payloadTons })
  }

  completeHaulingCycle(cycleId, dumpingPoint) {
    return this.http.put(`/hauling-cycles/${cycleId}/complete`, { DumpingPoint: dumpingPoint })
  }

  getAllVehicles() {
    return this.http.get('/vehicles')
  }

  registerVehicle(vehicleId, operatorId) {
    return this.http.post('/vehicles', { VehicleId: vehicleId, OperatorId: operatorId })
  }
}

export const mineralApi = new MineralApi()
