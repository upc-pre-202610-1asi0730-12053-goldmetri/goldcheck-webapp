import { MaintenanceRecord } from '../domain/model/maintenance-record.entity.js'

export class MaintenanceRecordAssembler {
  static toEntity(r) {
    return new MaintenanceRecord({
      id: r.id, vehicleId: r.vehicleId, vehicleName: r.vehicleName,
      maintenanceType: r.maintenanceType, description: r.description,
      scheduledDate: r.scheduledDate, completedDate: r.completedDate,
      technicianId: r.technicianId, status: r.status || 'Programado',
      cost: r.cost || 0
    })
  }

  static toEntities(response) {
    return (response.data || []).map(r => this.toEntity(r))
  }

  static toResource(record) {
    return {
      vehicleId: record.vehicleId, vehicleName: record.vehicleName,
      maintenanceType: record.maintenanceType, description: record.description,
      scheduledDate: record.scheduledDate, status: record.status, cost: record.cost
    }
  }
}
