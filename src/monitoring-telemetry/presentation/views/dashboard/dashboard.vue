<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMonitoringStore } from '../../../application/monitoring.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'

const { t } = useI18n()
const store          = useMonitoringStore()
const monitoringAsset = ref('')
const isMonitoring   = ref(false)

async function startMonitoring() {
  if (!monitoringAsset.value) return
  isMonitoring.value = true
  await store.monitorAll(monitoringAsset.value)
  isMonitoring.value = false
}

function translateAlertStatus(s) {
  if (!s || s === 'Activo') return t('monitoring.statusOpen')
  return t('monitoring.statusResolved')
}

function translateSeverity(s) {
  const map = { critical: t('monitoring.severityCritical'), warning: t('monitoring.severityWarning'), low: t('monitoring.severityLow') }
  return map[s?.toLowerCase()] || s || '—'
}

onMounted(() => Promise.all([store.fetchAlerts(), store.fetchActiveBatches()]))
</script>

<template>
  <div class="gc-page">
    <div class="page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('monitoring.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('monitoring.dashboardSubtitle') }}</p>
      </div>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="kpi-grid">
        <StatCard :label="$t('monitoring.activeAlerts')" :value="store.alertCount" icon="pi pi-bell" trend="" :alert-active="store.alertCount > 0" />
        <StatCard :label="$t('monitoring.criticalAlerts')" :value="store.criticalAlerts.length" icon="pi pi-exclamation-circle" trend="" :alert-active="store.criticalAlerts.length > 0" />
        <StatCard :label="$t('monitoring.activeBatches')" :value="store.activeBatches.length" icon="pi pi-truck" trend="" />
      </div>

      <!-- Machinery Monitoring Panel -->
      <div class="gc-card" style="margin-top:1.5rem" v-if="store.userMachineryIds.length">
        <p class="gc-section-title"><i class="pi pi-desktop" style="color:var(--gc-gold-mid);margin-right:.4rem" /> {{ $t('monitoring.machineryMonitor') }}</p>
        <div class="monitor-bar">
          <select v-model="monitoringAsset" class="inp-select">
            <option value="" disabled>{{ $t('monitoring.selectMachinery') }}</option>
            <option v-for="id in store.userMachineryIds" :key="id" :value="id">{{ id }}</option>
          </select>
          <button class="btn-gold" :disabled="!monitoringAsset || isMonitoring" @click="startMonitoring">
            <i :class="isMonitoring ? 'pi pi-spin pi-spinner' : 'pi pi-play'" />
            {{ isMonitoring ? $t('monitoring.monitoring') : $t('monitoring.startMonitor') }}
          </button>
        </div>

        <div v-if="store.selectedAssetId" class="telemetry-grid">
          <!-- Temperature -->
          <div class="telemetry-card">
            <div class="tc-header"><i class="pi pi-sun" style="color:#ef4444" /> {{ $t('monitoring.engineTemp') }}</div>
            <div v-if="store.temperatureData" class="tc-data">
              <div class="tc-row"><span>{{ $t('monitoring.dataStatus') }}</span><span class="tc-val">{{ store.temperatureData.status || '—' }}</span></div>
              <div class="tc-row"><span>{{ $t('monitoring.dataAsset') }}</span><span class="tc-val">{{ store.temperatureData.assetId || store.selectedAssetId }}</span></div>
            </div>
            <p v-else class="tc-empty">{{ $t('monitoring.noData') }}</p>
          </div>

          <!-- Speed -->
          <div class="telemetry-card">
            <div class="tc-header"><i class="pi pi-gauge" style="color:#3b82f6" /> {{ $t('monitoring.speed') }}</div>
            <div v-if="store.speedData" class="tc-data">
              <div class="tc-row"><span>{{ $t('monitoring.dataStatus') }}</span><span class="tc-val">{{ store.speedData.status || '—' }}</span></div>
              <div class="tc-row"><span>{{ $t('monitoring.dataAsset') }}</span><span class="tc-val">{{ store.speedData.assetId || store.selectedAssetId }}</span></div>
            </div>
            <p v-else class="tc-empty">{{ $t('monitoring.noData') }}</p>
          </div>

          <!-- Pressure -->
          <div class="telemetry-card">
            <div class="tc-header"><i class="pi pi-chart-bar" style="color:#a855f7" /> {{ $t('monitoring.pressure') }}</div>
            <div v-if="store.pressureData" class="tc-data">
              <div class="tc-row"><span>{{ $t('monitoring.dataStatus') }}</span><span class="tc-val">{{ store.pressureData.status || '—' }}</span></div>
              <div class="tc-row"><span>{{ $t('monitoring.dataAsset') }}</span><span class="tc-val">{{ store.pressureData.assetId || store.selectedAssetId }}</span></div>
            </div>
            <p v-else class="tc-empty">{{ $t('monitoring.noData') }}</p>
          </div>

          <!-- GNSS -->
          <div class="telemetry-card">
            <div class="tc-header"><i class="pi pi-map-marker" style="color:#4ade80" /> {{ $t('monitoring.gnss') }}</div>
            <div v-if="store.gnssData" class="tc-data">
              <div class="tc-row"><span>{{ $t('monitoring.dataStatus') }}</span><span class="tc-val">{{ store.gnssData.status || '—' }}</span></div>
              <div class="tc-row"><span>{{ $t('monitoring.dataAsset') }}</span><span class="tc-val">{{ store.gnssData.assetId || store.selectedAssetId }}</span></div>
            </div>
            <p v-else class="tc-empty">{{ $t('monitoring.noData') }}</p>
          </div>
        </div>
      </div>
      <div v-else class="gc-card" style="margin-top:1.5rem;text-align:center;padding:2rem;color:var(--gc-text-muted)">
        <i class="pi pi-desktop" style="font-size:1.5rem;margin-bottom:.5rem;display:block" />
        {{ $t('monitoring.noMachinery') }}
      </div>

      <!-- Alerts Table -->
      <div class="gc-card" style="margin-top:1.5rem">
        <p class="gc-section-title">{{ $t('monitoring.alertList') }}</p>
        <table class="gc-table" v-if="store.alerts.length">
          <thead>
            <tr>
              <th>{{ $t('monitoring.colType') }}</th>
              <th>{{ $t('monitoring.colSeverity') }}</th>
              <th>{{ $t('monitoring.colStatus') }}</th>
              <th>{{ $t('monitoring.colAction') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="alert in store.alerts" :key="alert.id">
              <td>{{ alert.alertType || alert.incidentType || 'Accidente' }}</td>
              <td>
                <span class="gc-badge" :class="alert.isCritical ? 'badge-danger' : 'badge-info'">
                  {{ translateSeverity(alert.severity) }}
                </span>
              </td>
              <td>{{ translateAlertStatus(alert.status) }}</td>
              <td>
                <button
                  v-if="alert.isActive"
                  class="btn-sm btn-outline"
                  @click="store.resolveAlert(alert.id)"
                >{{ $t('monitoring.resolve') }}</button>
                <span v-else style="color:var(--gc-text-muted);font-size:.8rem">{{ $t('monitoring.resolved') }}</span>
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
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
.kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.5rem; }

.gc-badge { font-size:.7rem; font-weight:700; padding:.2rem .6rem; border-radius:20px; text-transform:uppercase; }
.badge-danger { background:rgba(239,68,68,.15); color:#ef4444; }
.badge-info   { background:rgba(59,130,246,.15); color:#3b82f6; }

.monitor-bar { display:flex; gap:.75rem; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; }
.inp-select { padding:.55rem .8rem; background:var(--gc-dark-2); border:1px solid var(--gc-border); border-radius:8px; color:var(--gc-text-primary); font-size:.88rem; min-width:180px; }
.inp-select:focus { outline:none; border-color:var(--gc-gold-mid); }

.telemetry-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; }
.telemetry-card { background:var(--gc-dark-2); border:1px solid var(--gc-border); border-radius:10px; padding:1rem; }
.tc-header { font-size:.82rem; font-weight:700; color:var(--gc-text-primary); display:flex; align-items:center; gap:.4rem; margin-bottom:.75rem; }
.tc-data { display:flex; flex-direction:column; gap:.4rem; }
.tc-row { display:flex; justify-content:space-between; font-size:.8rem; color:var(--gc-text-muted); }
.tc-val { color:var(--gc-text-primary); font-weight:600; }
.tc-empty { font-size:.8rem; color:var(--gc-text-muted); text-align:center; padding:.5rem 0; }

.btn-gold    { display:inline-flex; align-items:center; gap:.4rem; padding:.5rem 1rem; border-radius:8px; font-size:.84rem; font-weight:600; cursor:pointer; border:none; background:var(--gc-gold-mid); color:#000; }
.btn-gold:hover { opacity:.88; }
.btn-gold:disabled { opacity:.5; cursor:not-allowed; }
.btn-outline { display:inline-flex; align-items:center; gap:.4rem; padding:.5rem 1rem; border-radius:8px; font-size:.84rem; font-weight:600; cursor:pointer; background:transparent; border:1px solid var(--gc-border); color:var(--gc-text-secondary); }
.btn-outline:hover { border-color:var(--gc-gold-mid); color:var(--gc-text-primary); }
.btn-sm { font-size:.75rem !important; padding:.28rem .65rem !important; }
</style>
