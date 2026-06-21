import { AnomalyAlert } from '../domain/model/anomaly-alert.entity.js'

const RISK_TO_SEVERITY = {
  Critical: 'CRITICAL',
  High:     'HIGH',
  Medium:   'MEDIUM',
  Low:      'LOW'
}

export class AnomalyAlertAssembler {
  static toEntityFromResource(resource) {
    return new AnomalyAlert({
      id:          resource.id,
      batchCode:   resource.assetId ? `Asset ${resource.assetId}` : '',
      vehicleId:   resource.assetId || resource.vehicleId,
      alertType:   resource.incidentType || resource.alertType || 'TELEMETRY',
      severity:    RISK_TO_SEVERITY[resource.riskLevel] || resource.severity || 'LOW',
      description: resource.description || '',
      status:      resource.status === 'Closed' ? 'Resuelta' : 'Activa',
      detectedAt:  resource.detectedAt || null
    })
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) return []
    const resources = Array.isArray(response.data) ? response.data : []
    return resources.map(r => this.toEntityFromResource(r))
  }

  static toResourceFromEntity(alert) {
    return {
      assetId:     alert.vehicleId,
      alertType:   alert.alertType,
      severity:    alert.severity,
      description: alert.description,
      status:      alert.status
    }
  }
}
