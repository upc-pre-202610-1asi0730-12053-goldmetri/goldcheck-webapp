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
      <div class="gc-stats-row">
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('monitoring.activeAlerts') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-danger)">{{ store.alertCount }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('monitoring.criticalAlerts') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-gold-mid)">{{ store.criticalAlerts.length }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('monitoring.activeBatches') }}</p>
          <p class="gc-stat-value">{{ store.activeBatches.length }}</p>
        </div>
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
              <td>{{ alert.alertType }}</td>
              <td>
                <span class="gc-badge" :class="alert.isCritical ? 'badge-danger' : 'badge-info'">
                  {{ alert.severity }}
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

<script setup>
import { onMounted } from 'vue'
import { useMonitoringStore } from '../../../application/monitoring.store.js'

const store = useMonitoringStore()
onMounted(() => Promise.all([store.fetchAlerts(), store.fetchActiveBatches()]))
</script>

<style scoped>
.gc-stats-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.gc-stat-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 10px; padding: 1.25rem 2rem; min-width: 160px; }
.gc-stat-label { font-size: 0.75rem; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .35rem; }
.gc-stat-value { font-size: 1.8rem; font-weight: 800; color: var(--gc-text-primary); }
.gc-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
.badge-danger { background: rgba(239,68,68,.15); color: #ef4444; }
.badge-info   { background: rgba(59,130,246,.15); color: #3b82f6; }
</style>
