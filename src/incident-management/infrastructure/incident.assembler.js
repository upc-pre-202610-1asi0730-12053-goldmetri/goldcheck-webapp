import { Incident } from '../domain/model/incident.entity.js'

export class IncidentAssembler {
  static toEntity(r) {
    return new Incident({
      id: r.id, title: r.title, description: r.description,
      incidentType: r.incidentType, severity: r.severity || 'LOW',
      batchId: r.batchId, vehicleId: r.vehicleId,
      reportedBy: r.reportedBy, status: r.status || 'Abierto',
      reportedAt: r.reportedAt || r.createdAt, resolvedAt: r.resolvedAt
    })
  }

  static toEntities(response) {
    return (response.data || []).map(r => this.toEntity(r))
  }

  static toResource(incident) {
    return {
      title: incident.title, description: incident.description,
      incidentType: incident.incidentType, severity: incident.severity,
      batchId: incident.batchId, vehicleId: incident.vehicleId,
      status: incident.status, reportedBy: incident.reportedBy
    }
  }
}
