import { BaseApi } from '../../shared/infrastructure/base-api.js'

class IncidentManagementApi extends BaseApi {
  constructor() {
    super()
  }

  getAllIncidents() {
    return this.http.get('/incidents')
  }

  getIncidentById(id) {
    return this.http.get(`/incidents/${id}`)
  }

  getIncidentsByType(incidentType) {
    return this.http.get(`/incidents/type/${incidentType}`)
  }

  detectFatigue(operatorId, assetId) {
    return this.http.post('/incidents/fatigue', { operatorId, assetId })
  }

  detectSmoke(assetId) {
    return this.http.post('/incidents/smoke', { assetId })
  }

  commitAccident(operatorId, description) {
    return this.http.post('/incidents/accidents', { operatorId, description })
  }

  escalateRiskLevel(incidentId, newRiskLevel) {
    return this.http.put(`/incidents/${incidentId}/escalate`, { newRiskLevel })
  }

  evaluateSafetyRisk(incidentId) {
    return this.http.put(`/incidents/${incidentId}/evaluate`)
  }

  sendRiskAlert(incidentId) {
    return this.http.put(`/incidents/${incidentId}/alert`)
  }
}

export const incidentManagementApi = new IncidentManagementApi()
