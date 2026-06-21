<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMaterialOperationsStore } from '../../../application/material-operations.store.js'
import { useIamStore } from '../../../../iam/application/iam.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'

const { t } = useI18n()
const store    = useMaterialOperationsStore()
const iamStore = useIamStore()

// User's hauling cycle IDs for batch selector
const userCycleIds = computed(() => {
  const userId = iamStore.currentUser?.userId
  if (!userId) return []
  try { return JSON.parse(localStorage.getItem(`gc_cycles_${userId}`) || '[]') } catch { return [] }
})

// Batch IDs that already have a material entry
const registeredBatchIds = computed(() => store.receptions.map(r => String(r.batchId)))

// Available batches for identify mineral (not yet registered)
const availableBatchIds = computed(() =>
  userCycleIds.value.filter(id => !registeredBatchIds.value.includes(String(id)))
)

const MINERAL_TYPES = ['Gold', 'Silver', 'Copper']

// ── Identify Mineral Modal ────────────────────────────────────────────────────
const showIdentifyModal = ref(false)
const identifyForm      = reactive({ batchId: '', mineralType: '', payloadTons: '' })
const identifyErrors    = reactive({ batchId: '', mineralType: '', payloadTons: '' })
const identifySuccess   = ref(false)

function openIdentifyModal() {
  identifyForm.batchId     = availableBatchIds.value[0] ? String(availableBatchIds.value[0]) : ''
  identifyForm.mineralType = ''
  identifyForm.payloadTons = ''
  identifyErrors.batchId   = ''; identifyErrors.mineralType = ''; identifyErrors.payloadTons = ''
  identifySuccess.value    = false
  showIdentifyModal.value  = true
}

async function submitIdentify() {
  identifyErrors.batchId     = identifyForm.batchId     ? '' : t('materialOps.batchIdRequired')
  identifyErrors.mineralType = identifyForm.mineralType ? '' : t('materialOps.mineralTypeRequired')
  identifyErrors.payloadTons = Number(identifyForm.payloadTons) > 0 ? '' : t('materialOps.payloadRequired')
  if (identifyErrors.batchId || identifyErrors.mineralType || identifyErrors.payloadTons) return

  const ok = await store.identifyMineral(
    String(identifyForm.batchId),
    identifyForm.mineralType,
    Number(identifyForm.payloadTons)
  )
  if (ok) {
    identifySuccess.value = true
    setTimeout(() => { showIdentifyModal.value = false; identifySuccess.value = false }, 1400)
  } else {
    identifyErrors.batchId = store.errors.includes('materialExists')
      ? t('materialOps.materialExists')
      : t('materialOps.identifyError')
  }
}

// ── Weight Modal ──────────────────────────────────────────────────────────────
const weightModal = reactive({ show: false, batchId: null, initialWeight: 0, value: null })

function openWeightModal(r) {
  weightModal.batchId       = r.batchId
  weightModal.initialWeight = r.initialWeight
  weightModal.value         = null
  weightModal.show          = true
}

async function submitWeight() {
  const ok = await store.registerFinalWeight(weightModal.batchId, weightModal.value)
  if (ok) weightModal.show = false
}

function translateMineralType(type) {
  const map = { 'Oro': t('mineral.mineralTypeGold'), 'Cobre-Oro': t('mineral.mineralTypeCopperGold') }
  return map[type] || type || '—'
}

function translateStatus(s) {
  const map = {
    'MaterialIdentified': t('materialOps.statusIdentified'),
    'MaterialClassified': t('materialOps.statusClassified'),
    'MaterialTracked':    t('materialOps.statusTracked'),
    'MaterialDownloaded': t('materialOps.statusDownloaded'),
    'En Tránsito':        t('mineral.statusInTransit'),
    'Completado':         t('mineral.statusCompleted'),
  }
  return map[s] || s || '—'
}

function statusClass(s) {
  if (s === 'MaterialDownloaded' || s === 'Completado') return 'badge-ok'
  if (s === 'MaterialTracked'    || s === 'En Tránsito') return 'badge-transit'
  return 'badge-warn'
}

onMounted(() => store.fetchReceptions())
</script>

<template>
  <div class="gc-page">
    <div class="page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('materialOps.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('materialOps.dashboardSubtitle') }}</p>
      </div>
      <button class="btn-gold" @click="openIdentifyModal" :disabled="!availableBatchIds.length">
        <i class="pi pi-search" /> {{ $t('materialOps.identify') }}
      </button>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="kpi-grid">
        <StatCard :label="$t('materialOps.totalBatches')" :value="store.receptions.length" icon="pi pi-inbox" trend="" />
        <StatCard :label="$t('materialOps.pendingCount')" :value="store.pendingCount" icon="pi pi-clock" trend="" />
        <StatCard :label="$t('materialOps.underInvestigation')" :value="store.underInvestigation" icon="pi pi-exclamation-triangle" trend="" :alert-active="store.underInvestigation > 0" />
      </div>

      <div class="gc-card" style="margin-top:1.5rem">
        <p class="gc-section-title">{{ $t('materialOps.receptionList') }}</p>
        <table class="gc-table" v-if="store.receptions.length">
          <thead>
            <tr>
              <th>{{ $t('materialOps.colBatch') }}</th>
              <th>{{ $t('materialOps.colMineral') }}</th>
              <th>{{ $t('materialOps.colInitialWeight') }}</th>
              <th>{{ $t('materialOps.colStatus') }}</th>
              <th>{{ $t('materialOps.colAction') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in store.receptions" :key="r.id">
              <td><span class="chip-id">HC-{{ r.batchId }}</span></td>
              <td>{{ translateMineralType(r.mineralType) }}</td>
              <td>{{ r.initialWeight ? `${r.initialWeight} t` : '—' }}</td>
              <td>
                <span class="gc-badge" :class="statusClass(r.status)">{{ translateStatus(r.status) }}</span>
              </td>
              <td>
                <button
                  v-if="r.status === 'MaterialIdentified'"
                  class="btn-sm btn-outline"
                  @click="store.confirmArrival(r.batchId)"
                >{{ $t('materialOps.track') }}</button>
                <button
                  v-else-if="r.status === 'MaterialTracked' || r.status === 'En Tránsito'"
                  class="btn-sm btn-gold"
                  @click="openWeightModal(r)"
                >{{ $t('materialOps.download') }}</button>
                <span v-else style="color:var(--gc-text-muted);font-size:.8rem">—</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          <i class="pi pi-inbox" style="font-size:2rem;color:var(--gc-text-muted);margin-bottom:.75rem" />
          <p>{{ $t('materialOps.noMaterials') }}</p>
          <p v-if="!userCycleIds.length" style="font-size:.82rem;margin-top:.4rem">
            {{ $t('materialOps.createCycleFirst') }}
          </p>
          <button v-else-if="availableBatchIds.length" class="btn-gold" style="margin-top:.75rem" @click="openIdentifyModal">
            {{ $t('materialOps.identify') }}
          </button>
          <p v-else style="font-size:.82rem;margin-top:.4rem;color:var(--gc-gold-mid)">
            {{ $t('materialOps.allIdentified') }}
          </p>
        </div>
      </div>
    </template>

    <!-- Identify Mineral Modal -->
    <div v-if="showIdentifyModal" class="overlay" @click.self="showIdentifyModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title"><i class="pi pi-search" style="color:var(--gc-gold-mid);margin-right:.4rem" /> {{ $t('materialOps.identifyModalTitle') }}</span>
          <button class="modal-close" @click="showIdentifyModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="identifySuccess" class="alert-success">
            <i class="pi pi-check-circle" /> {{ $t('materialOps.identifySuccess') }}
          </div>
          <template v-else>
            <div class="field">
              <label>{{ $t('materialOps.batchLabel') }}</label>
              <select v-model="identifyForm.batchId" class="inp">
                <option value="" disabled>{{ $t('materialOps.selectBatch') }}</option>
                <option v-for="id in availableBatchIds" :key="id" :value="String(id)">HC-{{ id }}</option>
              </select>
              <span v-if="identifyErrors.batchId" class="err">{{ identifyErrors.batchId }}</span>
            </div>
            <div class="field">
              <label>{{ $t('materialOps.mineralTypeLabel') }}</label>
              <select v-model="identifyForm.mineralType" class="inp">
                <option value="" disabled>{{ $t('materialOps.selectMineralType') }}</option>
                <option v-for="mt in MINERAL_TYPES" :key="mt" :value="mt">{{ mt }}</option>
              </select>
              <span v-if="identifyErrors.mineralType" class="err">{{ identifyErrors.mineralType }}</span>
            </div>
            <div class="field">
              <label>{{ $t('materialOps.payloadTonsLabel') }}</label>
              <input v-model.number="identifyForm.payloadTons" type="number" step="0.01" min="0.01" class="inp" placeholder="0.00" />
              <span v-if="identifyErrors.payloadTons" class="err">{{ identifyErrors.payloadTons }}</span>
            </div>
          </template>
        </div>
        <div class="modal-footer">
          <button class="btn-outline" @click="showIdentifyModal = false">{{ $t('materialOps.cancel') }}</button>
          <button v-if="!identifySuccess" class="btn-gold" :disabled="store.loading" @click="submitIdentify">
            <i v-if="store.loading" class="pi pi-spin pi-spinner" /> {{ $t('materialOps.registerBtn') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Final Weight / Download Modal -->
    <div v-if="weightModal.show" class="overlay" @click.self="weightModal.show = false">
      <div class="modal" style="max-width:380px">
        <div class="modal-header">
          <span class="modal-title"><i class="pi pi-inbox" style="color:var(--gc-gold-mid);margin-right:.4rem" /> {{ $t('materialOps.downloadModalTitle') }}</span>
          <button class="modal-close" @click="weightModal.show = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label>{{ $t('materialOps.finalWeightLabel') }}</label>
            <input v-model.number="weightModal.value" type="number" step="0.01" min="0" class="inp" placeholder="0.00" />
          </div>
          <p v-if="store.errors.length" style="color:var(--gc-danger);font-size:.8rem">{{ $t('materialOps.weightError') }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-outline" @click="weightModal.show = false">{{ $t('materialOps.cancel') }}</button>
          <button class="btn-gold" @click="submitWeight">{{ $t('common.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
.kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.5rem; }

.gc-badge { font-size:.7rem; font-weight:700; padding:.2rem .6rem; border-radius:20px; text-transform:uppercase; }
.badge-ok      { background:rgba(74,222,128,.15); color:#4ade80; }
.badge-transit { background:rgba(59,130,246,.15);  color:#3b82f6; }
.badge-warn    { background:rgba(178,148,78,.15);  color:var(--gc-gold-mid); }

.chip-id { background:rgba(178,148,78,.12); color:var(--gc-gold-mid); padding:.15rem .5rem; border-radius:4px; font-size:.78rem; font-weight:700; }
.empty-state { text-align:center; padding:3rem 1rem; color:var(--gc-text-muted); }

.btn-gold    { display:inline-flex; align-items:center; gap:.4rem; padding:.5rem 1rem; border-radius:8px; font-size:.84rem; font-weight:600; cursor:pointer; border:none; background:var(--gc-gold-mid); color:#000; }
.btn-gold:hover { opacity:.88; }
.btn-gold:disabled { opacity:.5; cursor:not-allowed; }
.btn-outline { display:inline-flex; align-items:center; gap:.4rem; padding:.5rem 1rem; border-radius:8px; font-size:.84rem; font-weight:600; cursor:pointer; background:transparent; border:1px solid var(--gc-border); color:var(--gc-text-secondary); }
.btn-outline:hover { border-color:var(--gc-gold-mid); color:var(--gc-text-primary); }
.btn-sm { font-size:.75rem !important; padding:.28rem .65rem !important; }

.overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:999; }
.modal { background:var(--gc-dark-card); border:1px solid var(--gc-border); border-radius:14px; padding:1.5rem; width:90%; max-width:460px; }
.modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.75rem; }
.modal-title { font-size:.95rem; font-weight:700; color:var(--gc-text-primary); display:flex; align-items:center; }
.modal-close { background:none; border:none; color:var(--gc-text-muted); font-size:1rem; cursor:pointer; }
.modal-body { padding:.25rem 0 .5rem; }
.modal-footer { display:flex; justify-content:flex-end; gap:.75rem; margin-top:1rem; padding-top:1rem; border-top:1px solid var(--gc-border); }

.field { display:flex; flex-direction:column; gap:.3rem; margin-bottom:.9rem; }
.field label { font-size:.75rem; font-weight:600; color:var(--gc-text-muted); text-transform:uppercase; letter-spacing:.05em; }
.inp { padding:.6rem .8rem; background:var(--gc-dark-2); border:1px solid var(--gc-border); border-radius:8px; color:var(--gc-text-primary); font-size:.9rem; width:100%; box-sizing:border-box; font-family:inherit; }
.inp:focus { outline:none; border-color:var(--gc-gold-mid); }
.err { font-size:.74rem; color:var(--gc-danger); }
.alert-success { background:rgba(74,222,128,.1); color:#4ade80; border:1px solid rgba(74,222,128,.25); padding:.6rem .9rem; border-radius:6px; font-size:.85rem; display:flex; align-items:center; gap:.5rem; }
</style>
