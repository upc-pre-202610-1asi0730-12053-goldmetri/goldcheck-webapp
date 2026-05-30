import { markRaw } from 'vue'

/**
 * Shared base class for all domain entities.
 * Provides a common identifier property inherited by every bounded context entity.
 *
 * @class BaseEntity
 */
export class BaseEntity {
  /**
   * @type {?number}
   * @private
   */
  #id;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - Entity identifier.
   */
  constructor({ id = null } = {}) {
    this.#id = id
    // Prevent Vue 3's reactive Proxy from wrapping this instance.
    // Proxy objects cannot access JavaScript private class fields,
    // which would cause TypeErrors in every entity getter.
    markRaw(this)
  }

  /**
   * Gets the entity identifier.
   * @returns {?number}
   */
  get id() { return this.#id; }
}
