<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('mineral.fleetTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('mineral.fleetSubtitle') }}</p>
      </div>
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
              <td>{{ v.type }}</td>
              <td>{{ v.capacity }} t</td>
              <td>
                <span class="gc-badge" :class="vehicleStatusClass(v.status)">{{ v.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('mineral.noVehicles') }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useMineralStore } from '../../../application/mineral.store.js'

const store = useMineralStore()
onMounted(() => store.fetchSupporting())

const availableCount   = computed(() => store.vehicles.filter(v => v.status === 'Disponible').length)
const onRouteCount     = computed(() => store.vehicles.filter(v => v.status === 'En Ruta').length)
const maintenanceCount = computed(() => store.vehicles.filter(v => v.status === 'Mantenimiento').length)

function vehicleStatusClass(s) {
  if (s === 'Disponible') return 'badge-ok'
  if (s === 'En Ruta') return 'badge-transit'
  return 'badge-warning'
}
</script>

<style scoped>
.gc-stats-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.gc-stat-card { background: var(--gc-surface); border: 1px solid var(--gc-border); border-radius: 10px; padding: 1.25rem 2rem; min-width: 160px; }
.gc-stat-label { font-size: 0.75rem; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .35rem; }
.gc-stat-value { font-size: 1.8rem; font-weight: 800; color: var(--gc-text-primary); }
.gc-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
.badge-ok      { background: rgba(74,222,128,.15); color: #4ade80; }
.badge-transit { background: rgba(59,130,246,.15);  color: #3b82f6; }
.badge-warning { background: rgba(178,148,78,.15);  color: var(--gc-gold-mid); }
</style>
