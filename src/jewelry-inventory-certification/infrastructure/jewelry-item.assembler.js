import { JewelryItem } from '../domain/model/jewelry-item.entity.js'
import { JewelryCertificate } from '../domain/model/jewelry-certificate.entity.js'

const STATUS_MAP = {
  NonCertifiedMaterialRegistered: 'Pendiente',
  QRScanned:                      'Validado',
  RegisteredInInventory:          'Validado',
  CertificateGenerated:           'Certificado'
}

export class JewelryItemAssembler {
  static toEntityFromResource(resource) {
    return new JewelryItem({
      id:              resource.id,
      sku:             resource.materialId,
      name:            resource.materialId,
      type:            'Jewelry',
      materialOrigin:  resource.jewelerId,
      batchRef:        resource.materialId,
      status:          STATUS_MAP[resource.status] || resource.status || 'Pendiente',
      certificationId: resource.certificateId || null,
      weight:          0,
      purity:          0,
      price:           0,
      imageUrl:        null,
      createdAt:       null
    })
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) return []
    const resources = Array.isArray(response.data) ? response.data : []
    return resources.map(r => this.toEntityFromResource(r))
  }

  static toCertificateFromResource(resource) {
    return new JewelryCertificate({
      id:         resource.id,
      itemId:     resource.materialId,
      itemSku:    resource.materialId,
      issuerName: 'GoldMetrics Cert Authority',
      issueDate:  null,
      expiryDate: null,
      purity:     0,
      weight:     0,
      qrCode:     resource.certificateId,
      status:     resource.isSigned ? 'Activo' : 'Pendiente'
    })
  }

  static toCertificatesFromResponse(response) {
    if (response.status !== 200) return []
    const resources = Array.isArray(response.data) ? response.data : []
    return resources.map(r => this.toCertificateFromResource(r))
  }

  static toResourceFromEntity(item) {
    return {
      materialId: item.sku,
      jewelerId:  item.materialOrigin
    }
  }
}
