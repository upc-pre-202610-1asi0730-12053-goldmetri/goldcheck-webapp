import { AnomalyAlert } from '../domain/model/anomaly-alert.entity.js'

const RISK_TO_SEVERITY = {
  Critical: 'CRITICAL',
  High:     'HIGH',
  Medium:   'MEDIUM',
  Low:      'LOW'
}

export class AnomalyAlertAssembler {
  static toEntityFromResource(resource) {
    const assetId      = resource.assetId      ?? resource.AssetId      ?? ''
    const incidentType = resource.incidentType ?? resource.IncidentType ?? ''
    const riskLevel    = resource.riskLevel    ?? resource.RiskLevel    ?? ''
    const description  = resource.description  ?? resource.Description  ?? ''
    const status       = resource.status       ?? resource.Status       ?? ''
    const operatorId   = resource.operatorId   ?? resource.OperatorId   ?? null
    return new AnomalyAlert({
      id:          resource.id ?? resource.Id,
      batchCode:   assetId ? `Asset ${assetId}` : '',
      vehicleId:   assetId || resource.vehicleId || resource.VehicleId,
      alertType:   incidentType || resource.alertType || 'TELEMETRY',
      severity:    RISK_TO_SEVERITY[riskLevel] || resource.severity || 'LOW',
      description,
      status:      status === 'Closed' ? 'Resuelta' : 'Activa',
      detectedAt:  resource.detectedAt ?? resource.DetectedAt ?? null,
      operatorId,
      reportedBy:  operatorId
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
