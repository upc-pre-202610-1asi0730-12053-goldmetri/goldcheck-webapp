import { BaseEntity } from '../../../shared/domain/model/base-entity.js'

export class AnalyticsMetric extends BaseEntity {
  constructor({
    id = null,
    metricKey = '',
    value = 0,
    unit = '',
    period = '',
    segment = '',
    createdAt = null
  } = {}) {
    super({ id })
    this.metricKey = metricKey
    this.value     = value
    this.unit      = unit
    this.period    = period
    this.segment   = segment
    this.createdAt = createdAt || new Date().toISOString()
  }
}
