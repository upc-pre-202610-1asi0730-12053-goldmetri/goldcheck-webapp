import { BaseApi } from '../../shared/infrastructure/base-api.js'

class ConsumerApi extends BaseApi {
  constructor() { super() }

  scanProductQR(qrCode, consumerId) {
    return this.http.post('/consumer/scan', { QRCode: qrCode, ConsumerId: consumerId })
  }

  getProductByQR(qrCode) {
    return this.http.get(`/consumer/products/${encodeURIComponent(qrCode)}`)
  }

  getJourney(qrCode) {
    return this.http.get(`/consumer/products/${encodeURIComponent(qrCode)}/journey`)
  }

  // US34/US35 – composed life sheet: origin mine, mineral type, purity and seller authorization.
  getTraceabilitySheet(qrCode) {
    return this.http.get(`/consumer/products/${encodeURIComponent(qrCode)}/traceability-sheet`)
  }

  // US36 – report a suspicious QR code (rate-limited per device on the backend).
  reportIrregularity(qrCode, deviceId, reason, consumerId) {
    return this.http.post('/consumer/reports', { QRCode: qrCode, DeviceId: deviceId, Reason: reason, ConsumerId: consumerId })
  }

  getCertificateById(certificateId) {
    return this.http.get(`/consumer/certificates/${certificateId}`)
  }
}

export const consumerApi = new ConsumerApi()
