import { BaseEntity } from '../../../shared/domain/model/base-entity.js'

export class MaintenanceRecord extends BaseEntity {
  constructor({
    id = null,
    vehicleId = null,
    vehicleName = '',
    maintenanceType = '',
    description = '',
    scheduledDate = null,
    completedDate = null,
    technicianId = null,
    status = 'Programado',
    cost = 0
  } = {}) {
    super({ id })
    this.vehicleId       = vehicleId
    this.vehicleName     = vehicleName
    this.maintenanceType = maintenanceType  // 'PREVENTIVO' | 'CORRECTIVO' | 'INSPECCION'
    this.description     = description
    this.scheduledDate   = scheduledDate
    this.completedDate   = completedDate
    this.technicianId    = technicianId
    this.status          = status  // 'Programado' | 'En Progreso' | 'Completado' | 'Cancelado'
    this.cost            = cost
  }

  get isOverdue() {
    if (this.status !== 'Programado') return false
    return this.scheduledDate && new Date(this.scheduledDate) < new Date()
  }
}
