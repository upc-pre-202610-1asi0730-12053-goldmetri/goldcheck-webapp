import { BaseEntity } from '../../../shared/domain/model/base-entity.js'

export class JewelryCertificate extends BaseEntity {
  constructor({
    id = null, itemId = null, itemSku = '', issuerName = '', issueDate = null,
    expiryDate = null, purity = '', weight = 0, qrCode = '', status = 'Activo'
  } = {}) {
    super({ id })
    this.itemId     = itemId
    this.itemSku    = itemSku
    this.issuerName = issuerName
    this.issueDate  = issueDate || new Date().toISOString()
    this.expiryDate = expiryDate
    this.purity     = purity
    this.weight     = weight
    this.qrCode     = qrCode
    this.status     = status   // 'Activo' | 'Revocado' | 'Expirado'
  }
}
