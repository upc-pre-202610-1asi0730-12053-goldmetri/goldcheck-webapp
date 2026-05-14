import { JewelryItem } from '../domain/model/jewelry-item.entity.js'
import { JewelryCertificate } from '../domain/model/jewelry-certificate.entity.js'

export class JewelryItemAssembler {
  static toEntity(r) {
    return new JewelryItem({
      id: r.id, sku: r.sku, name: r.name, type: r.type,
      materialOrigin: r.materialOrigin, weight: r.weight,
      purity: r.purity, batchRef: r.batchRef, status: r.status,
      certificationId: r.certificationId, price: r.price,
      imageUrl: r.imageUrl, createdAt: r.createdAt
    })
  }

  static toEntities(response) {
    return (response.data || []).map(r => this.toEntity(r))
  }

  static toCertificate(r) {
    return new JewelryCertificate({
      id: r.id, itemId: r.itemId, itemSku: r.itemSku,
      issuerName: r.issuerName, issueDate: r.issueDate,
      expiryDate: r.expiryDate, purity: r.purity,
      weight: r.weight, qrCode: r.qrCode, status: r.status
    })
  }

  static toCertificates(response) {
    return (response.data || []).map(r => this.toCertificate(r))
  }
}
