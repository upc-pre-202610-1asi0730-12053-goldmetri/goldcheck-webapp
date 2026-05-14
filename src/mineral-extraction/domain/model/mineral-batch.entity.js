import { BaseEntity } from '../../../shared/domain/model/base-entity.js'

export class MineralBatch extends BaseEntity {
  constructor({
    id = null, batchCode = '', depositId = null, depositName = '',
    vehicleId = null, vehicleName = '', driverId = null,
    initialWeight = 0, finalWeight = null, mineralType = '',
    status = 'Cargando', destination = '', createdAt = null
  } = {}) {
    super({ id })
    this.batchCode    = batchCode
    this.depositId    = depositId
    this.depositName  = depositName
    this.vehicleId    = vehicleId
    this.vehicleName  = vehicleName
    this.driverId     = driverId
    this.initialWeight = initialWeight
    this.finalWeight  = finalWeight
    this.mineralType  = mineralType
    this.status       = status      // 'Cargando' | 'En Tránsito' | 'En Balanza' | 'En Planta' | 'Procesado' | 'Desvío Detectado'
    this.destination  = destination
    this.createdAt    = createdAt || new Date().toISOString()
  }
}
