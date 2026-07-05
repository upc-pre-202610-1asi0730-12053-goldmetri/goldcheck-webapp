import { BaseApi } from '../../shared/infrastructure/base-api.js'

class AnalyticsApi extends BaseApi {
  constructor() {
    super()
  }

  // Route progress — used as mineral batch analytics
  getAllRoutes() {
    return this.http.get('/analytics/routes')
  }

  viewRouteProgress(routeId, userId) {
    return this.http.post('/analytics/routes', { routeId, userId })
  }

  getRouteById(routeId) {
    return this.http.get(`/analytics/routes/${routeId}`)
  }

  // Production dashboard
  viewProductionDashboard(supervisorId) {
    return this.http.post('/analytics/production/dashboard', { supervisorId })
  }

  requestProductionData(supervisorId, start, end) {
    return this.http.post('/analytics/production', { supervisorId, start, end })
  }

  getProductionByPeriod(start, end) {
    return this.http.get('/analytics/production', { params: { start, end } })
  }

  // Supporting data from other BCs
  getAllMachinery() {
    return this.http.get('/machinery')
  }

  getAllJewelryMaterials() {
    return this.http.get('/jewelry-materials')
  }

  // US38 – monthly mining shrinkage (merma) report.
  getMiningShrinkage(year, month) {
    return this.http.get('/analytics/mining/shrinkage', { params: { year, month } })
  }

  // US39 – jewelry validated-gold volume (optionally filtered by supplier origin).
  getValidatedVolume(jewelerId, supplierId) {
    return this.http.get('/analytics/jewelry/validated-volume', { params: { jewelerId, supplierId: supplierId || undefined } })
  }

  // US40 – export mining batch history (CSV blob, or 202 for large deferred exports).
  exportBatchHistory(email) {
    return this.http.get('/analytics/mining/batch-history/export', {
      params: { email: email || undefined },
      responseType: 'blob'
    })
  }
}

export const analyticsApi = new AnalyticsApi()
