import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class IncidentManagementApi extends BaseApi {
  #anomalyAlerts

  constructor() {
    super()
    // Incidents reuse anomalyAlerts collection until a dedicated endpoint is added
    this.#anomalyAlerts = new BaseEndpoint(this.http, '/anomalyAlerts')
  }

  getIncidents(params) { return this.#anomalyAlerts.getAll(params) }
  getIncidentById(id)  { return this.#anomalyAlerts.getById(id) }
  createIncident(data) { return this.#anomalyAlerts.create(data) }
  updateIncident(id, data) { return this.#anomalyAlerts.patch(id, data) }
  closeIncident(id)    { return this.#anomalyAlerts.patch(id, { status: 'Cerrado' }) }
}

export const incidentManagementApi = new IncidentManagementApi()
