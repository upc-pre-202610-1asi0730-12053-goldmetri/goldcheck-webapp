import { BaseEntity } from '../../../shared/domain/model/base-entity.js'

export class AnomalyAlert extends BaseEntity {
  constructor({ id = null, batchId = null, type = '', message = '', severity = 'warning', createdAt = null } = {}) {
    super({ id })
    this.batchId   = batchId
    this.type      = type       // 'ROUTE_DEVIATION' | 'OVERLOAD' | 'DELAY'
    this.message   = message
    this.severity  = severity   // 'warning' | 'critical'
    this.createdAt = createdAt || new Date().toISOString()
  }
}
