<script setup>
import { reactive, onMounted } from 'vue'
import { useMaterialOperationsStore } from '../../../application/material-operations.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'

const store = useMaterialOperationsStore()

const weightModal = reactive({ show: false, batchId: null, initialWeight: 0, value: null })

function openWeightModal(r) {
  weightModal.batchId = r.batchId
  weightModal.initialWeight = r.initialWeight
  weightModal.value = null
  weightModal.show = true
}

async function submitWeight() {
  const ok = await store.registerFinalWeight(weightModal.batchId, weightModal.value, weightModal.initialWeight)
  if (ok) weightModal.show = false
}

function statusClass(s) {
  if (s === 'Completado' || s === 'Procesado' || s === 'En Planta') return 'badge-ok'
  if (s === 'Bajo Investigación' || s === 'Alerta') return 'badge-danger'
  return 'badge-warning'
}

onMounted(() => store.fetchReceptions())
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('materialOps.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('materialOps.dashboardSubtitle') }}</p>
      </div>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-kpi-grid">
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
              <th>{{ $t('materialOps.colFinalWeight') }}</th>
              <th>{{ $t('materialOps.colShrinkage') }}</th>
              <th>{{ $t('materialOps.colStatus') }}</th>
              <th>{{ $t('materialOps.colAction') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in store.receptions" :key="r.id">
              <td>{{ r.batchCode || `#${r.id}` }}</td>
              <td>{{ r.mineralType || '—' }}</td>
              <td>{{ r.initialWeight ? `${r.initialWeight} t` : '—' }}</td>
              <td>{{ r.receivedWeight ? `${r.receivedWeight} t` : '—' }}</td>
              <td>
                <span v-if="r.receivedWeight" :style="{ color: r.isCritical ? 'var(--gc-danger)' : '#4ade80' }">
                  {{ r.shrinkage }}%
                </span>
                <span v-else style="color:var(--gc-text-muted)">—</span>
              </td>
              <td>
                <span class="gc-badge" :class="statusClass(r.status)">{{ r.status }}</span>
              </td>
              <td>
                <button
                  v-if="r.status === 'En Tránsito'"
                  class="gc-btn gc-btn-gold"
                  style="font-size:0.75rem;padding:0.3rem 0.8rem"
                  @click="store.confirmArrival(r.batchId)"
                >{{ $t('materialOps.confirmArrival') }}</button>
                <button
                  v-else-if="r.status === 'En Planta' && !r.receivedWeight"
                  class="gc-btn gc-btn-outline"
                  style="font-size:0.75rem;padding:0.3rem 0.8rem"
                  @click="openWeightModal(r)"
                >{{ $t('materialOps.registerWeight') }}</button>
                <span v-else style="color:var(--gc-text-muted);font-size:0.8rem">{{ r.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('materialOps.noReceptions') }}
        </p>
      </div>
    </template>

    <div v-if="weightModal.show" class="gc-modal-overlay" @click.self="weightModal.show = false">
      <div class="gc-modal" style="max-width:400px">
        <div class="gc-modal-header">
          <p class="gc-modal-title">
            <i class="pi pi-inbox" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('materialOps.finalWeightTitle') }}
          </p>
          <button class="gc-modal-close" @click="weightModal.show = false">✕</button>
        </div>
        <div style="padding:1rem 0">
          <label class="gc-label">{{ $t('materialOps.finalWeightLabel') }}</label>
          <input
            v-model.number="weightModal.value"
            type="number" step="0.01" min="0"
            class="gc-input"
            :placeholder="$t('materialOps.weightPlaceholder')"
          />
          <p v-if="store.errors.length" style="color:var(--gc-danger);font-size:0.8rem;margin-top:0.5rem">
            {{ store.errors[0] }}
          </p>
        </div>
        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="weightModal.show = false">{{ $t('common.cancel') }}</button>
          <button class="gc-btn gc-btn-gold" @click="submitWeight">{{ $t('common.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gc-kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.gc-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
.badge-ok      { background: rgba(74,222,128,.15); color: #4ade80; }
.badge-warning { background: rgba(178,148,78,.15);  color: var(--gc-gold-mid); }
.badge-danger  { background: rgba(239,68,68,.15);  color: #ef4444; }
.gc-label { display:block; font-size:0.8rem; color:var(--gc-text-muted); margin-bottom:0.4rem; }
.gc-input { width:100%; padding:0.6rem 0.8rem; background:var(--gc-surface); border:1px solid var(--gc-border); border-radius:8px; color:var(--gc-text-primary); font-size:0.9rem; }
</style>
