import { BaseApi } from '../../shared/infrastructure/base-api.js'

class AssetMaintenanceApi extends BaseApi {
  constructor() {
    super()
  }

  getAllMachinery() {
    return this.http.get('/machinery')
  }

  getMachineryById(machineryId) {
    return this.http.get(`/machinery/${machineryId}`)
  }

  registerMachinery(data) {
    return this.http.post('/machinery', {
      MachineryId: data.machineryId,
      Model:       data.model,
      OEM:         data.oem
    })
  }

  updateEngineHours(machineryId, currentEngineHours) {
    return this.http.put(`/machinery/${machineryId}`, { CurrentEngineHours: currentEngineHours })
  }

  scheduleMaintenance(machineryId, engineHours) {
    return this.http.put(`/machinery/${machineryId}/schedule-maintenance`, { EngineHours: engineHours })
  }

  dischargeMachinery(machineryId, reason) {
    return this.http.put(`/machinery/${machineryId}/discharge`, { Reason: reason })
  }
}

export const assetMaintenanceApi = new AssetMaintenanceApi()
