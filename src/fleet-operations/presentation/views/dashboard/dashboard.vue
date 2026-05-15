<template>
  <div class="gc-page">

    <!-- Header -->
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('mineral.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('mineral.dashboardSubtitle') }}</p>
      </div>
      <div class="gc-page-actions">
        <pv-button :label="$t('mineral.today')" icon="pi pi-calendar" severity="secondary" outlined size="small" />
        <pv-button :label="$t('mineral.newRecord')" icon="pi pi-plus" @click="showNewBatchModal = true" />
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="gc-kpi-grid">
      <StatCard
        :label="$t('mineral.activeBatches')"
        :value="mineralStore.activeBatchCount"
        trend="+2 hoy"
        icon="pi-cube"
      />
      <StatCard
        :label="$t('mineral.tonsToday')"
        :value="mineralStore.totalTonsToday.toFixed(1) + ' T'"
        trend="+12.5T vs ayer"
        icon="pi-chart-bar"
      />
      <StatCard
        :label="$t('mineral.routeAlerts')"
        :value="mineralStore.alertCount"
        trend=""
        icon="pi-exclamation-triangle"
        :alert-active="mineralStore.alertCount > 0"
      />
      <StatCard
        :label="$t('mineral.fleetEfficiency')"
        value="94%"
        trend="+1.2%"
        icon="pi-truck"
      />
    </div>

    <!-- Main Content -->
    <div class="gc-two-col">

      <!-- Batches Table -->
      <div class="gc-card" style="flex:1;min-width:0">
        <div class="gc-card-header">
          <span class="gc-card-title">
            <i class="pi pi-list" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('mineral.batchTracking') }}
          </span>
          <div class="gc-card-tools">
            <pv-icon-field>
              <pv-input-icon class="pi pi-search" />
              <pv-input-text v-model="searchTerm" :placeholder="$t('mineral.searchBatch')" size="small" />
            </pv-icon-field>
            <pv-button :label="$t('mineral.newBatch')" icon="pi pi-plus" size="small" outlined @click="showNewBatchModal = true" />
          </div>
        </div>

        <div v-if="mineralStore.loading" class="gc-loading-row">
          <i class="pi pi-spinner pi-spin" /> {{ $t('common.loading') }}
        </div>

        <pv-data-table v-else :value="filteredBatches" :rows="10" paginator :paginator-template="'PrevPageLink PageLinks NextPageLink'" responsive-layout="scroll">
          <template #empty>{{ $t('mineral.noBatches') }}</template>
          <pv-column :header="$t('mineral.colBatchId')">
            <template #body="{ data }">
              <span class="gc-badge gc-badge-code">{{ data.batchCode }}</span>
            </template>
          </pv-column>
          <pv-column field="vehicleName" :header="$t('mineral.colVehicle')" />
          <pv-column :header="$t('mineral.colLocation')">
            <template #body="{ data }">
              <span style="color:var(--gc-text-muted);font-size:0.8rem">
                <i class="pi pi-map-marker" style="margin-right:0.25rem" />
                {{ data.destination || 'Planta Principal' }}
              </span>
            </template>
          </pv-column>
          <pv-column :header="$t('mineral.colWeight')">
            <template #body="{ data }">{{ data.initialWeight ? data.initialWeight.toFixed(2) + ' T' : '—' }}</template>
          </pv-column>
          <pv-column :header="$t('mineral.colStatus')">
            <template #body="{ data }">
              <pv-tag :value="data.status" :severity="statusSeverity(data.status)" />
            </template>
          </pv-column>
          <pv-column :header="$t('mineral.colAction')">
            <template #body>
              <pv-button icon="pi pi-eye" text rounded :aria-label="$t('mineral.colAction')" />
            </template>
          </pv-column>
        </pv-data-table>
      </div>

      <!-- IoT Activity Panel -->
      <div class="gc-card gc-iot-panel">
        <div class="gc-card-header">
          <span class="gc-card-title">
            <i class="pi pi-wifi" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('mineral.iotActivity') }}
          </span>
          <span class="balance-online-badge" style="font-size:0.7rem">
            <i class="pi pi-circle-fill" style="font-size:0.5rem;color:#4ade80" /> {{ $t('mineral.live') }}
          </span>
        </div>

        <div class="iot-feed">
          <div v-for="(event, i) in iotEvents" :key="i" class="iot-event">
            <div class="iot-dot" :class="event.color" />
            <div>
              <div class="iot-msg">{{ event.message }}</div>
              <div class="iot-time">{{ event.time }}</div>
            </div>
          </div>
        </div>

        <!-- Alerts -->
        <div v-if="mineralStore.alertCount > 0" style="margin-top:1rem">
          <p style="font-size:0.78rem;color:var(--gc-text-muted);margin-bottom:0.5rem">
            {{ $t('mineral.activeAlerts') }}
          </p>
          <div v-for="alert in mineralStore.alerts.slice(0,3)" :key="alert.id"
               class="gc-alert-item" :class="alert.severity === 'critical' ? 'gc-alert-critical' : 'gc-alert-warning'">
            <i class="pi pi-exclamation-triangle" />
            <span>{{ alert.message }}</span>
          </div>
        </div>
        <div v-else class="gc-alert-item gc-alert-ok" style="margin-top:1rem">
          <i class="pi pi-check-circle" />
          <span>{{ $t('mineral.noAlerts') }}</span>
        </div>
      </div>

    </div>

    <!-- New Batch Modal -->
    <NewBatchModal
      v-if="showNewBatchModal"
      @close="showNewBatchModal = false"
      @created="onBatchCreated"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMineralStore } from '../../../application/mineral.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'
import NewBatchModal from './new-batch-modal.vue'

const mineralStore = useMineralStore()
const showNewBatchModal = ref(false)
const searchTerm = ref('')

const filteredBatches = computed(() => {
  if (!searchTerm.value) return mineralStore.batches
  const q = searchTerm.value.toLowerCase()
  return mineralStore.batches.filter(b =>
    b.batchCode?.toLowerCase().includes(q) ||
    b.vehicleName?.toLowerCase().includes(q) ||
    b.status?.toLowerCase().includes(q)
  )
})

const iotEvents = ref([
  { message: 'Balanza BL-01: 38.50 T registradas', time: 'hace 2 min', color: 'iot-green' },
  { message: 'Vehículo CAT-07 en ruta confirmada', time: 'hace 5 min', color: 'iot-green' },
  { message: 'GPS TRK-003: señal reestablecida', time: 'hace 8 min', color: 'iot-yellow' },
  { message: 'Lote GM-4821 llegó a Planta Principal', time: 'hace 12 min', color: 'iot-green' },
  { message: 'Sensor BL-02: sin conexión', time: 'hace 18 min', color: 'iot-red' },
])

function statusSeverity(status) {
  const map = {
    'Cargando':    'warn',
    'En Tránsito': 'info',
    'En Balanza':  'secondary',
    'Completado':  'success',
    'Alerta':      'danger',
  }
  return map[status] || 'secondary'
}

function onBatchCreated(batch) {
  showNewBatchModal.value = false
}

onMounted(async () => {
  await Promise.all([mineralStore.fetchBatches(), mineralStore.fetchSupporting()])
})
</script>

<style scoped>
.gc-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.gc-two-col {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.gc-iot-panel {
  width: 300px;
  flex-shrink: 0;
}

.gc-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.gc-card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gc-text-primary);
}

.gc-card-tools {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gc-search-inline {
  position: relative;
  display: flex;
  align-items: center;
}

.gc-search-inline .pi-search {
  position: absolute;
  left: 0.6rem;
  color: var(--gc-text-muted);
  font-size: 0.75rem;
  pointer-events: none;
}

.gc-search-inline .gc-input-dark {
  padding-left: 1.8rem;
}

.gc-loading-row {
  text-align: center;
  color: var(--gc-text-muted);
  font-size: 0.85rem;
  padding: 2rem 0;
}

.gc-table-empty {
  text-align: center;
  color: var(--gc-text-muted);
  font-size: 0.85rem;
  padding: 1.5rem 0;
}

.gc-badge-code {
  background: rgba(178,148,78,0.15);
  color: var(--gc-gold-mid);
  border: 1px solid rgba(178,148,78,0.3);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.78rem;
  font-family: monospace;
}

.gc-btn-icon {
  background: transparent;
  border: none;
  color: var(--gc-text-muted);
  cursor: pointer;
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  transition: color 0.2s, background 0.2s;
}
.gc-btn-icon:hover { color: var(--gc-gold-mid); background: rgba(178,148,78,0.1); }

.gc-status {
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  font-weight: 500;
}
.gc-status-loading  { background: rgba(250,204,21,0.15); color: #facc15; }
.gc-status-transit  { background: rgba(59,130,246,0.15); color: #60a5fa; }
.gc-status-scale    { background: rgba(168,85,247,0.15); color: #c084fc; }
.gc-status-done     { background: rgba(74,222,128,0.15); color: #4ade80; }
.gc-status-alert    { background: rgba(248,113,113,0.15); color: #f87171; }

.iot-feed {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.iot-event {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.iot-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}
.iot-green  { background: #4ade80; }
.iot-yellow { background: #facc15; }
.iot-red    { background: #f87171; }

.iot-msg  { font-size: 0.8rem; color: var(--gc-text-primary); }
.iot-time { font-size: 0.72rem; color: var(--gc-text-muted); margin-top: 0.1rem; }

.gc-alert-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  margin-bottom: 0.4rem;
}
.gc-alert-critical { background: rgba(248,113,113,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.25); }
.gc-alert-warning  { background: rgba(250,204,21,0.12);  color: #facc15; border: 1px solid rgba(250,204,21,0.25); }
.gc-alert-ok       { background: rgba(74,222,128,0.1);   color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }

@media (max-width: 1100px) {
  .gc-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .gc-two-col  { flex-direction: column; }
  .gc-iot-panel { width: 100%; }
}
</style>
