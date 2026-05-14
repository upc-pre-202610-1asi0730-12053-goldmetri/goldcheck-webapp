import { BaseEntity } from '../../../shared/domain/model/base-entity.js'

export class JewelryItem extends BaseEntity {
  constructor({
    id = null, sku = '', name = '', type = '', materialOrigin = '',
    weight = 0, purity = '', batchRef = '', status = 'Pendiente',
    certificationId = null, price = 0, imageUrl = '', createdAt = null
  } = {}) {
    super({ id })
    this.sku            = sku
    this.name           = name
    this.type           = type           // 'Anillo' | 'Collar' | 'Pulsera' | 'Arete'
    this.materialOrigin = materialOrigin // linked mineral batch code
    this.weight         = weight         // grams
    this.purity         = purity         // '18K' | '24K' | '750'
    this.batchRef       = batchRef
    this.status         = status         // 'Pendiente' | 'Validado' | 'Certificado' | 'Vendido'
    this.certificationId = certificationId
    this.price          = price
    this.imageUrl       = imageUrl
    this.createdAt      = createdAt || new Date().toISOString()
  }
}
