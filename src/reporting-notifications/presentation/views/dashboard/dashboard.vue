<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useReportingStore } from '../../../application/reporting.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'

const { t, locale } = useI18n()
const store = useReportingStore()

function translateStatus(s) {
  const map = {
    'Cargando':           t('mineral.statusLoading'),
    'En Tránsito':        t('mineral.statusInTransit'),
    'En Balanza':         t('mineral.statusOnScale'),
    'En Planta':          t('mineral.statusAtPlant'),
    'Completado':         t('mineral.statusCompleted'),
    'Procesado':          t('mineral.statusCompleted'),
    'Alerta':             t('mineral.statusAlert'),
    'Bajo Investigación': t('mineral.statusUnderInvestigation'),
  }
  return map[s] || s || '—'
}

function translateAlertType(type) {
  const map = {
    'ROUTE_DEVIATION':    t('monitoring.typeRouteDeviation'),
    'DELAY':              t('monitoring.typeDelay'),
    'WEIGHT_DISCREPANCY': t('monitoring.typeWeightDiscrepancy'),
  }
  return map[type] || type || '—'
}

function translateSeverity(s) {
  const map = {
    'critical': t('monitoring.severityCritical'),
    'warning':  t('monitoring.severityWarning'),
    'low':      t('monitoring.severityLow'),
  }
  return map[s?.toLowerCase()] || s || '—'
}

function statusClass(s) {
  if (s === 'Completado' || s === 'Procesado') return 'badge-ok'
  if (s === 'Bajo Investigación' || s === 'Alerta') return 'badge-danger'
  return 'badge-warning'
}

function severityClass(s) {
  return s?.toLowerCase() === 'critical' ? 'badge-danger' : 'badge-warning'
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(locale.value === 'es' ? 'es-PE' : 'en-US')
}

onMounted(() => store.fetchReports())
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('reporting.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('reporting.dashboardSubtitle') }}</p>
      </div>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-kpi-grid">
        <StatCard :label="$t('reporting.totalBatches')" :value="store.totalBatches" icon="pi pi-inbox" trend="" />
        <StatCard :label="$t('reporting.processed')" :value="store.processedBatches" icon="pi pi-check-circle" trend="" />
        <StatCard :label="$t('reporting.totalAlerts')" :value="store.totalAlerts" icon="pi pi-bell" trend="" :alert-active="store.totalAlerts > 0" />
        <StatCard :label="$t('reporting.certified')" :value="store.certifiedItems" icon="pi pi-shield" trend="" />
      </div>

      <!-- Batch History -->
      <div class="gc-card" style="margin-top:1.5rem">
        <p class="gc-section-title">
          <i class="pi pi-list" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
          {{ $t('reporting.batchHistoryTitle') }}
        </p>
        <table class="gc-table" v-if="store.batchReport.length">
          <thead>
            <tr>
              <th>{{ $t('reporting.colBatch') }}</th>
              <th>{{ $t('reporting.colMineral') }}</th>
              <th>{{ $t('reporting.colInitialWeight') }}</th>
              <th>{{ $t('reporting.colFinalWeight') }}</th>
              <th>{{ $t('reporting.colStatus') }}</th>
              <th>{{ $t('reporting.colDate') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in store.batchReport" :key="b.id">
              <td><span class="rep-code">{{ b.batchCode || `#${b.id}` }}</span></td>
              <td>{{ b.mineralType || '—' }}</td>
              <td>{{ b.initialWeight ? b.initialWeight.toFixed(2) + ' T' : '—' }}</td>
              <td>{{ b.finalWeight  ? b.finalWeight.toFixed(2)  + ' T' : '—' }}</td>
              <td>
                <span class="gc-badge" :class="statusClass(b.status)">{{ translateStatus(b.status) }}</span>
              </td>
              <td>{{ formatDate(b.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('reporting.noBatches') }}
        </p>
      </div>

      <!-- Recent Alerts -->
      <div class="gc-card" style="margin-top:1.25rem">
        <p class="gc-section-title">
          <i class="pi pi-bell" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
          {{ $t('reporting.alertHistoryTitle') }}
        </p>
        <table class="gc-table" v-if="store.alertReport.length">
          <thead>
            <tr>
              <th>{{ $t('reporting.colType') }}</th>
              <th>{{ $t('reporting.colSeverity') }}</th>
              <th>{{ $t('reporting.colDate') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in store.alertReport" :key="a.id">
              <td>{{ translateAlertType(a.type) }}</td>
              <td>
                <span class="gc-badge" :class="severityClass(a.severity)">{{ translateSeverity(a.severity) }}</span>
              </td>
              <td>{{ formatDate(a.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('reporting.noAlerts') }}
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.gc-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.gc-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
.badge-ok      { background: rgba(74,222,128,.15);  color: #4ade80; }
.badge-warning { background: rgba(178,148,78,.15);  color: var(--gc-gold-mid); }
.badge-danger  { background: rgba(239,68,68,.15);   color: #ef4444; }
.rep-code { background: rgba(178,148,78,0.15); color: var(--gc-gold-mid); border: 1px solid rgba(178,148,78,0.3); padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.78rem; font-family: monospace; }
</style>
