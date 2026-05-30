import { JewelryItem } from '../domain/model/jewelry-item.entity.js'
import { JewelryCertificate } from '../domain/model/jewelry-certificate.entity.js'

/**
 * Maps jewelry item and certificate resources into domain entities.
 *
 * @class JewelryItemAssembler
 */
export class JewelryItemAssembler {
  /**
   * @param {Object} resource - JewelryItem resource payload.
   * @returns {JewelryItem} JewelryItem entity.
   */
  static toEntityFromResource(resource) {
    return new JewelryItem({
      id: resource.id, sku: resource.sku, name: resource.name, type: resource.type,
      materialOrigin: resource.materialOrigin, weight: resource.weight,
      purity: resource.purity, batchRef: resource.batchRef, status: resource.status,
      certificationId: resource.certificationId, price: resource.price,
      imageUrl: resource.imageUrl, createdAt: resource.createdAt
    })
  }

  /**
   * Parses jewelry item resources from a response and maps them into entities.
   *
   * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with item resources.
   * @returns {JewelryItem[]} JewelryItem entities.
   */
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['items']
    return resources.map(resource => this.toEntityFromResource(resource))
  }

  /**
   * @param {Object} resource - JewelryCertificate resource payload.
   * @returns {JewelryCertificate} JewelryCertificate entity.
   */
  static toCertificateFromResource(resource) {
    return new JewelryCertificate({
      id: resource.id, itemId: resource.itemId, itemSku: resource.itemSku,
      issuerName: resource.issuerName, issueDate: resource.issueDate,
      expiryDate: resource.expiryDate, purity: resource.purity,
      weight: resource.weight, qrCode: resource.qrCode, status: resource.status
    })
  }

  /**
   * Parses certificate resources from a response and maps them into entities.
   *
   * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with certificate resources.
   * @returns {JewelryCertificate[]} JewelryCertificate entities.
   */
  static toCertificatesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['certificates']
    return resources.map(resource => this.toCertificateFromResource(resource))
  }

  /**
   * Converts a JewelryItem entity into an API resource payload.
   *
   * @param {JewelryItem} item - JewelryItem entity.
   * @returns {Object} Resource payload.
   */
  static toResourceFromEntity(item) {
    return {
      sku: item.sku, name: item.name, type: item.type,
      materialOrigin: item.materialOrigin, weight: item.weight,
      purity: item.purity, batchRef: item.batchRef, status: item.status,
      certificationId: item.certificationId, price: item.price,
      imageUrl: item.imageUrl
    }
  }
}
