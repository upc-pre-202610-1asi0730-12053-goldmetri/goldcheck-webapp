import { BaseApi } from '../../shared/infrastructure/base-api.js'

class MonitoringApi extends BaseApi {
  constructor() { super() }

  getAllIncidents()    { return this.http.get('/incidents') }
  getActiveCycles()   { return this.http.get('/hauling-cycles') }

  processTelemetry(assetId, rawData)           { return this.http.post('/monitoring/telemetry/process', { assetId, rawData }) }
  validateTelemetry(assetId, telemetryDataId)  { return this.http.post('/monitoring/telemetry/validate', { assetId, telemetryDataId }) }
  getTelemetryByAsset(assetId)                 { return this.http.get(`/monitoring/telemetry/${assetId}`) }

  monitorTemperature(assetId)   { return this.http.post('/monitoring/temperature/monitor', { assetId }) }
  getTemperature(assetId)       { return this.http.get(`/monitoring/temperature/${assetId}`) }

  monitorSpeed(assetId)         { return this.http.post('/monitoring/speed/monitor', { assetId }) }
  getSpeed(assetId)             { return this.http.get(`/monitoring/speed/${assetId}`) }
  detectSpeedExcess(assetId, speedKmPerHour, speedLimitKmPerHour) {
    return this.http.post(`/monitoring/speed/${assetId}/detect-excess`, { speedKmPerHour, speedLimitKmPerHour })
  }

  monitorPressure(assetId)      { return this.http.post('/monitoring/pressure/monitor', { assetId }) }
  getPressure(assetId)          { return this.http.get(`/monitoring/pressure/${assetId}`) }

  monitorGNSS(assetId)          { return this.http.post('/monitoring/gnss/monitor', { assetId }) }
  getGNSS(assetId)              { return this.http.get(`/monitoring/gnss/${assetId}`) }

  // US18 – Checkpoints
  registerCheckpoint(payload)    { return this.http.post('/monitoring/checkpoints', payload) }
  syncCheckpoints(checkpoints)   { return this.http.post('/monitoring/checkpoints/sync', { Checkpoints: checkpoints }) }
  getCheckpoints(batchId)        { return this.http.get(`/monitoring/checkpoints/${batchId}`) }

  // US19 – Route alerts (delay / deviation)
  evaluateRoute(payload)         { return this.http.post('/monitoring/route-alerts/evaluate', payload) }
  getRouteAlerts(batchId)        { return this.http.get(`/monitoring/route-alerts/${batchId}`) }
}

export const monitoringApi = new MonitoringApi()
