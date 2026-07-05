<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAnalyticsStore } from '../../../application/analytics.store.js'

const { t } = useI18n()
const store = useAnalyticsStore()

const supplier = ref('') // '' = all suppliers

const report    = computed(() => store.validatedVolume)
const suppliers = computed(() => report.value?.suppliers || [])
const hasData   = computed(() => (report.value?.suppliers?.length || 0) > 0)

// US39 Scenario 2 – recompute the metric for the selected supplier.
function onFilterChange() {
  store.fetchValidatedVolume(supplier.value || null)
}

onMounted(() => store.fetchValidatedVolume(null))
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('analytics.volumeTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('analytics.volumeSubtitle') }}</p>
      </div>
    </div>

    <div v-if="store.loading && !report" class="gc-card center"><i class="pi pi-spin pi-spinner" /> {{ $t('common.loading') }}</div>

    <template v-else>
      <!-- Filter by supplier origin -->
      <div class="gc-card filter-bar">
        <div class="filter">
          <label>{{ $t('analytics.supplierFilter') }}</label>
          <select v-model="supplier" class="gc-input-dark" @change="onFilterChange">
            <option value="">{{ $t('analytics.allSuppliers') }}</option>
            <option v-for="s in suppliers" :key="s.supplierId" :value="s.supplierId">
              {{ $t('analytics.supplierLabel') }} {{ s.supplierId }}
            </option>
          </select>
        </div>
      </div>

      <!-- US39 Scenario 1 – total validated grams -->
      <div class="total-card">
        <span class="total-label">{{ supplier ? $t('analytics.totalForSupplier') : $t('analytics.totalValidated') }}</span>
        <span class="total-value">{{ report?.totalGrams ?? 0 }} <small>g</small></span>
        <span class="total-sub">{{ report?.totalPieces ?? 0 }} {{ $t('analytics.pieces') }}</span>
      </div>

      <!-- Per-supplier breakdown -->
      <div v-if="hasData" class="gc-card">
        <p class="section-title">{{ $t('analytics.bySupplier') }}</p>
        <table class="gc-table">
          <thead>
            <tr><th>{{ $t('analytics.supplierCol') }}</th><th>{{ $t('analytics.piecesCol') }}</th><th style="text-align:right">{{ $t('analytics.gramsCol') }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in suppliers" :key="s.supplierId" :class="{ active: s.supplierId === supplier }">
              <td class="mono">{{ s.supplierId }}</td>
              <td>{{ s.pieces }}</td>
              <td style="text-align:right"><strong>{{ s.grams }} g</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-else class="gc-card empty">
        <i class="pi pi-inbox" style="font-size:2.5rem;color:var(--gc-text-muted)" />
        <p class="empty-title">{{ $t('analytics.volumeEmptyTitle') }}</p>
        <p class="empty-desc">{{ $t('analytics.volumeEmptyDesc') }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; }
.center { text-align: center; padding: 2.5rem; color: var(--gc-text-muted); }
.filter-bar { margin-bottom: 1.25rem; }
.filter { display: flex; flex-direction: column; gap: 0.4rem; max-width: 360px; }
.filter label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.gc-input-dark { padding: 0.55rem 0.8rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; }
.total-card { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; padding: 2rem; margin-bottom: 1.25rem; background: linear-gradient(135deg, rgba(178,148,78,0.12), rgba(26,26,46,0.6)); border: 1px solid rgba(178,148,78,0.3); border-radius: 14px; }
.total-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gc-text-muted); }
.total-value { font-size: 3rem; font-weight: 800; color: var(--gc-gold-mid); line-height: 1; }
.total-value small { font-size: 1.2rem; font-weight: 600; }
.total-sub { font-size: 0.85rem; color: var(--gc-text-secondary); }
.section-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1rem; }
.gc-table { width: 100%; border-collapse: collapse; }
.gc-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-text-muted); padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--gc-border); }
.gc-table td { padding: 0.6rem 0.75rem; font-size: 0.85rem; color: var(--gc-text-primary); border-bottom: 1px solid var(--gc-border); }
.gc-table tr.active { background: rgba(178,148,78,0.08); }
.mono { font-family: monospace; color: var(--gc-gold-mid); }
.empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 3rem; gap: 0.5rem; }
.empty-title { font-size: 1rem; font-weight: 700; color: var(--gc-text-primary); margin: 0.5rem 0 0; }
.empty-desc { font-size: 0.85rem; color: var(--gc-text-muted); margin: 0; max-width: 320px; }
</style>
