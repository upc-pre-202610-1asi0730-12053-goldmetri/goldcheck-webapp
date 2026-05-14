import { BaseEntity } from '../../../shared/domain/model/base-entity.js'

export class Incident extends BaseEntity {
  constructor({
    id = null,
    title = '',
    description = '',
    incidentType = '',
    severity = 'LOW',
    batchId = null,
    vehicleId = null,
    reportedBy = null,
    status = 'Abierto',
    reportedAt = null,
    resolvedAt = null
  } = {}) {
    super({ id })
    this.title        = title
    this.description  = description
    this.incidentType = incidentType  // 'ROBO' | 'ACCIDENTE' | 'DESVIO' | 'OTRO'
    this.severity     = severity      // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    this.batchId      = batchId
    this.vehicleId    = vehicleId
    this.reportedBy   = reportedBy
    this.status       = status        // 'Abierto' | 'En Revisión' | 'Resuelto' | 'Cerrado'
    this.reportedAt   = reportedAt || new Date().toISOString()
    this.resolvedAt   = resolvedAt
  }
}
