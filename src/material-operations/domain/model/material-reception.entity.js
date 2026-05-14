import { BaseEntity } from '../../../shared/domain/model/base-entity.js'

export class MaterialReception extends BaseEntity {
  constructor({
    id = null,
    batchId = null,
    batchCode = '',
    receivedWeight = 0,
    initialWeight = 0,
    shrinkagePercent = 0,
    mineralType = '',
    purityKarats = null,
    status = 'Pendiente',
    operatorId = null,
    receivedAt = null
  } = {}) {
    super({ id })
    this.batchId          = batchId
    this.batchCode        = batchCode
    this.receivedWeight   = receivedWeight
    this.initialWeight    = initialWeight
    this.shrinkagePercent = shrinkagePercent
    this.mineralType      = mineralType
    this.purityKarats     = purityKarats
    this.status           = status  // 'Pendiente' | 'Recibido' | 'Bajo Investigación' | 'Procesado'
    this.operatorId       = operatorId
    this.receivedAt       = receivedAt || new Date().toISOString()
  }

  get shrinkage() {
    if (!this.initialWeight) return 0
    return ((this.initialWeight - this.receivedWeight) / this.initialWeight * 100).toFixed(2)
  }

  get isCritical() {
    return parseFloat(this.shrinkage) > 5
  }
}
