import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

/**
 * AnomalyAlert entity within the Monitoring & Telemetry bounded context.
 * Represents an automatically detected anomaly in fleet telemetry data.
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
  #batchCode;
  /**
   * @type {?number}
   * @private
   */
  #vehicleId;
  /**
   * @type {string}
   * @private
   */
  #alertType;
  /**
   * @type {string}
   * @private
   */
  #severity;
  /**
   * @type {string}
   * @private
   */
  #description;
  /**
   * @type {?Object}
   * @private
   */
  #coordinates;
  /**
   * @type {string}
   * @private
   */
  #status;
  /**
   * @type {string}
   * @private
   */
  #detectedAt;
  /**
   * @type {?string}
   * @private
   */
  #resolvedAt;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - Alert identifier.
   * @param {?number} [params.batchId=null] - Foreign key of the affected mineral batch.
   * @param {string} [params.batchCode=''] - Human-readable batch code.
   * @param {?number} [params.vehicleId=null] - Foreign key of the vehicle that triggered the alert.
   * @param {string} [params.alertType=''] - Alert type ('RETRASO' | 'DESVIO' | 'MERMA_CRITICA' | 'DESCONEXION').
   * @param {string} [params.severity='LOW'] - Severity level ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL').
   * @param {string} [params.description=''] - Human-readable alert description.
   * @param {?Object} [params.coordinates=null] - GPS coordinates at detection time.
   * @param {string} [params.status='Activa'] - Alert status ('Activa' | 'Resuelta' | 'En Revisión').
   * @param {?string} [params.detectedAt=null] - ISO detection timestamp.
   * @param {?string} [params.resolvedAt=null] - ISO resolution timestamp.
   */
  constructor({
    id = null, batchId = null, batchCode = '', vehicleId = null, alertType = '',
    severity = 'LOW', description = '', coordinates = null, status = 'Activa',
    detectedAt = null, resolvedAt = null
  } = {}) {
    super({ id });
    this.#batchId     = batchId;
    this.#batchCode   = batchCode;
    this.#vehicleId   = vehicleId;
    this.#alertType   = alertType;
    this.#severity    = severity;
    this.#description = description;
    this.#coordinates = coordinates;
    this.#status      = status;
    this.#detectedAt  = detectedAt || new Date().toISOString();
    this.#resolvedAt  = resolvedAt
  }

  /** @returns {?number} */ get batchId()     { return this.#batchId; }
  /** @returns {string}  */ get batchCode()   { return this.#batchCode; }
  /** @returns {?number} */ get vehicleId()   { return this.#vehicleId; }
  /** @returns {string}  */ get alertType()   { return this.#alertType; }
  /** @returns {string}  */ get severity()    { return this.#severity; }
  /** @returns {string}  */ get description() { return this.#description; }
  /** @returns {?Object} */ get coordinates() { return this.#coordinates; }
  /** @returns {string}  */ get status()      { return this.#status; }
  /** @returns {string}  */ get detectedAt()  { return this.#detectedAt; }
  /** @returns {?string} */ get resolvedAt()  { return this.#resolvedAt; }

  /**
   * Returns true when the alert has not yet been resolved.
   * @returns {boolean}
   */
  get isActive() { return this.#status === 'Activa'; }

  /**
   * Returns true when severity is HIGH or CRITICAL.
   * @returns {boolean}
   */
  get isCritical() {
    const s = (this.#severity || '').toUpperCase();
    return s === 'CRITICAL' || s === 'HIGH';
  }

  /**
   * Creates a new AnomalyAlert with the given property overrides.
   * @param {Object} [changes={}]
   * @returns {AnomalyAlert}
   */
  clone(changes = {}) {
    return new AnomalyAlert({
      id: this.id, batchId: this.#batchId, batchCode: this.#batchCode,
      vehicleId: this.#vehicleId, alertType: this.#alertType, severity: this.#severity,
      description: this.#description, coordinates: this.#coordinates, status: this.#status,
      detectedAt: this.#detectedAt, resolvedAt: this.#resolvedAt,
      ...changes
    });
  }
}
