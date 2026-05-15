import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

/**
 * SubscriptionPlan entity within the Subscriptions & Billing bounded context.
 * Represents a purchasable plan tier with its associated feature set.
 *
 * @class SubscriptionPlan
 * @extends BaseEntity
 */
export class SubscriptionPlan extends BaseEntity {
  /**
   * @type {string}
   * @private
   */
  #planKey;
  /**
   * @type {string}
   * @private
   */
  #name;
  /**
   * @type {number}
   * @private
   */
  #price;
  /**
   * @type {string}
   * @private
   */
  #currency;
  /**
   * @type {string}
   * @private
   */
  #billingCycle;
  /**
   * @type {Array<string>}
   * @private
   */
  #features;
  /**
   * @type {number}
   * @private
   */
  #maxBatchesPerMonth;
  /**
   * @type {boolean}
   * @private
   */
  #hasAnalytics;
  /**
   * @type {boolean}
   * @private
   */
  #hasIoT;
  /**
   * @type {boolean}
   * @private
   */
  #hasApiAccess;
  /**
   * @type {boolean}
   * @private
   */
  #isActive;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - Plan identifier.
   * @param {string} [params.planKey=''] - Machine-readable plan key ('BRONZE' | 'GOLD' | 'PLATINUM').
   * @param {string} [params.name=''] - Human-readable plan display name.
   * @param {number} [params.price=0] - Monthly price in the billing currency.
   * @param {string} [params.currency='PEN'] - ISO 4217 currency code.
   * @param {string} [params.billingCycle='monthly'] - Billing cycle ('monthly' | 'annual').
   * @param {Array<string>} [params.features=[]] - List of included feature descriptions.
   * @param {number} [params.maxBatchesPerMonth=0] - Maximum batches allowed per billing cycle.
   * @param {boolean} [params.hasAnalytics=false] - Whether analytics dashboard is included.
   * @param {boolean} [params.hasIoT=false] - Whether IoT telemetry integration is included.
   * @param {boolean} [params.hasApiAccess=false] - Whether API access is included.
   * @param {boolean} [params.isActive=true] - Whether the plan is currently available for purchase.
   */
  constructor({
    id = null, planKey = '', name = '', price = 0, currency = 'PEN',
    billingCycle = 'monthly', features = [], maxBatchesPerMonth = 0,
    hasAnalytics = false, hasIoT = false, hasApiAccess = false, isActive = true
  } = {}) {
    super({ id });
    this.#planKey            = planKey;
    this.#name               = name;
    this.#price              = price;
    this.#currency           = currency;
    this.#billingCycle       = billingCycle;
    this.#features           = features;
    this.#maxBatchesPerMonth = maxBatchesPerMonth;
    this.#hasAnalytics       = hasAnalytics;
    this.#hasIoT             = hasIoT;
    this.#hasApiAccess       = hasApiAccess;
    this.#isActive           = isActive
  }

  /** @returns {string}         */ get planKey()            { return this.#planKey; }
  /** @returns {string}         */ get name()               { return this.#name; }
  /** @returns {number}         */ get price()              { return this.#price; }
  /** @returns {string}         */ get currency()           { return this.#currency; }
  /** @returns {string}         */ get billingCycle()       { return this.#billingCycle; }
  /** @returns {Array<string>}  */ get features()           { return this.#features; }
  /** @returns {number}         */ get maxBatchesPerMonth() { return this.#maxBatchesPerMonth; }
  /** @returns {boolean}        */ get hasAnalytics()       { return this.#hasAnalytics; }
  /** @returns {boolean}        */ get hasIoT()             { return this.#hasIoT; }
  /** @returns {boolean}        */ get hasApiAccess()       { return this.#hasApiAccess; }
  /** @returns {boolean}        */ get isActive()           { return this.#isActive; }

  /**
   * Creates a new SubscriptionPlan with the given property overrides.
   * @param {Object} [changes={}]
   * @returns {SubscriptionPlan}
   */
  clone(changes = {}) {
    return new SubscriptionPlan({
      id: this.id, planKey: this.#planKey, name: this.#name, price: this.#price,
      currency: this.#currency, billingCycle: this.#billingCycle, features: this.#features,
      maxBatchesPerMonth: this.#maxBatchesPerMonth, hasAnalytics: this.#hasAnalytics,
      hasIoT: this.#hasIoT, hasApiAccess: this.#hasApiAccess, isActive: this.#isActive,
      ...changes
    });
  }
}
