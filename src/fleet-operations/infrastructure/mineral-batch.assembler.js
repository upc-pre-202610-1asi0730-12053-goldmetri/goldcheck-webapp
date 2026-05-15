import { MineralBatch } from '../domain/model/mineral-batch.entity.js'

/**
 * Maps mineral batch resources into domain entities.
 *
 * @class MineralBatchAssembler
 */
export class MineralBatchAssembler {
  /**
   * @param {Object} resource - MineralBatch resource payload.
   * @returns {MineralBatch} MineralBatch entity.
   */
  static toEntityFromResource(resource) {
    return new MineralBatch({
      id: resource.id, batchCode: resource.batchCode, depositId: resource.depositId,
      depositName: resource.depositName, vehicleId: resource.vehicleId,
      vehicleName: resource.vehicleName, driverId: resource.driverId,
      initialWeight: resource.initialWeight, finalWeight: resource.finalWeight,
      mineralType: resource.mineralType, status: resource.status,
      destination: resource.destination, createdAt: resource.createdAt
    })
  }

  /**
   * Parses mineral batch resources from a response and maps them into entities.
   *
   * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with batch resources.
   * @returns {MineralBatch[]} MineralBatch entities.
   */
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['batches']
    return resources.map(resource => this.toEntityFromResource(resource))
  }

  /**
   * Converts a MineralBatch entity into an API resource payload.
   *
   * @param {MineralBatch} batch - MineralBatch entity.
   * @returns {Object} Resource payload.
   */
  static toResourceFromEntity(batch) {
    return {
      batchCode: batch.batchCode, depositId: batch.depositId,
      depositName: batch.depositName, vehicleId: batch.vehicleId,
      vehicleName: batch.vehicleName, initialWeight: batch.initialWeight,
      mineralType: batch.mineralType, status: batch.status,
      destination: batch.destination
    }
  }
}
