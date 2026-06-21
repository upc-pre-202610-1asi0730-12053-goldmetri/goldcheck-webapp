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
    return this.http.post('/analytics/routes/view', { routeId, userId })
  }

  getRouteById(routeId) {
    return this.http.get(`/analytics/routes/${routeId}`)
  }

  // Production dashboard
  viewProductionDashboard(supervisorId) {
    return this.http.post('/analytics/production/dashboard', { supervisorId })
  }

  requestProductionData(supervisorId, start, end) {
    return this.http.post('/analytics/production/request', { supervisorId, start, end })
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
}

export const analyticsApi = new AnalyticsApi()
