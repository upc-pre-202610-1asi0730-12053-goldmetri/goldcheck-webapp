import { MaterialReception } from '../domain/model/material-reception.entity.js'

/**
 * Maps material reception resources into domain entities.
 *
 * @class MaterialReceptionAssembler
 */
export class MaterialReceptionAssembler {
  /**
   * @param {Object} resource - MaterialReception resource payload.
   * @returns {MaterialReception} MaterialReception entity.
   */
  static toEntityFromResource(resource) {
    return new MaterialReception({
      id: resource.id, batchId: resource.batchId || resource.id, batchCode: resource.batchCode || '',
      receivedWeight: resource.finalWeight || 0,
      initialWeight: resource.initialWeight || 0,
      shrinkagePercent: resource.shrinkagePercent || 0,
      mineralType: resource.mineralType, purityKarats: resource.purityKarats,
      status: resource.status, operatorId: resource.operatorId,
      receivedAt: resource.createdAt
    })
  }

  /**
   * Parses material reception resources from a response and maps them into entities.
   *
   * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with material reception resources.
   * @returns {MaterialReception[]} MaterialReception entities.
   */
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['receptions']
    return resources.map(resource => this.toEntityFromResource(resource))
  }

  /**
   * Converts a MaterialReception entity into an API resource payload.
   *
   * @param {MaterialReception} entity - MaterialReception entity.
   * @returns {Object} Resource payload.
   */
  static toResourceFromEntity(entity) {
    return {
      batchId: entity.batchId, batchCode: entity.batchCode,
      finalWeight: entity.receivedWeight,
      shrinkagePercent: entity.shrinkagePercent,
      mineralType: entity.mineralType, purityKarats: entity.purityKarats,
      status: entity.status
    }
  }
}
