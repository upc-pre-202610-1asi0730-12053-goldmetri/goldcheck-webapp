import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

/**
 * MaterialReception entity within the Material Operations bounded context.
 * Represents the reception and weighing of a mineral batch at the refinery plant.
 *
 * @class MaterialReception
 * @extends BaseEntity
 */
export class MaterialReception extends BaseEntity {
  /**
   * @type {?number}
   * @private
   */
  #batchId;
  /**
   * @type {string}
   * @private
   */
  #batchCode;
  /**
   * @type {number}
   * @private
   */
  #receivedWeight;
  /**
   * @type {number}
   * @private
   */
  #initialWeight;
  /**
   * @type {number}
   * @private
   */
  #shrinkagePercent;
  /**
   * @type {string}
   * @private
   */
  #mineralType;
  /**
   * @type {?number}
   * @private
   */
  #purityKarats;
  /**
   * @type {string}
   * @private
   */
  #status;
  /**
   * @type {?number}
   * @private
   */
  #operatorId;
  /**
   * @type {string}
   * @private
   */
  #receivedAt;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - Reception identifier.
   * @param {?number} [params.batchId=null] - Foreign key of the received mineral batch.
   * @param {string} [params.batchCode=''] - Human-readable batch code.
   * @param {number} [params.receivedWeight=0] - Final weight recorded at reception in tonnes.
   * @param {number} [params.initialWeight=0] - Original weight at loading point in tonnes.
   * @param {number} [params.shrinkagePercent=0] - Pre-calculated shrinkage percentage.
   * @param {string} [params.mineralType=''] - Type of mineral received.
   * @param {?number} [params.purityKarats=null] - Purity measured in karats.
   * @param {string} [params.status='Pendiente'] - Reception status ('Pending' | 'Received' | 'Under Investigation' | 'Processed').
   * @param {?number} [params.operatorId=null] - Foreign key of the receiving operator.
   * @param {?string} [params.receivedAt=null] - ISO reception timestamp.
   */
  constructor({
    id = null, batchId = null, batchCode = '', receivedWeight = 0, initialWeight = 0,
    shrinkagePercent = 0, mineralType = '', purityKarats = null,
    status = 'Pendiente', operatorId = null, receivedAt = null
  } = {}) {
    super({ id });
    this.#batchId          = batchId;
    this.#batchCode        = batchCode;
    this.#receivedWeight   = receivedWeight;
    this.#initialWeight    = initialWeight;
    this.#shrinkagePercent = shrinkagePercent;
    this.#mineralType      = mineralType;
    this.#purityKarats     = purityKarats;
    this.#status           = status;
    this.#operatorId       = operatorId;
    this.#receivedAt       = receivedAt || new Date().toISOString()
  }

  /** @returns {?number} */ get batchId()          { return this.#batchId; }
  /** @returns {string}  */ get batchCode()        { return this.#batchCode; }
  /** @returns {number}  */ get receivedWeight()   { return this.#receivedWeight; }
  /** @returns {number}  */ get initialWeight()    { return this.#initialWeight; }
  /** @returns {number}  */ get shrinkagePercent() { return this.#shrinkagePercent; }
  /** @returns {string}  */ get mineralType()      { return this.#mineralType; }
  /** @returns {?number} */ get purityKarats()     { return this.#purityKarats; }
  /** @returns {string}  */ get status()           { return this.#status; }
  /** @returns {?number} */ get operatorId()       { return this.#operatorId; }
  /** @returns {string}  */ get receivedAt()       { return this.#receivedAt; }

  /**
   * Calculates weight shrinkage as a percentage of initial weight.
   * @returns {string}
   */
  get shrinkage() {
    if (!this.#initialWeight) return 0;
    return ((this.#initialWeight - this.#receivedWeight) / this.#initialWeight * 100).toFixed(2);
  }

  /**
   * Returns true when shrinkage exceeds the 5% investigation threshold.
   * @returns {boolean}
   */
  get isCritical() {
    return parseFloat(this.shrinkage) > 5;
  }

  /**
   * Creates a new MaterialReception with the given property overrides.
   * @param {Object} [changes={}]
   * @returns {MaterialReception}
   */
  clone(changes = {}) {
    return new MaterialReception({
      id: this.id, batchId: this.#batchId, batchCode: this.#batchCode,
      receivedWeight: this.#receivedWeight, initialWeight: this.#initialWeight,
      shrinkagePercent: this.#shrinkagePercent, mineralType: this.#mineralType,
      purityKarats: this.#purityKarats, status: this.#status,
      operatorId: this.#operatorId, receivedAt: this.#receivedAt,
      ...changes
    });
  }
}
