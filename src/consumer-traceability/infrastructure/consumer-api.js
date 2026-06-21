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

  getCertificateById(certificateId) {
    return this.http.get(`/consumer/certificates/${certificateId}`)
  }
}

export const consumerApi = new ConsumerApi()
