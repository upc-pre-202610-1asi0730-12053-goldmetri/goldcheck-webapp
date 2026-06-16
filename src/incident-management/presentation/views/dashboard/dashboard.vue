<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIncidentManagementStore } from '../../../application/incident-management.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'

const { t, locale } = useI18n()
const store     = useIncidentManagementStore()
const showModal = ref(false)

const form = reactive({ type: '', severity: '', message: '', batchId: '' })
const formErrors = reactive({ type: false, severity: false, message: false })
const submitSuccess = ref(false)

const incidentTypes = [
  { value: 'ROUTE_DEVIATION', labelKey: 'incidents.typeRouteDeviation' },
  { value: 'DELAY',           labelKey: 'incidents.typeDelay' },
  { value: 'WEIGHT_DISCREPANCY', labelKey: 'incidents.typeWeightDiscrepancy' },
  { value: 'OTHER',           labelKey: 'incidents.typeOther' },
]

const severityLevels = [
  { value: 'critical', labelKey: 'incidents.severityCritical' },
  { value: 'warning',  labelKey: 'incidents.severityWarning' },
  { value: 'low',      labelKey: 'incidents.severityLow' },
]

function openModal() {
  form.type = ''; form.severity = ''; form.message = ''; form.batchId = ''
  formErrors.type = false; formErrors.severity = false; formErrors.message = false
  submitSuccess.value = false
  showModal.value = true
}

async function submitIncident() {
  formErrors.type    = !form.type
  formErrors.severity = !form.severity
  formErrors.message = !form.message.trim()
  if (formErrors.type || formErrors.severity || formErrors.message) return

  const ok = await store.createIncident({
    type: form.type,
    severity: form.severity,
    message: form.message.trim(),
    batchId: form.batchId ? Number(form.batchId) : null,
  })
  if (ok) {
    submitSuccess.value = true
    setTimeout(() => { showModal.value = false }, 1200)
  }
}

function severityClass(s) {
  const u = s?.toUpperCase()
  return { 'badge-danger': u === 'CRITICAL' || u === 'HIGH', 'badge-warning': u === 'MEDIUM' || u === 'WARNING', 'badge-info': u === 'LOW' }
}

function translateSeverity(s) {
  const map = {
    'critical': t('incidents.severityCritical'),
    'warning':  t('incidents.severityWarning'),
    'low':      t('incidents.severityLow'),
  }
  return map[s?.toLowerCase()] || s || '—'
}

function translateStatus(s) {
  const map = {
    'Abierto': t('incidents.statusOpen'),
    'Cerrado': t('incidents.statusClosed'),
  }
  return map[s] || s || '—'
}

function translateIncidentType(type) {
  const found = incidentTypes.find(x => x.value === type)
  return found ? t(found.labelKey) : (type || '—')
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(locale.value === 'es' ? 'es-PE' : 'en-US')
}

onMounted(() => store.fetchIncidents())
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('incidents.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('incidents.dashboardSubtitle') }}</p>
      </div>
      <button class="gc-btn gc-btn-gold" @click="openModal()">
        <i class="pi pi-plus" /> {{ $t('incidents.newIncident') }}
      </button>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-kpi-grid">
        <StatCard :label="$t('incidents.openCount')" :value="store.openCount" icon="pi pi-folder-open" trend="" :alert-active="store.openCount > 0" />
        <StatCard :label="$t('incidents.criticalCount')" :value="store.criticalIncidents.length" icon="pi pi-exclamation-circle" trend="" :alert-active="store.criticalIncidents.length > 0" />
      </div>

      <div class="gc-card" style="margin-top:1.5rem">
        <p class="gc-section-title">{{ $t('incidents.listTitle') }}</p>
        <table class="gc-table" v-if="store.incidents.length">
          <thead>
            <tr>
              <th>{{ $t('incidents.colType') }}</th>
              <th>{{ $t('incidents.colSeverity') }}</th>
              <th>{{ $t('incidents.colStatus') }}</th>
              <th>{{ $t('incidents.colDate') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inc in store.incidents" :key="inc.id">
              <td>{{ translateIncidentType(inc.incidentType) }}</td>
              <td>
                <span class="gc-badge" :class="severityClass(inc.severity)">{{ translateSeverity(inc.severity) }}</span>
              </td>
              <td>{{ translateStatus(inc.status) }}</td>
              <td>{{ formatDate(inc.reportedAt) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('incidents.noIncidents') }}
        </p>
      </div>
    </template>

    <div v-if="showModal" class="gc-modal-overlay" @click.self="showModal = false">
      <div class="gc-modal" style="max-width:460px">
        <div class="gc-modal-header">
          <p class="gc-modal-title">
            <i class="pi pi-exclamation-triangle" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('incidents.newIncident') }}
          </p>
          <button class="gc-modal-close" @click="showModal = false">✕</button>
        </div>

        <div v-if="submitSuccess" style="text-align:center;padding:1.5rem 0">
          <i class="pi pi-check-circle" style="font-size:2rem;color:#4ade80;display:block;margin-bottom:0.5rem" />
          <p style="color:#4ade80;font-size:0.9rem">{{ $t('incidents.createSuccess') }}</p>
        </div>

        <div v-else style="padding:0.5rem 0">
          <div class="inc-field">
            <label class="inc-label">{{ $t('incidents.formType') }}</label>
            <select class="gc-select" v-model="form.type">
              <option value="" disabled>{{ $t('incidents.selectType') }}</option>
              <option v-for="it in incidentTypes" :key="it.value" :value="it.value">{{ $t(it.labelKey) }}</option>
            </select>
            <span v-if="formErrors.type" class="inc-error">{{ $t('incidents.fieldRequired') }}</span>
          </div>

          <div class="inc-field">
            <label class="inc-label">{{ $t('incidents.formSeverity') }}</label>
            <select class="gc-select" v-model="form.severity">
              <option value="" disabled>{{ $t('incidents.selectSeverity') }}</option>
              <option v-for="sl in severityLevels" :key="sl.value" :value="sl.value">{{ $t(sl.labelKey) }}</option>
            </select>
            <span v-if="formErrors.severity" class="inc-error">{{ $t('incidents.fieldRequired') }}</span>
          </div>

          <div class="inc-field">
            <label class="inc-label">{{ $t('incidents.formMessage') }}</label>
            <textarea class="gc-textarea" v-model="form.message" rows="3" />
            <span v-if="formErrors.message" class="inc-error">{{ $t('incidents.fieldRequired') }}</span>
          </div>

          <div class="inc-field">
            <label class="inc-label">{{ $t('incidents.formBatchId') }}</label>
            <input class="gc-input" type="number" v-model="form.batchId" min="1" />
          </div>

          <p v-if="store.errors.length" style="color:var(--gc-danger);font-size:0.8rem;margin-top:0.5rem">
            {{ store.errors[0] }}
          </p>
        </div>

        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="showModal = false">{{ $t('common.cancel') }}</button>
          <button v-if="!submitSuccess" class="gc-btn gc-btn-gold" @click="submitIncident">{{ $t('common.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gc-kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.gc-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
.badge-danger  { background: rgba(239,68,68,.15); color: #ef4444; }
.badge-warning { background: rgba(234,179,8,.15);  color: #eab308; }
.badge-info    { background: rgba(59,130,246,.15); color: #3b82f6; }

.inc-field  { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.9rem; }
.inc-label  { font-size: 0.78rem; font-weight: 600; color: var(--gc-text-muted); letter-spacing: 0.03em; }
.inc-error  { font-size: 0.75rem; color: var(--gc-danger); }
.gc-select  { width: 100%; padding: 0.6rem 0.8rem; background: var(--gc-surface); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; }
.gc-textarea { width: 100%; padding: 0.6rem 0.8rem; background: var(--gc-surface); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; resize: vertical; font-family: inherit; }
.gc-input   { width: 100%; padding: 0.6rem 0.8rem; background: var(--gc-surface); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; }
</style>
