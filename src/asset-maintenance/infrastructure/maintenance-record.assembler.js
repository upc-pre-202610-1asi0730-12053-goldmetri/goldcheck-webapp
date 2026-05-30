import { MaintenanceRecord } from '../domain/model/maintenance-record.entity.js'

/**
 * Maps maintenance record resources into domain entities.
 *
 * @class MaintenanceRecordAssembler
 */
export class MaintenanceRecordAssembler {
  /**
   * @param {Object} resource - MaintenanceRecord resource payload.
   * @returns {MaintenanceRecord} MaintenanceRecord entity.
   */
  static toEntityFromResource(resource) {
    return new MaintenanceRecord({
      id: resource.id, vehicleId: resource.vehicleId, vehicleName: resource.vehicleName,
      maintenanceType: resource.maintenanceType, description: resource.description,
      scheduledDate: resource.scheduledDate, completedDate: resource.completedDate,
      technicianId: resource.technicianId, status: resource.status || 'Programado',
      cost: resource.cost || 0
    })
  }

  /**
   * Parses maintenance record resources from a response and maps them into entities.
   *
   * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with maintenance record resources.
   * @returns {MaintenanceRecord[]} MaintenanceRecord entities.
   */
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['records']
    return resources.map(resource => this.toEntityFromResource(resource))
  }

  /**
   * Converts a MaintenanceRecord entity into an API resource payload.
   *
   * @param {MaintenanceRecord} record - MaintenanceRecord entity.
   * @returns {Object} Resource payload.
   */
  static toResourceFromEntity(record) {
    return {
      vehicleId: record.vehicleId, vehicleName: record.vehicleName,
      maintenanceType: record.maintenanceType, description: record.description,
      scheduledDate: record.scheduledDate, status: record.status, cost: record.cost
    }
  }
}
