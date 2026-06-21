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
      machineryId: data.machineryId,
      model:       data.model,
      oem:         data.oem
    })
  }

  updateEngineHours(machineryId, currentEngineHours) {
    return this.http.put(`/machinery/${machineryId}`, { currentEngineHours })
  }

  scheduleMaintenance(machineryId, engineHours) {
    return this.http.put(`/machinery/${machineryId}/schedule-maintenance`, { engineHours })
  }

  dischargeMachinery(machineryId, reason) {
    return this.http.put(`/machinery/${machineryId}/discharge`, { reason })
  }
}

export const assetMaintenanceApi = new AssetMaintenanceApi()
