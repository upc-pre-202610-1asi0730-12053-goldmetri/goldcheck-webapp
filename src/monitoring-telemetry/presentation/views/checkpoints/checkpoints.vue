<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCheckpointStore } from '../../../application/checkpoint.store.js'
import { monitoringApi } from '../../../infrastructure/monitoring-api.js'

const { t } = useI18n()
const store = useCheckpointStore()

// Predefined route control points (client provides the matched control — US18 decision).
const CONTROL_POINTS = [
  { name: 'CP-1 Peaje Norte',     latitude: -13.5320, longitude: -71.9670 },
  { name: 'CP-2 Cruce Río Apurímac', latitude: -13.6100, longitude: -72.0500 },
  { name: 'CP-3 Estación Andes',  latitude: -13.7000, longitude: -72.1800 },
  { name: 'CP-4 Planta Sur',      latitude: -13.8200, longitude: -72.2600 },
]

const inTransitBatches = ref([])
const selectedBatchId  = ref(null)
const selectedControl  = ref('')
const feedback         = ref('')
const feedbackType     = ref('') // success | warn | error

onMounted(async () => {
  try {
    const res = await monitoringApi.getActiveCycles()
    inTransitBatches.value = (res.data || [])
      .filter(c => (c.status ?? c.Status) === 'InTransit')
      .map(c => ({ id: c.id ?? c.Id, code: `HC-${c.id ?? c.Id}`, vehicle: c.vehicleId ?? c.VehicleId }))
  } catch { inTransitBatches.value = [] }
})

watch(selectedBatchId, (id) => { store.fetchCheckpoints(id) })

const controlObj = computed(() => CONTROL_POINTS.find(c => c.name === selectedControl.value) || null)

async function register() {
  feedback.value = ''
  if (!selectedBatchId.value) { feedback.value = t('monitoring.cpSelectBatchError'); feedbackType.value = 'error'; return }
  if (!controlObj.value) { feedback.value = t('monitoring.cpSelectControlError'); feedbackType.value = 'error'; return }

  const res = await store.registerCheckpoint(
    selectedBatchId.value, controlObj.value.name, controlObj.value.latitude, controlObj.value.longitude
  )

  if (res.ok && res.queued) {
    feedback.value = t('monitoring.cpQueued'); feedbackType.value = 'warn'
  } else if (res.ok) {
    feedback.value = t('monitoring.cpSaved'); feedbackType.value = 'success'
  } else {
    feedback.value = store.errors[0] === 'notInTransit' ? t('monitoring.cpNotInTransit') : t('monitoring.cpError')
    feedbackType.value = 'error'
  }
}

async function sync() {
  const res = await store.syncPending(selectedBatchId.value)
  if (res.ok) { feedback.value = t('monitoring.cpSynced', { count: res.synced }); feedbackType.value = 'success' }
  else { feedback.value = t('monitoring.cpSyncError'); feedbackType.value = 'error' }
}

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('monitoring.cpTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('monitoring.cpSubtitle') }}</p>
      </div>
      <button class="conn-toggle" :class="{ off: store.offline }" @click="store.toggleOffline()">
        <i :class="store.offline ? 'pi pi-wifi-off' : 'pi pi-wifi'" />
        {{ store.offline ? $t('monitoring.cpOffline') : $t('monitoring.cpOnline') }}
      </button>
    </div>

    <div v-if="feedback" class="gc-alert" :class="`gc-alert-${feedbackType}`">{{ feedback }}</div>

    <div class="gc-card">
      <div class="form-field">
        <label>{{ $t('monitoring.cpBatch') }}</label>
        <select v-model="selectedBatchId" class="gc-input-dark">
          <option :value="null" disabled>{{ $t('monitoring.cpBatchPh') }}</option>
          <option v-for="b in inTransitBatches" :key="b.id" :value="b.id">{{ b.code }} — {{ b.vehicle }}</option>
        </select>
        <p v-if="!inTransitBatches.length" class="hint">{{ $t('monitoring.cpNoBatches') }}</p>
      </div>

      <div class="form-field">
        <label>{{ $t('monitoring.cpControl') }}</label>
        <select v-model="selectedControl" class="gc-input-dark">
          <option value="" disabled>{{ $t('monitoring.cpControlPh') }}</option>
          <option v-for="c in CONTROL_POINTS" :key="c.name" :value="c.name">{{ c.name }}</option>
        </select>
        <p v-if="controlObj" class="hint">{{ controlObj.latitude }}, {{ controlObj.longitude }}</p>
      </div>

      <div class="actions">
        <button v-if="store.pendingCount" class="gc-btn gc-btn-outline" :disabled="store.loading" @click="sync">
          <i class="pi pi-sync" /> {{ $t('monitoring.cpSync', { count: store.pendingCount }) }}
        </button>
        <button class="gc-btn gc-btn-gold" @click="register">
          <i class="pi pi-map-marker" /> {{ $t('monitoring.cpRegister') }}
        </button>
      </div>
    </div>

    <div class="gc-card" style="margin-top:1.5rem" v-if="store.pendingCount">
      <p class="gc-section-title">{{ $t('monitoring.cpPendingTitle', { count: store.pendingCount }) }}</p>
      <ul class="pending-list">
        <li v-for="(p, i) in store.pending" :key="i">
          <i class="pi pi-clock" /> {{ p.ControlPointName }} — HC-{{ p.BatchId }}
        </li>
      </ul>
    </div>

    <div class="gc-card" style="margin-top:1.5rem" v-if="store.checkpoints.length">
      <p class="gc-section-title">{{ $t('monitoring.cpListTitle') }}</p>
      <table class="gc-table">
        <thead>
          <tr>
            <th>{{ $t('monitoring.cpColControl') }}</th>
            <th>{{ $t('monitoring.cpColCoords') }}</th>
            <th>{{ $t('monitoring.cpColTime') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in store.checkpoints" :key="c.id">
            <td><span class="cp-chip">{{ c.controlPointName }}</span></td>
            <td>{{ c.latitude }}, {{ c.longitude }}</td>
            <td>{{ fmt(c.recordedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; max-width: 640px; }
.gc-section-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1rem; }

.conn-toggle { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.9rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; background: rgba(74,222,128,.12); color: #4ade80; border: 1px solid rgba(74,222,128,.3); }
.conn-toggle.off { background: rgba(239,68,68,.12); color: #ef4444; border-color: rgba(239,68,68,.3); }

.form-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
.form-field label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.gc-input-dark { width: 100%; box-sizing: border-box; padding: 0.6rem 0.8rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; }
.gc-input-dark:focus { outline: none; border-color: var(--gc-gold-mid); }
.hint { font-size: 0.76rem; color: var(--gc-text-muted); margin: 0; }

.actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--gc-border); }
.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-gold { background: var(--gc-gold-mid); color: #000; }
.gc-btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }
.gc-btn-outline { background: transparent; border: 1px solid var(--gc-border); color: var(--gc-text-secondary); }
.gc-btn-outline:hover { border-color: var(--gc-gold-mid); color: var(--gc-text-primary); }

.pending-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.pending-list li { display: flex; align-items: center; gap: 0.5rem; font-size: 0.83rem; color: var(--gc-gold-mid); }

.gc-table { width: 100%; border-collapse: collapse; }
.gc-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-text-muted); padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--gc-border); }
.gc-table td { padding: 0.6rem 0.75rem; font-size: 0.85rem; color: var(--gc-text-primary); border-bottom: 1px solid var(--gc-border); }
.cp-chip { background: rgba(59,130,246,.15); color: #3b82f6; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }

.gc-alert { padding: 0.7rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.gc-alert-success { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
.gc-alert-warn { background: rgba(234,179,8,.12); color: #eab308; border: 1px solid rgba(234,179,8,.3); }
.gc-alert-error { background: rgba(239,68,68,.1); color: #ef4444; border: 1px solid rgba(239,68,68,.25); }
</style>
