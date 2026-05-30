import { AnalyticsMetric } from '../domain/model/analytics-metric.entity.js'

/**
 * Maps analytics metric resources into domain entities.
 *
 * @class AnalyticsMetricAssembler
 */
export class AnalyticsMetricAssembler {
  /**
   * @param {Object} resource - AnalyticsMetric resource payload.
   * @returns {AnalyticsMetric} AnalyticsMetric entity.
   */
  static toEntityFromResource(resource) {
    return new AnalyticsMetric({
      id: resource.id, metricKey: resource.metricKey, value: resource.value,
      unit: resource.unit, period: resource.period, segment: resource.segment,
      createdAt: resource.createdAt
    })
  }

  /**
   * Parses analytics metric resources from a response and maps them into entities.
   *
   * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with metric resources.
   * @returns {AnalyticsMetric[]} AnalyticsMetric entities.
   */
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['metrics']
    return resources.map(resource => this.toEntityFromResource(resource))
  }
}
