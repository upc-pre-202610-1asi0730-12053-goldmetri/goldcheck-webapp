<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('mineral.operationsTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('mineral.operationsSubtitle') }}</p>
      </div>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-stats-row">
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('mineral.activeBatches') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-gold-mid)">{{ store.activeBatchCount }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('mineral.tonsToday') }}</p>
          <p class="gc-stat-value">{{ store.totalTonsToday }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('mineral.routeAlerts') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-danger)">{{ store.alertCount }}</p>
        </div>
      </div>

      <div class="gc-card" style="margin-top:1.5rem">
        <p class="gc-section-title">{{ $t('mineral.batchTracking') }}</p>
        <table class="gc-table" v-if="store.batches.length">
          <thead>
            <tr>
              <th>{{ $t('mineral.colBatchId') }}</th>
              <th>{{ $t('mineral.colVehicle') }}</th>
              <th>{{ $t('mineral.colWeight') }}</th>
              <th>{{ $t('mineral.colLocation') }}</th>
              <th>{{ $t('mineral.colStatus') }}</th>
              <th>{{ $t('mineral.colAction') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in store.batches" :key="b.id">
              <td>{{ b.batchCode }}</td>
              <td>{{ b.vehicleName || b.vehicleId }}</td>
              <td>{{ b.initialWeight ? `${b.initialWeight} t` : '—' }}</td>
              <td>{{ b.destination || b.depositName || '—' }}</td>
              <td>
                <span class="gc-badge" :class="statusClass(b.status)">{{ b.status }}</span>
              </td>
              <td>
                <button
                  v-if="b.status === 'En Tránsito'"
                  class="gc-btn gc-btn-gold"
                  style="font-size:0.75rem;padding:0.3rem 0.8rem"
                  @click="openWeightModal(b)"
                >{{ $t('mineral.confirmArrival') }}</button>
                <span v-else style="color:var(--gc-text-muted);font-size:0.8rem">—</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('mineral.noBatches') }}
        </p>
      </div>
    </template>

    <div v-if="weightModal.show" class="gc-modal-overlay" @click.self="weightModal.show = false">
      <div class="gc-modal" style="max-width:400px">
        <div class="gc-modal-header">
          <p class="gc-modal-title">
            <i class="pi pi-inbox" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('mineral.sealBatch') }}
          </p>
          <button class="gc-modal-close" @click="weightModal.show = false">✕</button>
        </div>
        <div style="padding:1rem 0">
          <label class="gc-label">{{ $t('mineral.tons') }}</label>
          <input
            v-model.number="weightModal.value"
            type="number" step="0.01" min="0"
            class="gc-input"
            placeholder="0.00"
          />
        </div>
        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="weightModal.show = false">{{ $t('mineral.cancel') }}</button>
          <button class="gc-btn gc-btn-gold" @click="submitWeight">{{ $t('common.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useMineralStore } from '../../../application/mineral.store.js'

const store = useMineralStore()
onMounted(() => store.fetchBatches())

const weightModal = reactive({ show: false, batchId: null, value: null })

function openWeightModal(b) {
  weightModal.batchId = b.id
  weightModal.value = null
  weightModal.show = true
}

async function submitWeight() {
  const ok = await store.registerInitialWeight(weightModal.batchId, weightModal.value)
  if (ok) weightModal.show = false
}

function statusClass(s) {
  if (s === 'Completado') return 'badge-ok'
  if (s === 'Alerta') return 'badge-danger'
  if (s === 'En Tránsito') return 'badge-transit'
  return 'badge-warning'
}
</script>

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
.gc-label { display:block; font-size:0.8rem; color:var(--gc-text-muted); margin-bottom:0.4rem; }
.gc-input { width:100%; padding:0.6rem 0.8rem; background:var(--gc-surface); border:1px solid var(--gc-border); border-radius:8px; color:var(--gc-text-primary); font-size:0.9rem; }
</style>
