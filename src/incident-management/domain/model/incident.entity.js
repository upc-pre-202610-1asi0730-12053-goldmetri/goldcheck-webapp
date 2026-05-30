import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

/**
 * Incident entity within the Incident Management bounded context.
 * Represents a reported security or operational incident in the supply chain.
 *
 * @class Incident
 * @extends BaseEntity
 */
export class Incident extends BaseEntity {
  /**
   * @type {string}
   * @private
   */
  #title;
  /**
   * @type {string}
   * @private
   */
  #description;
  /**
   * @type {string}
   * @private
   */
  #incidentType;
  /**
   * @type {string}
   * @private
   */
  #severity;
  /**
   * @type {?number}
   * @private
   */
  #batchId;
  /**
   * @type {?number}
   * @private
   */
  #vehicleId;
  /**
   * @type {?number}
   * @private
   */
  #reportedBy;
  /**
   * @type {string}
   * @private
   */
  #status;
  /**
   * @type {string}
   * @private
   */
  #reportedAt;
  /**
   * @type {?string}
   * @private
   */
  #resolvedAt;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - Incident identifier.
   * @param {string} [params.title=''] - Short incident title.
   * @param {string} [params.description=''] - Full incident description.
   * @param {string} [params.incidentType=''] - Incident type ('THEFT' | 'ACCIDENT' | 'DEVIATION' | 'OTHER').
   * @param {string} [params.severity='LOW'] - Severity level ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL').
   * @param {?number} [params.batchId=null] - Foreign key of the related mineral batch.
   * @param {?number} [params.vehicleId=null] - Foreign key of the related vehicle.
   * @param {?number} [params.reportedBy=null] - Foreign key of the reporting user.
   * @param {string} [params.status='Abierto'] - Resolution status ('Open' | 'Under Review' | 'Resolved' | 'Closed').
   * @param {?string} [params.reportedAt=null] - ISO timestamp of the report.
   * @param {?string} [params.resolvedAt=null] - ISO timestamp of resolution.
   */
  constructor({
    id = null, title = '', description = '', incidentType = '', severity = 'LOW',
    batchId = null, vehicleId = null, reportedBy = null, status = 'Abierto',
    reportedAt = null, resolvedAt = null
  } = {}) {
    super({ id });
    this.#title        = title;
    this.#description  = description;
    this.#incidentType = incidentType;
    this.#severity     = severity;
    this.#batchId      = batchId;
    this.#vehicleId    = vehicleId;
    this.#reportedBy   = reportedBy;
    this.#status       = status;
    this.#reportedAt   = reportedAt || new Date().toISOString();
    this.#resolvedAt   = resolvedAt
  }

  /** @returns {string}  */ get title()        { return this.#title; }
  /** @returns {string}  */ get description()  { return this.#description; }
  /** @returns {string}  */ get incidentType() { return this.#incidentType; }
  /** @returns {string}  */ get severity()     { return this.#severity; }
  /** @returns {?number} */ get batchId()      { return this.#batchId; }
  /** @returns {?number} */ get vehicleId()    { return this.#vehicleId; }
  /** @returns {?number} */ get reportedBy()   { return this.#reportedBy; }
  /** @returns {string}  */ get status()       { return this.#status; }
  /** @returns {string}  */ get reportedAt()   { return this.#reportedAt; }
  /** @returns {?string} */ get resolvedAt()   { return this.#resolvedAt; }

  /**
   * Creates a new Incident with the given property overrides.
   * @param {Object} [changes={}]
   * @returns {Incident}
   */
  clone(changes = {}) {
    return new Incident({
      id: this.id, title: this.#title, description: this.#description,
      incidentType: this.#incidentType, severity: this.#severity,
      batchId: this.#batchId, vehicleId: this.#vehicleId,
      reportedBy: this.#reportedBy, status: this.#status,
      reportedAt: this.#reportedAt, resolvedAt: this.#resolvedAt,
      ...changes
    });
  }
}
