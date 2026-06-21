import { BaseApi } from '../../shared/infrastructure/base-api.js'

class ReportingApi extends BaseApi {
  constructor() {
    super()
  }

  getAllReports() {
    return this.http.get('/reports')
  }

  getReportById(reportId) {
    return this.http.get(`/reports/${reportId}`)
  }

  requestAccidentData(incidentId, supervisorId) {
    return this.http.post('/reports', { incidentId, supervisorId })
  }

  loadAccidentData(reportId) {
    return this.http.put(`/reports/${reportId}/load-data`)
  }

  generateReport(reportId) {
    return this.http.put(`/reports/${reportId}/generate`)
  }

  requestReportExportation(reportId, format) {
    return this.http.put(`/reports/${reportId}/request-export`, { format })
  }

  exportReport(reportId) {
    return this.http.put(`/reports/${reportId}/export`)
  }

  downloadReport(reportId, userId) {
    return this.http.get(`/reports/${reportId}/download`, { params: { userId } })
  }
}

export const reportingApi = new ReportingApi()
