import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

/**
 * AnomalyAlert entity within the Fleet Operations bounded context.
 * Lightweight alert used by the fleet dashboard for quick status display.
 *
 * @class AnomalyAlert
 * @extends BaseEntity
 */
export class AnomalyAlert extends BaseEntity {
  /**
   * @type {?number}
   * @private
   */
  #batchId;
  /**
   * @type {string}
   * @private
   */
  #type;
  /**
   * @type {string}
   * @private
   */
  #message;
  /**
   * @type {string}
   * @private
   */
  #severity;
  /**
   * @type {string}
   * @private
   */
  #createdAt;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - Alert identifier.
   * @param {?number} [params.batchId=null] - Foreign key of the affected batch.
   * @param {string} [params.type=''] - Alert type ('ROUTE_DEVIATION' | 'OVERLOAD' | 'DELAY').
   * @param {string} [params.message=''] - Human-readable alert message.
   * @param {string} [params.severity='warning'] - Severity level ('warning' | 'critical').
   * @param {?string} [params.createdAt=null] - ISO detection timestamp.
   */
  constructor({ id = null, batchId = null, type = '', message = '', severity = 'warning', createdAt = null } = {}) {
    super({ id });
    this.#batchId   = batchId;
    this.#type      = type;
    this.#message   = message;
    this.#severity  = severity;
    this.#createdAt = createdAt || new Date().toISOString()
  }

  /** @returns {?number} */ get batchId()   { return this.#batchId; }
  /** @returns {string}  */ get type()      { return this.#type; }
  /** @returns {string}  */ get message()   { return this.#message; }
  /** @returns {string}  */ get severity()  { return this.#severity; }
  /** @returns {string}  */ get createdAt() { return this.#createdAt; }

  /**
   * Creates a new AnomalyAlert with the given property overrides.
   * @param {Object} [changes={}]
   * @returns {AnomalyAlert}
   */
  clone(changes = {}) {
    return new AnomalyAlert({
      id: this.id, batchId: this.#batchId, type: this.#type,
      message: this.#message, severity: this.#severity, createdAt: this.#createdAt,
      ...changes
    });
  }
}
