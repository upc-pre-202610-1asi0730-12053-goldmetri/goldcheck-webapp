<script setup>
import { reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMineralStore } from '../../../application/mineral.store.js'

const { t } = useI18n()
const store = useMineralStore()
onMounted(() => store.fetchBatches())

// US20 – Confirmación de Llegada. Preset GPS positions: inside vs outside the plant geofence.
const PLANT_PRESETS = {
  inside:  { latitude: -13.6200, longitude: -72.0500 },
  outside: { latitude: -12.9000, longitude: -71.0000 },
}

const arrivalModal = reactive({ show: false, batchId: null, batchCode: '', position: 'inside', error: '', loading: false })

function openArrivalModal(b) {
  arrivalModal.batchId = b.id
  arrivalModal.batchCode = b.batchCode
  arrivalModal.position = 'inside'
  arrivalModal.error = ''
  arrivalModal.show = true
}

async function submitArrival() {
  arrivalModal.error = ''
  arrivalModal.loading = true
  const coords = PLANT_PRESETS[arrivalModal.position]
  const res = await store.confirmArrival(arrivalModal.batchId, coords.latitude, coords.longitude)
  arrivalModal.loading = false
  if (res.ok) {
    arrivalModal.show = false
  } else {
    arrivalModal.error = store.errors[0] === 'outsideGeofence'
      ? t('mineral.arrivalOutsideGeofence')
      : t('mineral.arrivalError')
  }
}

function statusClass(s) {
  if (s === 'Completado') return 'badge-ok'
  if (s === 'Alerta') return 'badge-danger'
  if (s === 'En Tránsito') return 'badge-transit'
  return 'badge-warning'
}

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
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('mineral.operationsTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('mineral.operationsSubtitle') }}</p>
      </div>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-stats-row">
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('mineral.activeBatches') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-gold-mid)">{{ store.activeBatchCount }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('mineral.tonsToday') }}</p>
          <p class="gc-stat-value">{{ store.totalTonsToday }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('mineral.routeAlerts') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-danger)">{{ store.alertCount }}</p>
        </div>
      </div>

      <div class="gc-card" style="margin-top:1.5rem">
        <p class="gc-section-title">{{ $t('mineral.batchTracking') }}</p>
        <table class="gc-table" v-if="store.batches.length">
          <thead>
            <tr>
              <th>{{ $t('mineral.colBatchId') }}</th>
              <th>{{ $t('mineral.colVehicle') }}</th>
              <th>{{ $t('mineral.colWeight') }}</th>
              <th>{{ $t('mineral.colLocation') }}</th>
              <th>{{ $t('mineral.colStatus') }}</th>
              <th>{{ $t('mineral.colAction') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in store.batches" :key="b.id">
              <td>{{ b.batchCode }}</td>
              <td>{{ b.vehicleName || b.vehicleId }}</td>
              <td>{{ b.initialWeight ? `${b.initialWeight} t` : '—' }}</td>
              <td>{{ b.destination || b.depositName || '—' }}</td>
              <td>
                <span class="gc-badge" :class="statusClass(b.status)">{{ translateStatus(b.status) }}</span>
              </td>
              <td>
                <button
                  v-if="b.status === 'En Tránsito'"
                  class="gc-btn gc-btn-gold"
                  style="font-size:0.75rem;padding:0.3rem 0.8rem"
                  @click="openArrivalModal(b)"
                >{{ $t('mineral.confirmArrival') }}</button>
                <span v-else style="color:var(--gc-text-muted);font-size:0.8rem">—</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('mineral.noBatches') }}
        </p>
      </div>
    </template>

    <div v-if="arrivalModal.show" class="gc-modal-overlay" @click.self="arrivalModal.show = false">
      <div class="gc-modal" style="max-width:420px">
        <div class="gc-modal-header">
          <p class="gc-modal-title">
            <i class="pi pi-map-marker" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('mineral.arrivalTitle') }}
          </p>
          <button class="gc-modal-close" @click="arrivalModal.show = false">✕</button>
        </div>
        <div style="padding:1rem 0">
          <p style="font-size:0.83rem;color:var(--gc-text-muted);margin-bottom:1rem">
            {{ $t('mineral.arrivalDesc', { batch: arrivalModal.batchCode }) }}
          </p>
          <label class="gc-label">{{ $t('mineral.arrivalPosition') }}</label>
          <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.4rem">
            <label class="radio"><input type="radio" value="inside" v-model="arrivalModal.position" /> {{ $t('mineral.arrivalInside') }}</label>
            <label class="radio"><input type="radio" value="outside" v-model="arrivalModal.position" /> {{ $t('mineral.arrivalOutside') }}</label>
          </div>
          <p v-if="arrivalModal.error" class="gc-error-msg" style="margin-top:0.75rem">{{ arrivalModal.error }}</p>
        </div>
        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="arrivalModal.show = false">{{ $t('mineral.cancel') }}</button>
          <button class="gc-btn gc-btn-gold" :disabled="arrivalModal.loading" @click="submitArrival">
            <i v-if="arrivalModal.loading" class="pi pi-spin pi-spinner" />
            {{ $t('mineral.arrivalConfirm') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.radio { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--gc-text-primary); cursor: pointer; }
.gc-stats-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.gc-stat-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 10px; padding: 1.25rem 2rem; min-width: 160px; }
.gc-stat-label { font-size: 0.75rem; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .35rem; }
.gc-stat-value { font-size: 1.8rem; font-weight: 800; color: var(--gc-text-primary); }
.gc-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
.badge-ok      { background: rgba(74,222,128,.15); color: #4ade80; }
.badge-transit { background: rgba(59,130,246,.15);  color: #3b82f6; }
.badge-warning { background: rgba(178,148,78,.15);  color: var(--gc-gold-mid); }
.badge-danger  { background: rgba(239,68,68,.15);   color: #ef4444; }
.gc-label { display:block; font-size:0.8rem; color:var(--gc-text-muted); margin-bottom:0.4rem; }
.gc-input { width:100%; padding:0.6rem 0.8rem; background:var(--gc-surface); border:1px solid var(--gc-border); border-radius:8px; color:var(--gc-text-primary); font-size:0.9rem; }
</style>
