import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

/**
 * JewelryItem entity within the Jewelry Inventory & Certification bounded context.
 *
 * @class JewelryItem
 * @extends BaseEntity
 */
export class JewelryItem extends BaseEntity {
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
  #materialOrigin;
  /**
   * @type {number}
   * @private
   */
  #weight;
  /**
   * @type {string}
   * @private
   */
  #purity;
  /**
   * @type {string}
   * @private
   */
  #batchRef;
  /**
   * @type {string}
   * @private
   */
  #status;
  /**
   * @type {?number}
   * @private
   */
  #certificationId;
  /**
   * @type {number}
   * @private
   */
  #price;
  /**
   * @type {string}
   * @private
   */
  #imageUrl;
  /**
   * @type {string}
   * @private
   */
  #createdAt;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - Item identifier.
   * @param {string} [params.sku=''] - Stock-keeping unit code.
   * @param {string} [params.name=''] - Item display name.
   * @param {string} [params.type=''] - Jewelry type ('Anillo' | 'Collar' | 'Pulsera' | 'Arete').
   * @param {string} [params.materialOrigin=''] - Linked mineral batch code.
   * @param {number} [params.weight=0] - Item weight in grams.
   * @param {string} [params.purity=''] - Gold purity ('18K' | '24K' | '750').
   * @param {string} [params.batchRef=''] - Reference to the source mineral batch.
   * @param {string} [params.status='Pendiente'] - Lifecycle status ('Pendiente' | 'Validado' | 'Certificado' | 'Vendido').
   * @param {?number} [params.certificationId=null] - Foreign key of the issued certificate.
   * @param {number} [params.price=0] - Item price in PEN.
   * @param {string} [params.imageUrl=''] - URL of the item image.
   * @param {?string} [params.createdAt=null] - ISO creation timestamp.
   */
  constructor({
    id = null, sku = '', name = '', type = '', materialOrigin = '',
    weight = 0, purity = '', batchRef = '', status = 'Pendiente',
    certificationId = null, price = 0, imageUrl = '', createdAt = null
  } = {}) {
    super({ id });
    this.#sku             = sku;
    this.#name            = name;
    this.#type            = type;
    this.#materialOrigin  = materialOrigin;
    this.#weight          = weight;
    this.#purity          = purity;
    this.#batchRef        = batchRef;
    this.#status          = status;
    this.#certificationId = certificationId;
    this.#price           = price;
    this.#imageUrl        = imageUrl;
    this.#createdAt       = createdAt || new Date().toISOString()
  }

  /** @returns {string}  */ get sku()             { return this.#sku; }
  /** @returns {string}  */ get name()            { return this.#name; }
  /** @returns {string}  */ get type()            { return this.#type; }
  /** @returns {string}  */ get materialOrigin()  { return this.#materialOrigin; }
  /** @returns {number}  */ get weight()          { return this.#weight; }
  /** @returns {string}  */ get purity()          { return this.#purity; }
  /** @returns {string}  */ get batchRef()        { return this.#batchRef; }
  /** @returns {string}  */ get status()          { return this.#status; }
  /** @returns {?number} */ get certificationId() { return this.#certificationId; }
  /** @returns {number}  */ get price()           { return this.#price; }
  /** @returns {string}  */ get imageUrl()        { return this.#imageUrl; }
  /** @returns {string}  */ get createdAt()       { return this.#createdAt; }

  /**
   * Creates a new JewelryItem with the given property overrides.
   * @param {Object} [changes={}]
   * @returns {JewelryItem}
   */
  clone(changes = {}) {
    return new JewelryItem({
      id: this.id, sku: this.#sku, name: this.#name, type: this.#type,
      materialOrigin: this.#materialOrigin, weight: this.#weight, purity: this.#purity,
      batchRef: this.#batchRef, status: this.#status, certificationId: this.#certificationId,
      price: this.#price, imageUrl: this.#imageUrl, createdAt: this.#createdAt,
      ...changes
    });
  }
}
