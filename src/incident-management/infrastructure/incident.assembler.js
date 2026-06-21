import { Incident } from '../domain/model/incident.entity.js'

const RISK_TO_SEVERITY = {
  Critical: 'critical',
  High:     'critical',
  Medium:   'warning',
  Low:      'low'
}

export class IncidentAssembler {
  static toEntityFromResource(resource) {
    return new Incident({
      id:           resource.id,
      title:        resource.incidentType,
      incidentType: resource.incidentType,
      description:  resource.description || '',
      severity:     RISK_TO_SEVERITY[resource.riskLevel] || 'low',
      vehicleId:    resource.assetId,
      reportedBy:   resource.operatorId,
      status:       resource.status,
      reportedAt:   null
    })
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) return []
    const resources = Array.isArray(response.data) ? response.data : []
    return resources.map(r => this.toEntityFromResource(r))
  }

  static toResourceFromEntity(incident) {
    return {
      operatorId:   incident.reportedBy,
      assetId:      incident.vehicleId,
      description:  incident.description,
      incidentType: incident.incidentType
    }
  }
}
