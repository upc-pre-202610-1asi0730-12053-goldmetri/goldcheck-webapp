<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { monitoringApi } from '../../../infrastructure/monitoring-api.js'

const { t } = useI18n()

// Preset coordinates: one inside the allowed polygon, one outside (deviation).
const PRESETS = {
  onRoute:  { latitude: -13.6000, longitude: -72.0500 },
  offRoute: { latitude: -12.9000, longitude: -71.0000 },
}

const inTransitBatches = ref([])
const selectedBatchId  = ref(null)
const preset           = ref('onRoute')
const timeLimit        = ref(30)
const alerts           = ref([])
const feedback         = ref('')
const feedbackType     = ref('')
const loading          = ref(false)

onMounted(async () => {
  try {
    const res = await monitoringApi.getActiveCycles()
    inTransitBatches.value = (res.data || [])
      .filter(c => (c.status ?? c.Status) === 'InTransit')
      .map(c => ({ id: c.id ?? c.Id, code: `HC-${c.id ?? c.Id}`, vehicle: c.vehicleId ?? c.VehicleId }))
  } catch { inTransitBatches.value = [] }
})

watch(selectedBatchId, (id) => { loadAlerts(id) })

async function loadAlerts(batchId) {
  if (!batchId) { alerts.value = []; return }
  try {
    const res = await monitoringApi.getRouteAlerts(batchId)
    alerts.value = (res.data || []).map(mapAlert)
  } catch { alerts.value = [] }
}

function mapAlert(a) {
  return {
    id: a.id ?? a.Id,
    type: a.alertType ?? a.AlertType,
    risk: a.riskLevel ?? a.RiskLevel,
    message: a.message ?? a.Message,
    createdAt: a.createdAt ?? a.CreatedAt,
  }
}

async function evaluate() {
  feedback.value = ''
  if (!selectedBatchId.value) { feedback.value = t('monitoring.raSelectError'); feedbackType.value = 'error'; return }

  loading.value = true
  const coords = PRESETS[preset.value]
  try {
    const res = await monitoringApi.evaluateRoute({
      BatchId: String(selectedBatchId.value),
      Latitude: coords.latitude,
      Longitude: coords.longitude,
      TimeLimitMinutes: Number(timeLimit.value),
    })
    const raised = (res.data?.alerts ?? res.data?.Alerts ?? []).map(mapAlert)
    if (raised.length) {
      feedback.value = t('monitoring.raRaised', { count: raised.length }); feedbackType.value = 'warn'
    } else {
      feedback.value = t('monitoring.raNone'); feedbackType.value = 'success'
    }
    await loadAlerts(selectedBatchId.value)
  } catch (e) {
    feedback.value = e?.response?.status === 409 ? t('monitoring.raNotInTransit') : t('monitoring.raError')
    feedbackType.value = 'error'
  } finally {
    loading.value = false
  }
}

const criticalCount = computed(() => alerts.value.filter(a => a.risk === 'Critical').length)

function fmt(iso) { return iso ? new Date(iso).toLocaleString() : '—' }
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('monitoring.raTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('monitoring.raSubtitle') }}</p>
      </div>
    </div>

    <div v-if="feedback" class="gc-alert" :class="`gc-alert-${feedbackType}`">{{ feedback }}</div>

    <div class="gc-card">
      <div class="form-field">
        <label>{{ $t('monitoring.raBatch') }}</label>
        <select v-model="selectedBatchId" class="gc-input-dark">
          <option :value="null" disabled>{{ $t('monitoring.raBatchPh') }}</option>
          <option v-for="b in inTransitBatches" :key="b.id" :value="b.id">{{ b.code }} — {{ b.vehicle }}</option>
        </select>
        <p v-if="!inTransitBatches.length" class="hint">{{ $t('monitoring.raNoBatches') }}</p>
      </div>

      <div class="form-field">
        <label>{{ $t('monitoring.raPosition') }}</label>
        <div class="radio-row">
          <label class="radio"><input type="radio" value="onRoute" v-model="preset" /> {{ $t('monitoring.raOnRoute') }}</label>
          <label class="radio"><input type="radio" value="offRoute" v-model="preset" /> {{ $t('monitoring.raOffRoute') }}</label>
        </div>
      </div>

      <div class="form-field">
        <label>{{ $t('monitoring.raTimeLimit') }}</label>
        <input v-model.number="timeLimit" type="number" min="0" class="gc-input-dark" style="max-width:160px" />
        <p class="hint">{{ $t('monitoring.raTimeLimitHint') }}</p>
      </div>

      <div class="actions">
        <button class="gc-btn gc-btn-gold" :disabled="loading" @click="evaluate">
          <i v-if="loading" class="pi pi-spin pi-spinner" />
          <i v-else class="pi pi-bolt" />
          {{ $t('monitoring.raEvaluate') }}
        </button>
      </div>
    </div>

    <div class="gc-card" style="margin-top:1.5rem" v-if="alerts.length">
      <p class="gc-section-title">
        {{ $t('monitoring.raListTitle') }}
        <span v-if="criticalCount" class="crit-count">{{ $t('monitoring.raCritical', { count: criticalCount }) }}</span>
      </p>
      <table class="gc-table">
        <thead>
          <tr>
            <th>{{ $t('monitoring.raColType') }}</th>
            <th>{{ $t('monitoring.raColRisk') }}</th>
            <th>{{ $t('monitoring.raColMessage') }}</th>
            <th>{{ $t('monitoring.raColTime') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in alerts" :key="a.id">
            <td>
              <span class="type-chip" :class="a.type === 'Deviation' ? 'chip-dev' : 'chip-delay'">
                {{ a.type === 'Deviation' ? $t('monitoring.raTypeDeviation') : $t('monitoring.raTypeDelay') }}
              </span>
            </td>
            <td>
              <span class="risk-chip" :class="a.risk === 'Critical' ? 'risk-crit' : 'risk-med'">{{ a.risk }}</span>
            </td>
            <td>{{ a.message }}</td>
            <td>{{ fmt(a.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; max-width: 640px; }
.gc-section-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem; }
.crit-count { font-size: 0.75rem; font-weight: 700; color: #ef4444; background: rgba(239,68,68,.12); padding: 0.15rem 0.5rem; border-radius: 12px; }

.form-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
.form-field label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.gc-input-dark { width: 100%; box-sizing: border-box; padding: 0.6rem 0.8rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; }
.gc-input-dark:focus { outline: none; border-color: var(--gc-gold-mid); }
.hint { font-size: 0.76rem; color: var(--gc-text-muted); margin: 0; }

.radio-row { display: flex; gap: 1.25rem; }
.radio { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--gc-text-primary); cursor: pointer; text-transform: none; letter-spacing: 0; font-weight: 400; }

.actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--gc-border); }
.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-gold { background: var(--gc-gold-mid); color: #000; }
.gc-btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }

.gc-table { width: 100%; border-collapse: collapse; }
.gc-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-text-muted); padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--gc-border); }
.gc-table td { padding: 0.6rem 0.75rem; font-size: 0.85rem; color: var(--gc-text-primary); border-bottom: 1px solid var(--gc-border); }
.type-chip, .risk-chip { font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
.chip-dev { background: rgba(239,68,68,.15); color: #ef4444; }
.chip-delay { background: rgba(234,179,8,.15); color: #eab308; }
.risk-crit { background: rgba(239,68,68,.15); color: #ef4444; }
.risk-med { background: rgba(234,179,8,.15); color: #eab308; }

.gc-alert { padding: 0.7rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.gc-alert-success { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
.gc-alert-warn { background: rgba(234,179,8,.12); color: #eab308; border: 1px solid rgba(234,179,8,.3); }
.gc-alert-error { background: rgba(239,68,68,.1); color: #ef4444; border: 1px solid rgba(239,68,68,.25); }
</style>
