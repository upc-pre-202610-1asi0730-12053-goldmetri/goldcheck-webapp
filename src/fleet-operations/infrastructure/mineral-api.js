import { BaseApi } from '../../shared/infrastructure/base-api.js'

class MineralApi extends BaseApi {
  constructor() {
    super()
  }

  getAllHaulingCycles(reporterId) {
    return this.http.get('/hauling-cycles', { params: reporterId ? { reporterId } : {} })
  }

  getHaulingCycleById(cycleId) {
    return this.http.get(`/hauling-cycles/${cycleId}`)
  }

  startHaulingCycle(vehicleId, loadingPoint, reporterId) {
    return this.http.post('/hauling-cycles', { VehicleId: vehicleId, LoadingPoint: loadingPoint, ReporterId: reporterId })
  }

  loadMaterial(cycleId, payloadTons, batchId) {
    return this.http.put(`/hauling-cycles/${cycleId}/load`, { PayloadTons: payloadTons, BatchId: batchId })
  }

  assignDriver(cycleId, driverId) {
    return this.http.put(`/hauling-cycles/${cycleId}/assign-driver`, { DriverId: driverId })
  }

  startRoute(cycleId) {
    return this.http.put(`/hauling-cycles/${cycleId}/start-route`)
  }

  confirmArrival(cycleId, latitude, longitude) {
    return this.http.put(`/hauling-cycles/${cycleId}/confirm-arrival`, { Latitude: latitude, Longitude: longitude })
  }

  completeHaulingCycle(cycleId, dumpingPoint) {
    return this.http.put(`/hauling-cycles/${cycleId}/complete`, { DumpingPoint: dumpingPoint })
  }

  getAllVehicles() {
    return this.http.get('/vehicles')
  }

  registerVehicle(vehicleId, operatorId, capacity) {
    return this.http.post('/vehicles', { VehicleId: vehicleId, OperatorId: operatorId, Capacity: capacity })
  }
}

export const mineralApi = new MineralApi()
