import { ConsumerPiece } from '../domain/model/consumer-piece.entity.js'

export class ConsumerPieceAssembler {
  static toEntity(r) {
    return new ConsumerPiece({
      id: r.id, ownerId: r.ownerId, sku: r.sku, name: r.name,
      type: r.type, purity: r.purity, weight: r.weight,
      certificationId: r.certificationId, purchaseDate: r.purchaseDate,
      status: r.status, imageUrl: r.imageUrl, traceabilityCode: r.traceabilityCode
    })
  }

  static toEntities(response) {
    return (response.data || []).map(r => this.toEntity(r))
  }
}
