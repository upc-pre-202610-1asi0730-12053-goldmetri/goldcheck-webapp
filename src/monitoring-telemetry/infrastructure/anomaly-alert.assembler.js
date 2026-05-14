import { AnomalyAlert } from '../domain/model/anomaly-alert.entity.js'

export class AnomalyAlertAssembler {
  static toEntity(r) {
    return new AnomalyAlert({
      id: r.id, batchId: r.batchId,
      batchCode: r.batchCode || (r.batchId ? `Lote #${r.batchId}` : ''),
      vehicleId: r.vehicleId, alertType: r.alertType || r.type,
      severity: r.severity || 'LOW', description: r.description,
      coordinates: r.coordinates, status: r.status || 'Activa',
      detectedAt: r.detectedAt || r.createdAt, resolvedAt: r.resolvedAt
    })
  }

  static toEntities(response) {
    return (response.data || []).map(r => this.toEntity(r))
  }

  static toResource(alert) {
    return {
      batchId: alert.batchId, batchCode: alert.batchCode,
      vehicleId: alert.vehicleId, alertType: alert.alertType,
      severity: alert.severity, description: alert.description,
      coordinates: alert.coordinates, status: alert.status
    }
  }
}
