<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAssetMaintenanceStore } from '../../../application/asset-maintenance.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'

const { t } = useI18n()
const store = useAssetMaintenanceStore()

// ── Register Machinery Modal ─────────────────────────────────────────────────
const showRegisterModal = ref(false)
const registerForm      = reactive({ machineryId: '', model: '', oem: '' })
const registerErrors    = reactive({ machineryId: '', model: '', oem: '' })
const registerSuccess   = ref(false)

function openRegisterModal() {
  registerForm.machineryId = ''; registerForm.model = ''; registerForm.oem = ''
  registerErrors.machineryId = ''; registerErrors.model = ''; registerErrors.oem = ''
  registerSuccess.value = false
  showRegisterModal.value = true
}

async function submitRegister() {
  registerErrors.machineryId = registerForm.machineryId.trim() ? '' : t('assetMaintenance.machineryIdRequired')
  registerErrors.model       = registerForm.model.trim()       ? '' : t('assetMaintenance.modelRequired')
  registerErrors.oem         = registerForm.oem.trim()         ? '' : t('assetMaintenance.oemRequired')
  if (registerErrors.machineryId || registerErrors.model || registerErrors.oem) return

  const ok = await store.registerMachinery({
    machineryId: registerForm.machineryId.trim().toUpperCase(),
    model:       registerForm.model.trim(),
    oem:         registerForm.oem.trim()
  })
  if (ok) {
    registerSuccess.value = true
    setTimeout(() => { showRegisterModal.value = false; registerSuccess.value = false }, 1400)
  } else {
    registerErrors.machineryId = store.errors.includes('machineryExists')
      ? t('assetMaintenance.machineryExists')
      : t('assetMaintenance.registerError')
  }
}

// ── Update Engine Hours Modal ────────────────────────────────────────────────
const showHoursModal  = ref(false)
const hoursTarget     = ref(null)
const newEngineHours  = ref(0)
const hoursSuccess    = ref(false)

function openHoursModal(v) {
  hoursTarget.value   = v
  newEngineHours.value = v.engineHours
  hoursSuccess.value  = false
  showHoursModal.value = true
}

async function submitHours() {
  const ok = await store.updateEngineHours(hoursTarget.value.machineryId, Number(newEngineHours.value))
  if (ok) { hoursSuccess.value = true; setTimeout(() => { showHoursModal.value = false }, 1200) }
}

// ── Schedule Maintenance Modal ────────────────────────────────────────────────
const showMaintenanceModal = ref(false)
const maintenanceTarget    = ref(null)
const maintenanceHours     = ref(0)
const maintenanceSuccess   = ref(false)

function openMaintenanceModal(v) {
  maintenanceTarget.value  = v
  maintenanceHours.value   = v.engineHours
  maintenanceSuccess.value = false
  showMaintenanceModal.value = true
}

async function submitMaintenance() {
  const ok = await store.sendToMaintenance(maintenanceTarget.value.machineryId, Number(maintenanceHours.value))
  if (ok) { maintenanceSuccess.value = true; setTimeout(() => { showMaintenanceModal.value = false }, 1200) }
}

// ── Discharge ────────────────────────────────────────────────────────────────
async function discharge(v) {
  await store.dischargeMachinery(v.machineryId, 'Baja de activo solicitada por operador')
}

function translateStatus(s) {
  return s === 'Mantenimiento' ? t('assetMaintenance.statusMaintenance') : t('assetMaintenance.statusAvailable')
}

onMounted(() => store.fetchVehicles())
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('assetMaintenance.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('assetMaintenance.dashboardSubtitle') }}</p>
      </div>
      <button class="btn-gold" @click="openRegisterModal">
        <i class="pi pi-plus" /> {{ $t('assetMaintenance.registerMachinery') }}
      </button>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-kpi-grid">
        <StatCard :label="$t('assetMaintenance.activeVehicles')" :value="store.activeCount" icon="pi pi-cog" trend="" />
        <StatCard :label="$t('assetMaintenance.inMaintenance')" :value="store.maintenanceVehicles.length" icon="pi pi-wrench" trend="" :alert-active="store.maintenanceVehicles.length > 0" />
      </div>

      <div class="gc-card" style="margin-top:1.5rem">
        <p class="gc-section-title">{{ $t('assetMaintenance.vehicleList') }}</p>
        <table class="gc-table" v-if="store.vehicles.length">
          <thead>
            <tr>
              <th>ID</th>
              <th>{{ $t('assetMaintenance.colModelOem') }}</th>
              <th>{{ $t('assetMaintenance.colEngineHours') }}</th>
              <th>{{ $t('assetMaintenance.colStatus') }}</th>
              <th>{{ $t('assetMaintenance.colAction') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in store.vehicles" :key="v.id">
              <td><span class="chip-id">{{ v.machineryId }}</span></td>
              <td>{{ v.name }}</td>
              <td>{{ v.engineHours }} h</td>
              <td>
                <span class="gc-badge" :class="v.status === 'Mantenimiento' ? 'badge-warn' : 'badge-ok'">
                  {{ translateStatus(v.status) }}
                </span>
              </td>
              <td class="actions-cell">
                <button class="btn-sm btn-outline" @click="openHoursModal(v)" :title="$t('assetMaintenance.updateHoursTitle')">
                  <i class="pi pi-refresh" /> {{ $t('assetMaintenance.updateHoursBtn') }}
                </button>
                <button
                  v-if="v.status !== 'Mantenimiento'"
                  class="btn-sm btn-outline"
                  @click="openMaintenanceModal(v)"
                  :title="$t('assetMaintenance.scheduleMaintTitle')"
                >
                  <i class="pi pi-wrench" /> {{ $t('assetMaintenance.scheduleMaintBtn') }}
                </button>
                <button
                  v-if="v.status === 'Mantenimiento'"
                  class="btn-sm btn-gold"
                  @click="discharge(v)"
                  :title="$t('assetMaintenance.dischargeBtn')"
                >
                  <i class="pi pi-times" /> {{ $t('assetMaintenance.dischargeBtn') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          <i class="pi pi-cog" style="font-size:2rem;color:var(--gc-text-muted);margin-bottom:.75rem" />
          <p>{{ $t('assetMaintenance.noMachinery') }}</p>
          <button class="btn-gold" style="margin-top:.75rem" @click="openRegisterModal">
            {{ $t('assetMaintenance.registerFirst') }}
          </button>
        </div>
      </div>
    </template>

    <!-- Register Machinery Modal -->
    <div v-if="showRegisterModal" class="overlay" @click.self="showRegisterModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title"><i class="pi pi-cog" style="color:var(--gc-gold-mid);margin-right:.4rem" /> {{ $t('assetMaintenance.registerMachinery') }}</span>
          <button class="modal-close" @click="showRegisterModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="registerSuccess" class="alert-success">
            <i class="pi pi-check-circle" /> {{ $t('assetMaintenance.registerSuccess') }}
          </div>
          <template v-else>
            <div class="field">
              <label>{{ $t('assetMaintenance.machineryIdLabel') }} <span class="hint">{{ $t('assetMaintenance.machineryIdHint') }}</span></label>
              <input v-model="registerForm.machineryId" class="inp" placeholder="EX-100" />
              <span v-if="registerErrors.machineryId" class="err">{{ registerErrors.machineryId }}</span>
            </div>
            <div class="field">
              <label>{{ $t('assetMaintenance.modelLabel') }}</label>
              <input v-model="registerForm.model" class="inp" placeholder="ej: 777F" />
              <span v-if="registerErrors.model" class="err">{{ registerErrors.model }}</span>
            </div>
            <div class="field">
              <label>{{ $t('assetMaintenance.oemLabel') }}</label>
              <input v-model="registerForm.oem" class="inp" placeholder="ej: Caterpillar" />
              <span v-if="registerErrors.oem" class="err">{{ registerErrors.oem }}</span>
            </div>
          </template>
        </div>
        <div class="modal-footer">
          <button class="btn-outline" @click="showRegisterModal = false">{{ $t('assetMaintenance.cancel') }}</button>
          <button v-if="!registerSuccess" class="btn-gold" :disabled="store.loading" @click="submitRegister">
            <i v-if="store.loading" class="pi pi-spin pi-spinner" /> {{ $t('assetMaintenance.register') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Update Engine Hours Modal -->
    <div v-if="showHoursModal" class="overlay" @click.self="showHoursModal = false">
      <div class="modal" style="max-width:360px">
        <div class="modal-header">
          <span class="modal-title"><i class="pi pi-refresh" style="color:var(--gc-gold-mid);margin-right:.4rem" /> {{ $t('assetMaintenance.updateHoursTitle') }}</span>
          <button class="modal-close" @click="showHoursModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="hoursSuccess" class="alert-success"><i class="pi pi-check-circle" /> {{ $t('assetMaintenance.updateHoursSuccess') }}</div>
          <template v-else>
            <p style="font-size:.82rem;color:var(--gc-text-muted);margin-bottom:.9rem">
              {{ $t('assetMaintenance.machineryIdLabel') }}: <strong style="color:var(--gc-text-primary)">{{ hoursTarget?.machineryId }}</strong>
            </p>
            <div class="field">
              <label>{{ $t('assetMaintenance.updateHoursLabel') }}</label>
              <input v-model.number="newEngineHours" type="number" min="0" class="inp" />
            </div>
          </template>
        </div>
        <div class="modal-footer">
          <button class="btn-outline" @click="showHoursModal = false">{{ $t('assetMaintenance.cancel') }}</button>
          <button v-if="!hoursSuccess" class="btn-gold" :disabled="store.loading" @click="submitHours">
            <i v-if="store.loading" class="pi pi-spin pi-spinner" /> {{ $t('common.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule Maintenance Modal -->
    <div v-if="showMaintenanceModal" class="overlay" @click.self="showMaintenanceModal = false">
      <div class="modal" style="max-width:380px">
        <div class="modal-header">
          <span class="modal-title"><i class="pi pi-wrench" style="color:var(--gc-gold-mid);margin-right:.4rem" /> {{ $t('assetMaintenance.scheduleMaintTitle') }}</span>
          <button class="modal-close" @click="showMaintenanceModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="maintenanceSuccess" class="alert-success"><i class="pi pi-check-circle" /> {{ $t('assetMaintenance.scheduleMaintSuccess') }}</div>
          <template v-else>
            <p style="font-size:.82rem;color:var(--gc-text-muted);margin-bottom:.9rem">
              {{ $t('assetMaintenance.machineryIdLabel') }}: <strong style="color:var(--gc-text-primary)">{{ maintenanceTarget?.machineryId }}</strong>
            </p>
            <div class="field">
              <label>{{ $t('assetMaintenance.scheduleMaintLabel') }}</label>
              <input v-model.number="maintenanceHours" type="number" min="0" class="inp" />
            </div>
          </template>
        </div>
        <div class="modal-footer">
          <button class="btn-outline" @click="showMaintenanceModal = false">{{ $t('assetMaintenance.cancel') }}</button>
          <button v-if="!maintenanceSuccess" class="btn-gold" :disabled="store.loading" @click="submitMaintenance">
            <i v-if="store.loading" class="pi pi-spin pi-spinner" /> {{ $t('assetMaintenance.scheduleMaintBtn') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
.gc-kpi-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; margin-bottom:1.5rem; }

.gc-badge { font-size:.7rem; font-weight:700; padding:.2rem .6rem; border-radius:20px; text-transform:uppercase; }
.badge-ok   { background:rgba(74,222,128,.15); color:#4ade80; }
.badge-warn { background:rgba(178,148,78,.15); color:var(--gc-gold-mid); }

.actions-cell { display:flex; gap:.4rem; flex-wrap:wrap; }

.btn-gold    { display:inline-flex; align-items:center; gap:.4rem; padding:.5rem 1rem; border-radius:8px; font-size:.84rem; font-weight:600; cursor:pointer; border:none; background:var(--gc-gold-mid); color:#000; }
.btn-gold:hover { opacity:.88; }
.btn-gold:disabled { opacity:.5; cursor:not-allowed; }
.btn-outline { display:inline-flex; align-items:center; gap:.4rem; padding:.5rem 1rem; border-radius:8px; font-size:.84rem; font-weight:600; cursor:pointer; background:transparent; border:1px solid var(--gc-border); color:var(--gc-text-secondary); }
.btn-outline:hover { border-color:var(--gc-gold-mid); color:var(--gc-text-primary); }
.btn-sm { font-size:.75rem !important; padding:.28rem .65rem !important; }

.chip-id { background:rgba(178,148,78,.12); color:var(--gc-gold-mid); padding:.15rem .5rem; border-radius:4px; font-size:.78rem; font-weight:700; }

.empty-state { text-align:center; padding:3rem 1rem; color:var(--gc-text-muted); }

.overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:999; }
.modal { background:var(--gc-dark-card); border:1px solid var(--gc-border); border-radius:14px; padding:1.5rem; width:90%; max-width:460px; }
.modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
.modal-title { font-size:.95rem; font-weight:700; color:var(--gc-text-primary); display:flex; align-items:center; }
.modal-close { background:none; border:none; color:var(--gc-text-muted); font-size:1rem; cursor:pointer; }
.modal-body { padding:.25rem 0 .5rem; }
.modal-footer { display:flex; justify-content:flex-end; gap:.75rem; margin-top:1rem; padding-top:1rem; border-top:1px solid var(--gc-border); }

.field { display:flex; flex-direction:column; gap:.3rem; margin-bottom:.9rem; }
.field label { font-size:.75rem; font-weight:600; color:var(--gc-text-muted); text-transform:uppercase; letter-spacing:.05em; }
.hint { font-size:.7rem; color:var(--gc-text-muted); text-transform:none; font-weight:400; }
.inp { padding:.6rem .8rem; background:var(--gc-dark-2); border:1px solid var(--gc-border); border-radius:8px; color:var(--gc-text-primary); font-size:.9rem; width:100%; box-sizing:border-box; }
.inp:focus { outline:none; border-color:var(--gc-gold-mid); }
.err { font-size:.74rem; color:var(--gc-danger); }

.alert-success { background:rgba(74,222,128,.1); color:#4ade80; border:1px solid rgba(74,222,128,.25); padding:.6rem .9rem; border-radius:6px; font-size:.85rem; display:flex; align-items:center; gap:.5rem; }
</style>
