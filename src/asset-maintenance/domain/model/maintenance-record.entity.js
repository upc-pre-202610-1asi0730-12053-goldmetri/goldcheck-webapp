import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

/**
 * MaintenanceRecord entity within the Asset Maintenance bounded context.
 * Represents a scheduled or completed maintenance event for a vehicle.
 *
 * @class MaintenanceRecord
 * @extends BaseEntity
 */
export class MaintenanceRecord extends BaseEntity {
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
   * @type {string}
   * @private
   */
  #maintenanceType;
  /**
   * @type {string}
   * @private
   */
  #description;
  /**
   * @type {?string}
   * @private
   */
  #scheduledDate;
  /**
   * @type {?string}
   * @private
   */
  #completedDate;
  /**
   * @type {?number}
   * @private
   */
  #technicianId;
  /**
   * @type {string}
   * @private
   */
  #status;
  /**
   * @type {number}
   * @private
   */
  #cost;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - Record identifier.
   * @param {?number} [params.vehicleId=null] - Foreign key of the maintained vehicle.
   * @param {string} [params.vehicleName=''] - Display name of the vehicle.
   * @param {string} [params.maintenanceType=''] - Maintenance type ('PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION').
   * @param {string} [params.description=''] - Free-text description of the maintenance task.
   * @param {?string} [params.scheduledDate=null] - ISO scheduled execution date.
   * @param {?string} [params.completedDate=null] - ISO actual completion date.
   * @param {?number} [params.technicianId=null] - Foreign key of the assigned technician.
   * @param {string} [params.status='Programado'] - Record status ('Scheduled' | 'In Progress' | 'Completed' | 'Cancelled').
   * @param {number} [params.cost=0] - Maintenance cost in PEN.
   */
  constructor({
    id = null, vehicleId = null, vehicleName = '', maintenanceType = '',
    description = '', scheduledDate = null, completedDate = null,
    technicianId = null, status = 'Programado', cost = 0
  } = {}) {
    super({ id });
    this.#vehicleId       = vehicleId;
    this.#vehicleName     = vehicleName;
    this.#maintenanceType = maintenanceType;
    this.#description     = description;
    this.#scheduledDate   = scheduledDate;
    this.#completedDate   = completedDate;
    this.#technicianId    = technicianId;
    this.#status          = status;
    this.#cost            = cost
  }

  /** @returns {?number} */ get vehicleId()       { return this.#vehicleId; }
  /** @returns {string}  */ get vehicleName()     { return this.#vehicleName; }
  /** @returns {string}  */ get maintenanceType() { return this.#maintenanceType; }
  /** @returns {string}  */ get description()     { return this.#description; }
  /** @returns {?string} */ get scheduledDate()   { return this.#scheduledDate; }
  /** @returns {?string} */ get completedDate()   { return this.#completedDate; }
  /** @returns {?number} */ get technicianId()    { return this.#technicianId; }
  /** @returns {string}  */ get status()          { return this.#status; }
  /** @returns {number}  */ get cost()            { return this.#cost; }

  /**
   * Returns true when the record is scheduled but past its due date.
   * @returns {boolean}
   */
  get isOverdue() {
    if (this.#status !== 'Programado') return false;
    return this.#scheduledDate && new Date(this.#scheduledDate) < new Date();
  }

  /**
   * Creates a new MaintenanceRecord with the given property overrides.
   * @param {Object} [changes={}]
   * @returns {MaintenanceRecord}
   */
  clone(changes = {}) {
    return new MaintenanceRecord({
      id: this.id, vehicleId: this.#vehicleId, vehicleName: this.#vehicleName,
      maintenanceType: this.#maintenanceType, description: this.#description,
      scheduledDate: this.#scheduledDate, completedDate: this.#completedDate,
      technicianId: this.#technicianId, status: this.#status, cost: this.#cost,
      ...changes
    });
  }
}
