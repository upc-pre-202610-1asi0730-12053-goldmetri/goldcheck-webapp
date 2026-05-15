import { ConsumerPiece } from '../domain/model/consumer-piece.entity.js'

/**
 * Maps consumer piece resources into domain entities.
 *
 * @class ConsumerPieceAssembler
 */
export class ConsumerPieceAssembler {
  /**
   * @param {Object} resource - ConsumerPiece resource payload.
   * @returns {ConsumerPiece} ConsumerPiece entity.
   */
  static toEntityFromResource(resource) {
    return new ConsumerPiece({
      id: resource.id, ownerId: resource.ownerId, sku: resource.sku, name: resource.name,
      type: resource.type, purity: resource.purity, weight: resource.weight,
      certificationId: resource.certificationId, purchaseDate: resource.purchaseDate,
      status: resource.status, imageUrl: resource.imageUrl, traceabilityCode: resource.traceabilityCode
    })
  }

  /**
   * Parses consumer piece resources from a response and maps them into entities.
   *
   * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with consumer piece resources.
   * @returns {ConsumerPiece[]} ConsumerPiece entities.
   */
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['pieces']
    return resources.map(resource => this.toEntityFromResource(resource))
  }
}
