import { AnalyticsMetric } from '../domain/model/analytics-metric.entity.js'

export class AnalyticsMetricAssembler {
  static toEntity(r) {
    return new AnalyticsMetric({
      id: r.id, metricKey: r.metricKey, value: r.value,
      unit: r.unit, period: r.period, segment: r.segment,
      createdAt: r.createdAt
    })
  }

  static toEntities(response) {
    return (response.data || []).map(r => this.toEntity(r))
  }
}
