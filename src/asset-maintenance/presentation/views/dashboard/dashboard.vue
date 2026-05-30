<script setup>
import { onMounted } from 'vue'
import { useAssetMaintenanceStore } from '../../../application/asset-maintenance.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'

const store = useAssetMaintenanceStore()

onMounted(() => store.fetchVehicles())
</script>

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
      <div class="gc-kpi-grid">
        <StatCard :label="$t('assetMaintenance.activeVehicles')" :value="store.activeCount" icon="pi pi-truck" trend="" />
        <StatCard :label="$t('assetMaintenance.inMaintenance')" :value="store.maintenanceVehicles.length" icon="pi pi-wrench" trend="" :alert-active="store.maintenanceVehicles.length > 0" />
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

<style scoped>
.gc-kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.gc-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
.badge-ok      { background: rgba(74,222,128,.15); color: #4ade80; }
.badge-warning { background: rgba(178,148,78,.15);  color: var(--gc-gold-mid); }
</style>
