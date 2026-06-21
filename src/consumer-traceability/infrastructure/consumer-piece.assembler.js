import { ConsumerPiece } from '../domain/model/consumer-piece.entity.js'

export class ConsumerPieceAssembler {
  static toEntityFromResource(resource) {
    return new ConsumerPiece({
      id:               resource.id,
      ownerId:          resource.ownerId,
      sku:              resource.sku || resource.traceabilityCode || '',
      name:             resource.name || resource.sku || '—',
      type:             resource.type || 'Joya',
      purity:           resource.purity || '',
      weight:           resource.weight || 0,
      certificationId:  resource.certificationId || null,
      purchaseDate:     resource.purchaseDate || null,
      status:           resource.status || 'Activo',
      imageUrl:         resource.imageUrl || '',
      traceabilityCode: resource.traceabilityCode || ''
    })
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) return []
    const data = response.data
    const resources = Array.isArray(data) ? data : (data ? [data] : [])
    return resources.map(r => this.toEntityFromResource(r))
  }
}
