<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMineralStore } from '../../../application/mineral.store.js'

const { t } = useI18n()
const store = useMineralStore()

const busyId    = ref(null)
const rowError  = ref({})   // { [cycleId]: messageKey }
const success   = ref(null)

onMounted(() => store.fetchBatches())

// Batches not yet departed nor completed (candidates to start route).
const pending = computed(() =>
  store.batches.filter(b => !['En Tránsito', 'Completado'].includes(b.status))
)

const inTransit = computed(() =>
  store.batches.filter(b => b.status === 'En Tránsito')
)

async function start(batch) {
  rowError.value = { ...rowError.value, [batch.id]: '' }
  success.value = null
  busyId.value = batch.id
  const res = await store.startRoute(batch.id)
  busyId.value = null
  if (res.ok) {
    success.value = batch.batchCode
    setTimeout(() => { success.value = null }, 4000)
  } else {
    const key = store.errors[0] === 'routeRequiresWeighing'
      ? 'mineral.routeRequiresWeighing'
      : 'mineral.routeError'
    rowError.value = { ...rowError.value, [batch.id]: key }
  }
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('mineral.routeTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('mineral.routeSubtitle') }}</p>
      </div>
    </div>

    <div v-if="success" class="gc-alert gc-alert-success">
      <i class="pi pi-check-circle" /> {{ $t('mineral.routeStarted', { batch: success }) }}
    </div>

    <div class="gc-card">
      <p class="gc-section-title">{{ $t('mineral.routePendingTitle') }}</p>
      <table class="gc-table" v-if="pending.length">
        <thead>
          <tr>
            <th>{{ $t('mineral.routeColBatch') }}</th>
            <th>{{ $t('mineral.routeColVehicle') }}</th>
            <th>{{ $t('mineral.routeColStatus') }}</th>
            <th>{{ $t('mineral.routeColWeight') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="b in pending" :key="b.id">
            <tr>
              <td>{{ b.batchCode }}</td>
              <td>{{ b.vehicleName }}</td>
              <td>{{ b.status }}</td>
              <td>
                <span v-if="b.initialWeight > 0">{{ b.initialWeight }} t</span>
                <span v-else class="no-weight">{{ $t('mineral.routeNoWeight') }}</span>
              </td>
              <td style="text-align:right">
                <button class="gc-btn gc-btn-gold" :disabled="busyId === b.id" @click="start(b)">
                  <i v-if="busyId === b.id" class="pi pi-spin pi-spinner" />
                  <i v-else class="pi pi-play" />
                  {{ $t('mineral.routeStart') }}
                </button>
              </td>
            </tr>
            <tr v-if="rowError[b.id]">
              <td colspan="5" class="row-error">{{ $t(rowError[b.id]) }}</td>
            </tr>
          </template>
        </tbody>
      </table>
      <p v-else class="empty">{{ $t('mineral.routeNoPending') }}</p>
    </div>

    <div class="gc-card" style="margin-top:1.5rem" v-if="inTransit.length">
      <p class="gc-section-title">{{ $t('mineral.routeInTransitTitle') }}</p>
      <table class="gc-table">
        <thead>
          <tr>
            <th>{{ $t('mineral.routeColBatch') }}</th>
            <th>{{ $t('mineral.routeColVehicle') }}</th>
            <th>{{ $t('mineral.routeColStatus') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in inTransit" :key="b.id">
            <td>{{ b.batchCode }}</td>
            <td>{{ b.vehicleName }}</td>
            <td><span class="transit-chip">{{ b.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; }
.gc-section-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1rem; }

.gc-table { width: 100%; border-collapse: collapse; }
.gc-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-text-muted); padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--gc-border); }
.gc-table td { padding: 0.6rem 0.75rem; font-size: 0.85rem; color: var(--gc-text-primary); border-bottom: 1px solid var(--gc-border); }

.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.9rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-gold { background: var(--gc-gold-mid); color: #000; }
.gc-btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }

.no-weight { color: var(--gc-danger); font-size: 0.8rem; }
.row-error { color: var(--gc-danger); font-size: 0.78rem; padding-top: 0; }
.empty { color: var(--gc-text-muted); text-align: center; padding: 1.5rem; }
.transit-chip { background: rgba(59,130,246,.15); color: #3b82f6; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }

.gc-alert { display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.gc-alert-success { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
</style>
