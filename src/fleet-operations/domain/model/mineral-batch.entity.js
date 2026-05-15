import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

/**
 * MineralBatch entity within the Fleet Operations bounded context.
 * Represents a physical batch of mineral in transit from a deposit to the refinery.
 *
 * @class MineralBatch
 * @extends BaseEntity
 */
export class MineralBatch extends BaseEntity {
  /**
   * @type {string}
   * @private
   */
  #batchCode;
  /**
   * @type {?number}
   * @private
   */
  #depositId;
  /**
   * @type {string}
   * @private
   */
  #depositName;
  /**
   * @type {?number}
   * @private
   */
  #vehicleId;
  /**
   * @type {string}
   * @private
   */
  #vehicleName;
  /**
   * @type {?number}
   * @private
   */
  #driverId;
  /**
   * @type {number}
   * @private
   */
  #initialWeight;
  /**
   * @type {?number}
   * @private
   */
  #finalWeight;
  /**
   * @type {string}
   * @private
   */
  #mineralType;
  /**
   * @type {string}
   * @private
   */
  #status;
  /**
   * @type {string}
   * @private
   */
  #destination;
  /**
   * @type {string}
   * @private
   */
  #createdAt;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - Batch identifier.
   * @param {string} [params.batchCode=''] - Human-readable batch code (e.g. GM-1234).
   * @param {?number} [params.depositId=null] - Foreign key of the source deposit.
   * @param {string} [params.depositName=''] - Display name of the source deposit.
   * @param {?number} [params.vehicleId=null] - Foreign key of the transport vehicle.
   * @param {string} [params.vehicleName=''] - Display name of the transport vehicle.
   * @param {?number} [params.driverId=null] - Foreign key of the assigned driver.
   * @param {number} [params.initialWeight=0] - Recorded weight at loading point in tonnes.
   * @param {?number} [params.finalWeight=null] - Recorded weight at reception in tonnes.
   * @param {string} [params.mineralType=''] - Type of mineral (e.g. 'Oro', 'Plata').
   * @param {string} [params.status='Cargando'] - Transit status ('Cargando' | 'En Tránsito' | 'En Balanza' | 'En Planta' | 'Procesado' | 'Desvío Detectado').
   * @param {string} [params.destination=''] - Destination plant name.
   * @param {?string} [params.createdAt=null] - ISO creation timestamp.
   */
  constructor({
    id = null, batchCode = '', depositId = null, depositName = '',
    vehicleId = null, vehicleName = '', driverId = null,
    initialWeight = 0, finalWeight = null, mineralType = '',
    status = 'Cargando', destination = '', createdAt = null
  } = {}) {
    super({ id });
    this.#batchCode     = batchCode;
    this.#depositId     = depositId;
    this.#depositName   = depositName;
    this.#vehicleId     = vehicleId;
    this.#vehicleName   = vehicleName;
    this.#driverId      = driverId;
    this.#initialWeight = initialWeight;
    this.#finalWeight   = finalWeight;
    this.#mineralType   = mineralType;
    this.#status        = status;
    this.#destination   = destination;
    this.#createdAt     = createdAt || new Date().toISOString()
  }

  /** @returns {string}  */ get batchCode()     { return this.#batchCode; }
  /** @returns {?number} */ get depositId()     { return this.#depositId; }
  /** @returns {string}  */ get depositName()   { return this.#depositName; }
  /** @returns {?number} */ get vehicleId()     { return this.#vehicleId; }
  /** @returns {string}  */ get vehicleName()   { return this.#vehicleName; }
  /** @returns {?number} */ get driverId()      { return this.#driverId; }
  /** @returns {number}  */ get initialWeight() { return this.#initialWeight; }
  /** @returns {?number} */ get finalWeight()   { return this.#finalWeight; }
  /** @returns {string}  */ get mineralType()   { return this.#mineralType; }
  /** @returns {string}  */ get status()        { return this.#status; }
  /** @returns {string}  */ get destination()   { return this.#destination; }
  /** @returns {string}  */ get createdAt()     { return this.#createdAt; }

  /**
   * Creates a new MineralBatch with the given property overrides.
   * @param {Object} [changes={}]
   * @returns {MineralBatch}
   */
  clone(changes = {}) {
    return new MineralBatch({
      id: this.id, batchCode: this.#batchCode, depositId: this.#depositId,
      depositName: this.#depositName, vehicleId: this.#vehicleId,
      vehicleName: this.#vehicleName, driverId: this.#driverId,
      initialWeight: this.#initialWeight, finalWeight: this.#finalWeight,
      mineralType: this.#mineralType, status: this.#status,
      destination: this.#destination, createdAt: this.#createdAt,
      ...changes
    });
  }
}
