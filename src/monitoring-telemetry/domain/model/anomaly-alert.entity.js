import { BaseEntity } from '../../../shared/domain/model/base-entity.js'

export class AnomalyAlert extends BaseEntity {
  constructor({
    id = null,
    batchId = null,
    batchCode = '',
    vehicleId = null,
    alertType = '',
    severity = 'LOW',
    description = '',
    coordinates = null,
    status = 'Activa',
    detectedAt = null,
    resolvedAt = null
  } = {}) {
    super({ id })
    this.batchId     = batchId
    this.batchCode   = batchCode
    this.vehicleId   = vehicleId
    this.alertType   = alertType  // 'RETRASO' | 'DESVIO' | 'MERMA_CRITICA' | 'DESCONEXION'
    this.severity    = severity   // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    this.description = description
    this.coordinates = coordinates
    this.status      = status     // 'Activa' | 'Resuelta' | 'En Revisión'
    this.detectedAt  = detectedAt || new Date().toISOString()
    this.resolvedAt  = resolvedAt
  }

  get isActive() {
    return this.status === 'Activa'
  }

  get isCritical() {
    const s = (this.severity || '').toUpperCase()
    return s === 'CRITICAL' || s === 'HIGH'
  }
}
