<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIncidentManagementStore } from '../../../application/incident-management.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'

const { t, locale } = useI18n()
const store     = useIncidentManagementStore()
const showModal = ref(false)

const form      = reactive({ description: '' })
const formError = ref('')
const submitSuccess = ref(false)

function openModal() {
  form.description  = ''
  formError.value   = ''
  submitSuccess.value = false
  showModal.value   = true
}

async function submitAccident() {
  formError.value = ''
  if (!form.description.trim()) { formError.value = t('incidents.fieldRequired'); return }

  const ok = await store.createIncident({ description: form.description.trim() })
  if (ok) {
    submitSuccess.value = true
    setTimeout(() => { showModal.value = false; submitSuccess.value = false }, 1400)
  } else {
    formError.value = t('incidents.createError')
  }
}

function severityClass(s) {
  const u = s?.toUpperCase()
  return { 'badge-danger': u === 'CRITICAL' || u === 'HIGH', 'badge-warn': u === 'MEDIUM' || u === 'WARNING', 'badge-info': u === 'LOW' }
}

function translateSeverity(s) {
  const map = { critical: t('incidents.severityCritical'), warning: t('incidents.severityWarning'), low: t('incidents.severityLow') }
  return map[s?.toLowerCase()] || s || '—'
}

function translateStatus(s) {
  const map = { 'Abierto': t('incidents.statusOpen'), 'Cerrado': t('incidents.statusClosed'), 'Resuelta': t('incidents.statusClosed') }
  return map[s] || s || '—'
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(locale.value === 'es' ? 'es-PE' : 'en-US')
}

onMounted(() => store.fetchIncidents())
</script>

<template>
  <div class="gc-page">
    <div class="page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('incidents.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('incidents.dashboardSubtitle') }}</p>
      </div>
      <button class="btn-gold" @click="openModal">
        <i class="pi pi-plus" /> {{ $t('incidents.reportAccident') }}
      </button>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="kpi-grid">
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
              <th>{{ $t('incidents.colDescription') }}</th>
              <th>{{ $t('incidents.colStatus') }}</th>
              <th>{{ $t('incidents.colDate') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inc in store.incidents" :key="inc.id">
              <td>{{ $t('incidents.typeAccident') }}</td>
              <td>
                <span class="gc-badge" :class="severityClass(inc.severity)">{{ translateSeverity(inc.severity) }}</span>
              </td>
              <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ inc.description || '—' }}</td>
              <td>{{ translateStatus(inc.status) }}</td>
              <td>{{ formatDate(inc.reportedAt) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          <i class="pi pi-shield" style="font-size:2rem;color:var(--gc-text-muted);margin-bottom:.75rem" />
          <p>{{ $t('incidents.noAccidents') }}</p>
        </div>
      </div>
    </template>

    <!-- Report Accident Modal -->
    <div v-if="showModal" class="overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">
            <i class="pi pi-exclamation-triangle" style="color:var(--gc-danger);margin-right:.4rem" />
            {{ $t('incidents.accidentModalTitle') }}
          </span>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>

        <div class="modal-body">
          <div v-if="submitSuccess" class="alert-success">
            <i class="pi pi-check-circle" /> {{ $t('incidents.accidentReported') }}
          </div>
          <template v-else>
            <p style="font-size:.82rem;color:var(--gc-text-muted);margin-bottom:1rem">
              {{ $t('incidents.accidentDesc') }}
            </p>
            <div class="field">
              <label>{{ $t('incidents.accidentDescLabel') }} <span style="color:var(--gc-danger)">*</span></label>
              <textarea v-model="form.description" class="inp" rows="4" :placeholder="$t('incidents.accidentPlaceholder')" />
              <span v-if="formError" class="err">{{ formError }}</span>
            </div>
          </template>
        </div>

        <div class="modal-footer">
          <button class="btn-outline" @click="showModal = false">{{ $t('common.cancel') }}</button>
          <button v-if="!submitSuccess" class="btn-danger" :disabled="store.loading" @click="submitAccident">
            <i v-if="store.loading" class="pi pi-spin pi-spinner" />
            {{ $t('incidents.report') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
.kpi-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; margin-bottom:1.5rem; }

.gc-badge { font-size:.7rem; font-weight:700; padding:.2rem .6rem; border-radius:20px; text-transform:uppercase; }
.badge-danger { background:rgba(239,68,68,.15); color:#ef4444; }
.badge-warn   { background:rgba(234,179,8,.15);  color:#eab308; }
.badge-info   { background:rgba(59,130,246,.15); color:#3b82f6; }

.empty-state { text-align:center; padding:3rem 1rem; color:var(--gc-text-muted); }

.btn-gold    { display:inline-flex; align-items:center; gap:.4rem; padding:.5rem 1rem; border-radius:8px; font-size:.84rem; font-weight:600; cursor:pointer; border:none; background:var(--gc-gold-mid); color:#000; }
.btn-gold:hover { opacity:.88; }
.btn-outline { display:inline-flex; align-items:center; gap:.4rem; padding:.5rem 1rem; border-radius:8px; font-size:.84rem; font-weight:600; cursor:pointer; background:transparent; border:1px solid var(--gc-border); color:var(--gc-text-secondary); }
.btn-outline:hover { border-color:var(--gc-gold-mid); color:var(--gc-text-primary); }
.btn-danger  { display:inline-flex; align-items:center; gap:.4rem; padding:.5rem 1rem; border-radius:8px; font-size:.84rem; font-weight:600; cursor:pointer; background:rgba(239,68,68,.9); color:#fff; border:none; }
.btn-danger:hover { background:#ef4444; }
.btn-danger:disabled { opacity:.5; cursor:not-allowed; }

.overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:999; }
.modal { background:var(--gc-dark-card); border:1px solid var(--gc-border); border-radius:14px; padding:1.5rem; width:90%; max-width:480px; }
.modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.75rem; }
.modal-title { font-size:.95rem; font-weight:700; color:var(--gc-text-primary); display:flex; align-items:center; }
.modal-close { background:none; border:none; color:var(--gc-text-muted); font-size:1rem; cursor:pointer; }
.modal-body { padding:.25rem 0 .5rem; }
.modal-footer { display:flex; justify-content:flex-end; gap:.75rem; margin-top:1rem; padding-top:1rem; border-top:1px solid var(--gc-border); }

.field { display:flex; flex-direction:column; gap:.3rem; margin-bottom:.9rem; }
.field label { font-size:.75rem; font-weight:600; color:var(--gc-text-muted); text-transform:uppercase; letter-spacing:.05em; }
.inp { padding:.6rem .8rem; background:var(--gc-dark-2); border:1px solid var(--gc-border); border-radius:8px; color:var(--gc-text-primary); font-size:.9rem; width:100%; box-sizing:border-box; font-family:inherit; resize:vertical; }
.inp:focus { outline:none; border-color:var(--gc-gold-mid); }
.err { font-size:.74rem; color:var(--gc-danger); }
.alert-success { background:rgba(74,222,128,.1); color:#4ade80; border:1px solid rgba(74,222,128,.25); padding:.6rem .9rem; border-radius:6px; font-size:.85rem; display:flex; align-items:center; gap:.5rem; }
</style>
