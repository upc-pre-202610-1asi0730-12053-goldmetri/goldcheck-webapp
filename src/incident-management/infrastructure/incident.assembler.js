import { Incident } from '../domain/model/incident.entity.js'

const RISK_TO_SEVERITY = {
  Critical: 'critical',
  High:     'critical',
  Medium:   'warning',
  Low:      'low'
}

export class IncidentAssembler {
  static toEntityFromResource(resource) {
    const incidentType = resource.incidentType ?? resource.IncidentType ?? ''
    const riskLevel    = resource.riskLevel    ?? resource.RiskLevel    ?? ''
    return new Incident({
      id:           resource.id          ?? resource.Id,
      title:        incidentType,
      incidentType,
      description:  resource.description ?? resource.Description ?? '',
      severity:     RISK_TO_SEVERITY[riskLevel] || 'low',
      vehicleId:    resource.assetId     ?? resource.AssetId     ?? '',
      reportedBy:   resource.operatorId  ?? resource.OperatorId  ?? '',
      status:       resource.status      ?? resource.Status      ?? '',
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
