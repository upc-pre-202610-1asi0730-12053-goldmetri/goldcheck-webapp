<script setup>
import { computed, onMounted } from 'vue'
import { useMineralStore } from '../../../application/mineral.store.js'

const store = useMineralStore()
onMounted(() => store.fetchBatches())

const completedCount = computed(() => store.batches.filter(b => b.status === 'Completado').length)
const alertBatches   = computed(() => store.batches.filter(b => b.status === 'Alerta').length)

function statusClass(s) {
  if (s === 'Completado') return 'badge-ok'
  if (s === 'Alerta') return 'badge-danger'
  if (s === 'En Tránsito') return 'badge-transit'
  return 'badge-warning'
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-PE')
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('mineral.reportsTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('mineral.reportsSubtitle') }}</p>
      </div>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-stats-row">
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('mineral.reportTotalBatches') }}</p>
          <p class="gc-stat-value">{{ store.batches.length }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('mineral.reportCompleted') }}</p>
          <p class="gc-stat-value" style="color:#4ade80">{{ completedCount }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('mineral.reportTotalTons') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-gold-mid)">{{ store.totalTonsToday }} t</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('mineral.reportAlerts') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-danger)">{{ alertBatches }}</p>
        </div>
      </div>

      <div class="gc-card" style="margin-top:1.5rem">
        <p class="gc-section-title">{{ $t('mineral.reportBatchHistory') }}</p>
        <table class="gc-table" v-if="store.batches.length">
          <thead>
            <tr>
              <th>{{ $t('mineral.colBatchId') }}</th>
              <th>{{ $t('mineral.colVehicle') }}</th>
              <th>{{ $t('mineral.colWeight') }}</th>
              <th>{{ $t('mineral.colLocation') }}</th>
              <th>{{ $t('mineral.colStatus') }}</th>
              <th>{{ $t('mineral.reportDate') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in store.batches" :key="b.id">
              <td>{{ b.batchCode }}</td>
              <td>{{ b.vehicleName || '—' }}</td>
              <td>{{ b.initialWeight ? `${b.initialWeight} t` : '—' }}</td>
              <td>{{ b.destination || '—' }}</td>
              <td>
                <span class="gc-badge" :class="statusClass(b.status)">{{ b.status }}</span>
              </td>
              <td>{{ formatDate(b.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('mineral.noBatches') }}
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.gc-stats-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.gc-stat-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 10px; padding: 1.25rem 2rem; min-width: 160px; }
.gc-stat-label { font-size: 0.75rem; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .35rem; }
.gc-stat-value { font-size: 1.8rem; font-weight: 800; color: var(--gc-text-primary); }
.gc-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
.badge-ok      { background: rgba(74,222,128,.15); color: #4ade80; }
.badge-transit { background: rgba(59,130,246,.15);  color: #3b82f6; }
.badge-warning { background: rgba(178,148,78,.15);  color: var(--gc-gold-mid); }
.badge-danger  { background: rgba(239,68,68,.15);   color: #ef4444; }
</style>
