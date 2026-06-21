import { ConsumerPiece } from '../domain/model/consumer-piece.entity.js'

export class ConsumerPieceAssembler {
  static toEntityFromResource(resource) {
    return new ConsumerPiece({
      id:               resource.id,
      ownerId:          resource.consumerId || null,
      sku:              resource.materialId || resource.id,
      name:             resource.materialId || resource.id,
      type:             'Jewelry',
      purity:           0,
      weight:           0,
      certificationId:  resource.certificateId || null,
      purchaseDate:     null,
      status:           resource.status || 'Activo',
      imageUrl:         null,
      traceabilityCode: resource.qrCode || null
    })
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) return []
    const data = response.data
    const resources = Array.isArray(data) ? data : (data ? [data] : [])
    return resources.map(r => this.toEntityFromResource(r))
  }
}
