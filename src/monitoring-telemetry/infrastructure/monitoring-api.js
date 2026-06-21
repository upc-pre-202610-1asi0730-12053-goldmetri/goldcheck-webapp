import { BaseApi } from '../../shared/infrastructure/base-api.js'

class MonitoringApi extends BaseApi {
  constructor() {
    super()
  }

  // Safety incidents used as monitoring alerts
  getAllIncidents() {
    return this.http.get('/incidents')
  }

  // Active hauling cycles used as "batches in transit"
  getActiveCycles() {
    return this.http.get('/hauling-cycles')
  }

  // Process raw telemetry from an asset
  processTelemetry(assetId, rawData) {
    return this.http.post('/monitoring/telemetry/process', { assetId, rawData })
  }

  // Validate a telemetry record (marks it as resolved)
  validateTelemetry(assetId, telemetryDataId) {
    return this.http.post('/monitoring/telemetry/validate', { assetId, telemetryDataId })
  }

  // Get all telemetry records for an asset
  getTelemetryByAsset(assetId) {
    return this.http.get(`/monitoring/telemetry/${assetId}`)
  }
}

export const monitoringApi = new MonitoringApi()
