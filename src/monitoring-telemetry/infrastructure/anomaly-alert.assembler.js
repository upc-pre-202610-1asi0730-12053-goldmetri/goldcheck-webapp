import { AnomalyAlert } from '../domain/model/anomaly-alert.entity.js'

/**
 * Maps anomaly alert resources into domain entities.
 *
 * @class AnomalyAlertAssembler
 */
export class AnomalyAlertAssembler {
  /**
   * @param {Object} resource - AnomalyAlert resource payload.
   * @returns {AnomalyAlert} AnomalyAlert entity.
   */
  static toEntityFromResource(resource) {
    return new AnomalyAlert({
      id: resource.id, batchId: resource.batchId,
      batchCode: resource.batchCode || (resource.batchId ? `Lote #${resource.batchId}` : ''),
      vehicleId: resource.vehicleId, alertType: resource.alertType || resource.type,
      severity: resource.severity || 'LOW', description: resource.description || resource.message || '',
      coordinates: resource.coordinates, status: resource.status || 'Activa',
      detectedAt: resource.detectedAt || resource.createdAt, resolvedAt: resource.resolvedAt
    })
  }

  /**
   * Parses anomaly alert resources from a response and maps them into entities.
   *
   * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with anomaly alert resources.
   * @returns {AnomalyAlert[]} AnomalyAlert entities.
   */
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['alerts']
    return resources.map(resource => this.toEntityFromResource(resource))
  }

  /**
   * Converts an AnomalyAlert entity into an API resource payload.
   *
   * @param {AnomalyAlert} alert - AnomalyAlert entity.
   * @returns {Object} Resource payload.
   */
  static toResourceFromEntity(alert) {
    return {
      batchId: alert.batchId, batchCode: alert.batchCode,
      vehicleId: alert.vehicleId, alertType: alert.alertType,
      severity: alert.severity, description: alert.description,
      coordinates: alert.coordinates, status: alert.status
    }
  }
}
