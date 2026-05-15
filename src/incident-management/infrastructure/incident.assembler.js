import { Incident } from '../domain/model/incident.entity.js'

/**
 * Maps incident resources into domain entities.
 *
 * @class IncidentAssembler
 */
export class IncidentAssembler {
  /**
   * @param {Object} resource - Incident resource payload.
   * @returns {Incident} Incident entity.
   */
  static toEntityFromResource(resource) {
    return new Incident({
      id: resource.id, title: resource.title, description: resource.description,
      incidentType: resource.incidentType, severity: resource.severity || 'LOW',
      batchId: resource.batchId, vehicleId: resource.vehicleId,
      reportedBy: resource.reportedBy, status: resource.status || 'Abierto',
      reportedAt: resource.reportedAt || resource.createdAt, resolvedAt: resource.resolvedAt
    })
  }

  /**
   * Parses incident resources from a response and maps them into entities.
   *
   * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with incident resources.
   * @returns {Incident[]} Incident entities.
   */
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['incidents']
    return resources.map(resource => this.toEntityFromResource(resource))
  }

  /**
   * Converts an Incident entity into an API resource payload.
   *
   * @param {Incident} incident - Incident entity.
   * @returns {Object} Resource payload.
   */
  static toResourceFromEntity(incident) {
    return {
      title: incident.title, description: incident.description,
      incidentType: incident.incidentType, severity: incident.severity,
      batchId: incident.batchId, vehicleId: incident.vehicleId,
      status: incident.status, reportedBy: incident.reportedBy
    }
  }
}
