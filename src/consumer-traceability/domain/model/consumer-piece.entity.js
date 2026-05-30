import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

/**
 * ConsumerPiece entity within the Consumer Traceability bounded context.
 * Represents a jewelry piece linked to a consumer's ownership record.
 *
 * @class ConsumerPiece
 * @extends BaseEntity
 */
export class ConsumerPiece extends BaseEntity {
  /**
   * @type {?number}
   * @private
   */
  #ownerId;
  /**
   * @type {string}
   * @private
   */
  #sku;
  /**
   * @type {string}
   * @private
   */
  #name;
  /**
   * @type {string}
   * @private
   */
  #type;
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
   * @type {?number}
   * @private
   */
  #certificationId;
  /**
   * @type {string}
   * @private
   */
  #purchaseDate;
  /**
   * @type {string}
   * @private
   */
  #status;
  /**
   * @type {string}
   * @private
   */
  #imageUrl;
  /**
   * @type {string}
   * @private
   */
  #traceabilityCode;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - Piece identifier.
   * @param {?number} [params.ownerId=null] - Foreign key of the consumer owner.
   * @param {string} [params.sku=''] - Stock-keeping unit code of the linked jewelry item.
   * @param {string} [params.name=''] - Piece display name.
   * @param {string} [params.type=''] - Jewelry type ('Ring' | 'Necklace' | 'Bracelet' | 'Earring').
   * @param {string} [params.purity=''] - Gold purity ('18K' | '24K' | '750').
   * @param {number} [params.weight=0] - Weight in grams.
   * @param {?number} [params.certificationId=null] - Foreign key of the linked certificate.
   * @param {?string} [params.purchaseDate=null] - ISO purchase timestamp.
   * @param {string} [params.status='Activo'] - Ownership status.
   * @param {string} [params.imageUrl=''] - URL of the piece image.
   * @param {string} [params.traceabilityCode=''] - QR or traceability scan code.
   */
  constructor({
    id = null, ownerId = null, sku = '', name = '', type = '',
    purity = '', weight = 0, certificationId = null,
    purchaseDate = null, status = 'Activo', imageUrl = '',
    traceabilityCode = ''
  } = {}) {
    super({ id });
    this.#ownerId          = ownerId;
    this.#sku              = sku;
    this.#name             = name;
    this.#type             = type;
    this.#purity           = purity;
    this.#weight           = weight;
    this.#certificationId  = certificationId;
    this.#purchaseDate     = purchaseDate || new Date().toISOString();
    this.#status           = status;
    this.#imageUrl         = imageUrl;
    this.#traceabilityCode = traceabilityCode
  }

  /** @returns {?number} */ get ownerId()          { return this.#ownerId; }
  /** @returns {string}  */ get sku()              { return this.#sku; }
  /** @returns {string}  */ get name()             { return this.#name; }
  /** @returns {string}  */ get type()             { return this.#type; }
  /** @returns {string}  */ get purity()           { return this.#purity; }
  /** @returns {number}  */ get weight()           { return this.#weight; }
  /** @returns {?number} */ get certificationId()  { return this.#certificationId; }
  /** @returns {string}  */ get purchaseDate()     { return this.#purchaseDate; }
  /** @returns {string}  */ get status()           { return this.#status; }
  /** @returns {string}  */ get imageUrl()         { return this.#imageUrl; }
  /** @returns {string}  */ get traceabilityCode() { return this.#traceabilityCode; }

  /**
   * Creates a new ConsumerPiece with the given property overrides.
   * @param {Object} [changes={}]
   * @returns {ConsumerPiece}
   */
  clone(changes = {}) {
    return new ConsumerPiece({
      id: this.id, ownerId: this.#ownerId, sku: this.#sku, name: this.#name,
      type: this.#type, purity: this.#purity, weight: this.#weight,
      certificationId: this.#certificationId, purchaseDate: this.#purchaseDate,
      status: this.#status, imageUrl: this.#imageUrl, traceabilityCode: this.#traceabilityCode,
      ...changes
    });
  }
}
