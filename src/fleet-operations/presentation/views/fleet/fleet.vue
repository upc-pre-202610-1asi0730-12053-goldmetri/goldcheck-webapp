<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMineralStore } from '../../../application/mineral.store.js'

const { t } = useI18n()
const store = useMineralStore()
onMounted(() => store.fetchSupporting())

// ── Register Vehicle Modal ──────────────────────────────────────────────────
const showRegisterModal = ref(false)
const newVehicleId      = ref('')
const vehicleIdError    = ref('')
const registerSuccess   = ref(false)

function openRegisterModal() {
  newVehicleId.value   = ''
  vehicleIdError.value = ''
  registerSuccess.value = false
  showRegisterModal.value = true
}

async function submitRegister() {
  vehicleIdError.value  = ''
  registerSuccess.value = false
  const id = newVehicleId.value.trim()
  if (!id) { vehicleIdError.value = 'El ID del vehículo es requerido'; return }
  if (!/^[A-Z0-9\-]{3,20}$/.test(id)) {
    vehicleIdError.value = 'Solo letras mayúsculas, números y guiones (3-20 chars)'
    return
  }
  const res = await store.registerVehicle(id)
  if (res) {
    registerSuccess.value = true
    newVehicleId.value = ''
    setTimeout(() => { showRegisterModal.value = false; registerSuccess.value = false }, 1500)
  } else {
    vehicleIdError.value = store.errors.includes('vehicleExists')
      ? 'Este ID de vehículo ya está registrado'
      : 'Error al registrar el vehículo'
  }
}

const availableCount   = computed(() => store.vehicles.filter(v => v.status === 'Disponible').length)
const onRouteCount     = computed(() => store.vehicles.filter(v => v.status === 'En Ruta').length)
const maintenanceCount = computed(() => store.vehicles.filter(v => v.status === 'Mantenimiento').length)

function vehicleStatusClass(s) {
  if (s === 'Disponible') return 'badge-ok'
  if (s === 'En Ruta') return 'badge-transit'
  return 'badge-warning'
}

function translateVehicleStatus(s) {
  const map = {
    'Disponible':    t('mineral.statusAvailable'),
    'En Ruta':       t('mineral.statusOnRoute'),
    'Mantenimiento': t('mineral.statusMaintenance'),
  }
  return map[s] || s || '—'
}

function translateVehicleType(type) {
  const map = {
    'Camión Minero':    t('mineral.vehicleTypeMiningTruck'),
    'Volquete':         t('mineral.vehicleTypeDumpTruck'),
    'Camión de Acarreo': t('mineral.vehicleTypeHaulingTruck'),
  }
  return map[type] || type || '—'
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('mineral.fleetTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('mineral.fleetSubtitle') }}</p>
      </div>
      <button class="gc-btn gc-btn-gold" @click="openRegisterModal">
        <i class="pi pi-plus" /> Registrar Vehículo
      </button>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-stats-row">
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('mineral.fleetTotal') }}</p>
          <p class="gc-stat-value">{{ store.vehicles.length }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('mineral.fleetAvailable') }}</p>
          <p class="gc-stat-value" style="color:#4ade80">{{ availableCount }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('mineral.fleetOnRoute') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-gold-mid)">{{ onRouteCount }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('mineral.fleetMaintenance') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-danger)">{{ maintenanceCount }}</p>
        </div>
      </div>

      <div class="gc-card" style="margin-top:1.5rem">
        <p class="gc-section-title">{{ $t('mineral.vehicleList') }}</p>
        <table class="gc-table" v-if="store.vehicles.length">
          <thead>
            <tr>
              <th>{{ $t('mineral.colVehicleName') }}</th>
              <th>{{ $t('mineral.colPlate') }}</th>
              <th>{{ $t('mineral.colVehicleType') }}</th>
              <th>{{ $t('mineral.colCapacity') }}</th>
              <th>{{ $t('mineral.colStatus') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in store.vehicles" :key="v.id">
              <td>{{ v.name }}</td>
              <td>{{ v.plate }}</td>
              <td>{{ translateVehicleType(v.type) }}</td>
              <td>{{ v.capacity }} t</td>
              <td>
                <span class="gc-badge" :class="vehicleStatusClass(v.status)">{{ translateVehicleStatus(v.status) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('mineral.noVehicles') }}
        </p>
      </div>
    </template>

    <!-- ── Register Vehicle Modal ── -->
    <div v-if="showRegisterModal" class="gc-modal-overlay" @click.self="showRegisterModal = false">
      <div class="gc-modal" style="max-width:420px">
        <div class="gc-modal-header">
          <p class="gc-modal-title">
            <i class="pi pi-truck" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            Registrar Vehículo
          </p>
          <button class="gc-modal-close" @click="showRegisterModal = false">✕</button>
        </div>

        <div style="padding:1rem 0">
          <p style="font-size:0.82rem;color:var(--gc-text-muted);margin-bottom:1.25rem">
            Ingresa el ID único del vehículo (ej: MAC-002, CAT-007). Quedará asignado a tu cuenta de operador.
          </p>

          <div v-if="registerSuccess" class="gc-alert gc-alert-success" style="margin-bottom:1rem">
            <i class="pi pi-check-circle" /> Vehículo registrado exitosamente
          </div>

          <label style="font-size:0.75rem;font-weight:600;color:var(--gc-text-muted);text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:0.4rem">
            ID del Vehículo
          </label>
          <input
            v-model="newVehicleId"
            type="text"
            class="gc-input-dark"
            placeholder="Ej: MAC-002"
            :class="{ 'input-error': vehicleIdError }"
            style="width:100%;box-sizing:border-box"
            @keyup.enter="submitRegister"
          />
          <span v-if="vehicleIdError" style="font-size:0.76rem;color:var(--gc-danger);display:block;margin-top:0.3rem">
            {{ vehicleIdError }}
          </span>
        </div>

        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="showRegisterModal = false">Cancelar</button>
          <button class="gc-btn gc-btn-gold" :disabled="store.loading" @click="submitRegister">
            <i v-if="store.loading" class="pi pi-spin pi-spinner" />
            Registrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
.gc-btn { display:inline-flex; align-items:center; gap:0.4rem; padding:0.55rem 1.1rem; border-radius:8px; font-size:0.85rem; font-weight:600; cursor:pointer; border:none; }
.gc-btn-gold { background:var(--gc-gold-mid); color:#000; }
.gc-btn-gold:hover { opacity:.88; }
.gc-btn-gold:disabled { opacity:.5; cursor:not-allowed; }
.gc-btn-outline { background:transparent; border:1px solid var(--gc-border); color:var(--gc-text-secondary); }
.gc-btn-outline:hover { border-color:var(--gc-gold-mid); color:var(--gc-text-primary); }
.gc-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:999; }
.gc-modal { background:var(--gc-dark-card); border:1px solid var(--gc-border); border-radius:14px; padding:1.5rem; width:90%; }
.gc-modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; }
.gc-modal-title { font-size:1rem; font-weight:700; color:var(--gc-text-primary); display:flex; align-items:center; }
.gc-modal-close { background:none; border:none; color:var(--gc-text-muted); font-size:1rem; cursor:pointer; }
.gc-modal-footer { display:flex; justify-content:flex-end; gap:.75rem; margin-top:1rem; padding-top:1rem; border-top:1px solid var(--gc-border); }
.gc-input-dark { padding:.6rem .8rem; background:var(--gc-dark-2); border:1px solid var(--gc-border); border-radius:8px; color:var(--gc-text-primary); font-size:.9rem; transition:border-color .2s; }
.gc-input-dark:focus { outline:none; border-color:var(--gc-gold-mid); }
.input-error { border-color:var(--gc-danger) !important; }
.gc-alert-success { background:rgba(74,222,128,.1); color:#4ade80; border:1px solid rgba(74,222,128,.25); padding:.6rem .9rem; border-radius:6px; font-size:.85rem; display:flex; align-items:center; gap:.5rem; }
.gc-stats-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.gc-stat-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 10px; padding: 1.25rem 2rem; min-width: 160px; }
.gc-stat-label { font-size: 0.75rem; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .35rem; }
.gc-stat-value { font-size: 1.8rem; font-weight: 800; color: var(--gc-text-primary); }
.gc-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
.badge-ok      { background: rgba(74,222,128,.15); color: #4ade80; }
.badge-transit { background: rgba(59,130,246,.15);  color: #3b82f6; }
.badge-warning { background: rgba(178,148,78,.15);  color: var(--gc-gold-mid); }
</style>
