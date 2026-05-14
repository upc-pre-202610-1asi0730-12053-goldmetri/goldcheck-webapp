import { BaseEntity } from '../../../shared/domain/model/base-entity.js'

export class ConsumerPiece extends BaseEntity {
  constructor({
    id = null, ownerId = null, sku = '', name = '', type = '',
    purity = '', weight = 0, certificationId = null,
    purchaseDate = null, status = 'Activo', imageUrl = '',
    traceabilityCode = ''
  } = {}) {
    super({ id })
    this.ownerId          = ownerId
    this.sku              = sku
    this.name             = name
    this.type             = type
    this.purity           = purity
    this.weight           = weight
    this.certificationId  = certificationId
    this.purchaseDate     = purchaseDate || new Date().toISOString()
    this.status           = status
    this.imageUrl         = imageUrl
    this.traceabilityCode = traceabilityCode
  }
}
