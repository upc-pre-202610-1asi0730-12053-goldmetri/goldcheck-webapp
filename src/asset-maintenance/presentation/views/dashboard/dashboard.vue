<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('assetMaintenance.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('assetMaintenance.dashboardSubtitle') }}</p>
      </div>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-stats-row">
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('assetMaintenance.activeVehicles') }}</p>
          <p class="gc-stat-value" style="color:#4ade80">{{ store.activeCount }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('assetMaintenance.inMaintenance') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-gold-mid)">{{ store.maintenanceVehicles.length }}</p>
        </div>
      </div>

      <div class="gc-card" style="margin-top:1.5rem">
        <p class="gc-section-title">{{ $t('assetMaintenance.vehicleList') }}</p>
        <table class="gc-table" v-if="store.vehicles.length">
          <thead>
            <tr>
              <th>{{ $t('assetMaintenance.colName') }}</th>
              <th>{{ $t('assetMaintenance.colPlate') }}</th>
              <th>{{ $t('assetMaintenance.colType') }}</th>
              <th>{{ $t('assetMaintenance.colStatus') }}</th>
              <th>{{ $t('assetMaintenance.colAction') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in store.vehicles" :key="v.id">
              <td>{{ v.name }}</td>
              <td>{{ v.plate }}</td>
              <td>{{ v.type }}</td>
              <td>
                <span class="gc-badge" :class="v.status === 'Activo' ? 'badge-ok' : 'badge-warning'">
                  {{ v.status }}
                </span>
              </td>
              <td>
                <button
                  v-if="v.status === 'Activo'"
                  class="gc-btn gc-btn-outline"
                  style="font-size:0.75rem;padding:0.3rem 0.8rem"
                  @click="store.sendToMaintenance(v.id)"
                >{{ $t('assetMaintenance.sendToMaintenance') }}</button>
                <button
                  v-else
                  class="gc-btn gc-btn-gold"
                  style="font-size:0.75rem;padding:0.3rem 0.8rem"
                  @click="store.activateVehicle(v.id)"
                >{{ $t('assetMaintenance.activate') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('assetMaintenance.noVehicles') }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAssetMaintenanceStore } from '../../../application/asset-maintenance.store.js'

const store = useAssetMaintenanceStore()
onMounted(() => store.fetchVehicles())
</script>

<style scoped>
.gc-stats-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.gc-stat-card { background: var(--gc-surface); border: 1px solid var(--gc-border); border-radius: 10px; padding: 1.25rem 2rem; min-width: 160px; }
.gc-stat-label { font-size: 0.75rem; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .35rem; }
.gc-stat-value { font-size: 1.8rem; font-weight: 800; color: var(--gc-text-primary); }
.gc-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
.badge-ok      { background: rgba(74,222,128,.15); color: #4ade80; }
.badge-warning { background: rgba(178,148,78,.15);  color: var(--gc-gold-mid); }
</style>
