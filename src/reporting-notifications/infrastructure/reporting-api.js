import { MockBaseApi } from '../../shared/infrastructure/mock-base-api.js'

class ReportingApi extends MockBaseApi {
  constructor() { super() }

  getMineralBatches() {
    return this.http.get('/mineralBatches')
  }

  getAnomalyAlerts() {
    return this.http.get('/anomalyAlerts')
  }

  getJewelryItems() {
    return this.http.get('/jewelryItems')
  }

  addAlert(data) {
    return this.http.post('/anomalyAlerts', {
      ...data,
      status: 'Abierto',
      reportedAt: new Date().toISOString()
    })
  }
}

export const reportingApi = new ReportingApi()
