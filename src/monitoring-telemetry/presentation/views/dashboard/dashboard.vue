<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMonitoringStore } from '../../../application/monitoring.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'

const { t } = useI18n()
const store = useMonitoringStore()

const alertTypeMap = {
  'ROUTE_DEVIATION':    'monitoring.typeRouteDeviation',
  'DELAY':              'monitoring.typeDelay',
  'WEIGHT_DISCREPANCY': 'monitoring.typeWeightDiscrepancy',
}

function translateAlertType(type) {
  return alertTypeMap[type] ? t(alertTypeMap[type]) : (type || '—')
}

function translateSeverity(s) {
  const map = {
    'critical': t('monitoring.severityCritical'),
    'warning':  t('monitoring.severityWarning'),
    'low':      t('monitoring.severityLow'),
  }
  return map[s?.toLowerCase()] || s || '—'
}

onMounted(() => Promise.all([store.fetchAlerts(), store.fetchActiveBatches()]))
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('monitoring.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('monitoring.dashboardSubtitle') }}</p>
      </div>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-kpi-grid">
        <StatCard :label="$t('monitoring.activeAlerts')" :value="store.alertCount" icon="pi pi-bell" trend="" :alert-active="store.alertCount > 0" />
        <StatCard :label="$t('monitoring.criticalAlerts')" :value="store.criticalAlerts.length" icon="pi pi-exclamation-circle" trend="" :alert-active="store.criticalAlerts.length > 0" />
        <StatCard :label="$t('monitoring.activeBatches')" :value="store.activeBatches.length" icon="pi pi-truck" trend="" />
      </div>

      <div class="gc-card" style="margin-top:1.5rem">
        <p class="gc-section-title">{{ $t('monitoring.alertList') }}</p>
        <table class="gc-table" v-if="store.alerts.length">
          <thead>
            <tr>
              <th>{{ $t('monitoring.colType') }}</th>
              <th>{{ $t('monitoring.colSeverity') }}</th>
              <th>{{ $t('monitoring.colBatch') }}</th>
              <th>{{ $t('monitoring.colStatus') }}</th>
              <th>{{ $t('monitoring.colAction') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="alert in store.alerts" :key="alert.id">
              <td>{{ translateAlertType(alert.alertType) }}</td>
              <td>
                <span class="gc-badge" :class="alert.isCritical ? 'badge-danger' : 'badge-info'">
                  {{ translateSeverity(alert.severity) }}
                </span>
              </td>
              <td>{{ alert.batchCode || '—' }}</td>
              <td>{{ alert.status }}</td>
              <td>
                <button
                  v-if="alert.isActive"
                  class="gc-btn gc-btn-outline"
                  style="font-size:0.75rem;padding:0.3rem 0.8rem"
                  @click="store.resolveAlert(alert.id)"
                >{{ $t('monitoring.resolve') }}</button>
                <span v-else style="color:var(--gc-text-muted);font-size:0.8rem">{{ $t('monitoring.resolved') }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('monitoring.noAlerts') }}
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.gc-kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.gc-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
.badge-danger { background: rgba(239,68,68,.15); color: #ef4444; }
.badge-info   { background: rgba(59,130,246,.15); color: #3b82f6; }
</style>
