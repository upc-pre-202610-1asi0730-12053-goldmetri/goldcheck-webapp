import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

/**
 * AnalyticsMetric entity within the Analytics bounded context.
 * Represents an aggregated KPI data point for a given period and segment.
 *
 * @class AnalyticsMetric
 * @extends BaseEntity
 */
export class AnalyticsMetric extends BaseEntity {
  /**
   * @type {string}
   * @private
   */
  #metricKey;
  /**
   * @type {number}
   * @private
   */
  #value;
  /**
   * @type {string}
   * @private
   */
  #unit;
  /**
   * @type {string}
   * @private
   */
  #period;
  /**
   * @type {string}
   * @private
   */
  #segment;
  /**
   * @type {string}
   * @private
   */
  #createdAt;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - Metric identifier.
   * @param {string} [params.metricKey=''] - Machine-readable metric identifier (e.g. 'shrinkage_avg').
   * @param {number} [params.value=0] - Numeric metric value.
   * @param {string} [params.unit=''] - Unit of measurement (e.g. '%', 't', 'PEN').
   * @param {string} [params.period=''] - Reporting period (e.g. '2025-Q1').
   * @param {string} [params.segment=''] - Target segment ('mining' | 'jewelry' | 'consumer').
   * @param {?string} [params.createdAt=null] - ISO creation timestamp.
   */
  constructor({ id = null, metricKey = '', value = 0, unit = '', period = '', segment = '', createdAt = null } = {}) {
    super({ id });
    this.#metricKey = metricKey;
    this.#value     = value;
    this.#unit      = unit;
    this.#period    = period;
    this.#segment   = segment;
    this.#createdAt = createdAt || new Date().toISOString()
  }

  /** @returns {string} */ get metricKey() { return this.#metricKey; }
  /** @returns {number} */ get value()     { return this.#value; }
  /** @returns {string} */ get unit()      { return this.#unit; }
  /** @returns {string} */ get period()    { return this.#period; }
  /** @returns {string} */ get segment()   { return this.#segment; }
  /** @returns {string} */ get createdAt() { return this.#createdAt; }

  /**
   * Creates a new AnalyticsMetric with the given property overrides.
   * @param {Object} [changes={}]
   * @returns {AnalyticsMetric}
   */
  clone(changes = {}) {
    return new AnalyticsMetric({
      id: this.id, metricKey: this.#metricKey, value: this.#value,
      unit: this.#unit, period: this.#period, segment: this.#segment,
      createdAt: this.#createdAt, ...changes
    });
  }
}
