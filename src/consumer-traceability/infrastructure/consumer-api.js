import { BaseApi } from '../../shared/infrastructure/base-api.js'

class ConsumerApi extends BaseApi {
  constructor() {
    super()
  }

  scanProductQR(productId, qrCode) {
    return this.http.post('/consumer/scan', { productId, qrCode })
  }

  getProductByQR(qrCode) {
    return this.http.get(`/consumer/products/${encodeURIComponent(qrCode)}`)
  }

  getTraceabilityJourney(qrCode) {
    return this.http.get(`/consumer/products/${encodeURIComponent(qrCode)}/journey`)
  }

  getCertificateById(certificateId) {
    return this.http.get(`/consumer/certificates/${encodeURIComponent(certificateId)}`)
  }

  downloadCertificate(certificateId, consumerId) {
    return this.http.post(`/consumer/certificates/${encodeURIComponent(certificateId)}/download`, { consumerId })
  }
}

export const consumerApi = new ConsumerApi()
