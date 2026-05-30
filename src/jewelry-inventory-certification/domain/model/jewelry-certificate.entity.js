import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

/**
 * JewelryCertificate entity within the Jewelry Inventory & Certification bounded context.
 *
 * @class JewelryCertificate
 * @extends BaseEntity
 */
export class JewelryCertificate extends BaseEntity {
  /**
   * @type {?number}
   * @private
   */
  #itemId;
  /**
   * @type {string}
   * @private
   */
  #itemSku;
  /**
   * @type {string}
   * @private
   */
  #issuerName;
  /**
   * @type {string}
   * @private
   */
  #issueDate;
  /**
   * @type {?string}
   * @private
   */
  #expiryDate;
  /**
   * @type {string}
   * @private
   */
  #purity;
  /**
   * @type {number}
   * @private
   */
  #weight;
  /**
   * @type {string}
   * @private
   */
  #qrCode;
  /**
   * @type {string}
   * @private
   */
  #status;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - Certificate identifier.
   * @param {?number} [params.itemId=null] - Foreign key of the certified jewelry item.
   * @param {string} [params.itemSku=''] - SKU of the certified item.
   * @param {string} [params.issuerName=''] - Name of the issuing authority.
   * @param {?string} [params.issueDate=null] - ISO timestamp when the certificate was issued.
   * @param {?string} [params.expiryDate=null] - ISO timestamp when the certificate expires.
   * @param {string} [params.purity=''] - Certified gold purity.
   * @param {number} [params.weight=0] - Certified weight in grams.
   * @param {string} [params.qrCode=''] - QR code string for consumer traceability.
   * @param {string} [params.status='Activo'] - Certificate status ('Active' | 'Revoked' | 'Expired').
   */
  constructor({
    id = null, itemId = null, itemSku = '', issuerName = '', issueDate = null,
    expiryDate = null, purity = '', weight = 0, qrCode = '', status = 'Activo'
  } = {}) {
    super({ id });
    this.#itemId     = itemId;
    this.#itemSku    = itemSku;
    this.#issuerName = issuerName;
    this.#issueDate  = issueDate || new Date().toISOString();
    this.#expiryDate = expiryDate;
    this.#purity     = purity;
    this.#weight     = weight;
    this.#qrCode     = qrCode;
    this.#status     = status
  }

  /** @returns {?number} */ get itemId()     { return this.#itemId; }
  /** @returns {string}  */ get itemSku()    { return this.#itemSku; }
  /** @returns {string}  */ get issuerName() { return this.#issuerName; }
  /** @returns {string}  */ get issueDate()  { return this.#issueDate; }
  /** @returns {?string} */ get expiryDate() { return this.#expiryDate; }
  /** @returns {string}  */ get purity()     { return this.#purity; }
  /** @returns {number}  */ get weight()     { return this.#weight; }
  /** @returns {string}  */ get qrCode()     { return this.#qrCode; }
  /** @returns {string}  */ get status()     { return this.#status; }

  /**
   * Creates a new JewelryCertificate with the given property overrides.
   * @param {Object} [changes={}]
   * @returns {JewelryCertificate}
   */
  clone(changes = {}) {
    return new JewelryCertificate({
      id: this.id, itemId: this.#itemId, itemSku: this.#itemSku,
      issuerName: this.#issuerName, issueDate: this.#issueDate,
      expiryDate: this.#expiryDate, purity: this.#purity,
      weight: this.#weight, qrCode: this.#qrCode, status: this.#status,
      ...changes
    });
  }
}
