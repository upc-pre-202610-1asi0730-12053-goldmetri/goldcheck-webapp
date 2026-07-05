<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAnalyticsStore } from '../../../application/analytics.store.js'

const { t } = useI18n()
const store = useAnalyticsStore()

// US38 – month filter (defaults to the current month).
const now      = new Date()
const monthStr = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

// US40 – deferred-export notification.
const exportMsg = ref('')
const exporting = ref(false)

const report  = computed(() => store.shrinkage)
const batches = computed(() => report.value?.batches || [])
const hasData = computed(() => batches.value.length > 0)
const maxPct  = computed(() => Math.max(1, ...batches.value.map(b => b.shrinkagePercent)))

function load() {
  const [y, m] = monthStr.value.split('-').map(Number)
  store.fetchShrinkage(y, m)
}

function barHeight(pct) {
  return Math.max(2, (pct / maxPct.value) * 150)
}
function barColor(pct) {
  return pct > 5 ? '#f87171' : '#b2944e' // critical shrinkage (>5%) in red
}

async function exportHistory() {
  exporting.value = true
  exportMsg.value = ''
  const res = await store.exportBatchHistory()
  exporting.value = false
  if (!res.ok) { exportMsg.value = t('analytics.exportError'); return }
  exportMsg.value = res.deferred ? t('analytics.exportDeferred') : t('analytics.exportDone')
}

onMounted(load)
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('analytics.shrinkageTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('analytics.shrinkageSubtitle') }}</p>
      </div>
    </div>

    <!-- Filters + export -->
    <div class="gc-card toolbar">
      <div class="filter">
        <label>{{ $t('analytics.month') }}</label>
        <input type="month" v-model="monthStr" class="gc-input-dark" @change="load" />
      </div>
      <button class="gc-btn gc-btn-outline" :disabled="exporting" @click="exportHistory">
        <i v-if="exporting" class="pi pi-spin pi-spinner" />
        <i v-else class="pi pi-download" />
        {{ $t('analytics.exportCsv') }}
      </button>
    </div>
    <p v-if="exportMsg" class="export-msg">{{ exportMsg }}</p>

    <!-- Loading -->
    <div v-if="store.loading" class="gc-card center"><i class="pi pi-spin pi-spinner" /> {{ $t('common.loading') }}</div>

    <!-- US38 Scenario 1 – comparative bar chart -->
    <template v-else-if="hasData">
      <div class="kpis">
        <div class="kpi"><span>{{ $t('analytics.kpiBatches') }}</span><strong>{{ report.totalBatches }}</strong></div>
        <div class="kpi"><span>{{ $t('analytics.kpiAvgShrinkage') }}</span><strong>{{ report.avgShrinkagePercent }}%</strong></div>
        <div class="kpi"><span>{{ $t('analytics.kpiInitial') }}</span><strong>{{ report.totalInitialTons }} t</strong></div>
        <div class="kpi"><span>{{ $t('analytics.kpiShrinkageTons') }}</span><strong>{{ report.totalShrinkageTons }} t</strong></div>
      </div>

      <div class="gc-card">
        <p class="chart-title">{{ $t('analytics.chartTitle') }}</p>
        <div class="chart">
          <div v-for="b in batches" :key="b.batchId" class="bar-col">
            <span class="bar-val">{{ b.shrinkagePercent }}%</span>
            <div class="bar" :style="{ height: barHeight(b.shrinkagePercent) + 'px', background: barColor(b.shrinkagePercent) }" />
            <span class="bar-label">{{ b.batchId }}</span>
            <span class="bar-type">{{ b.mineralType }}</span>
          </div>
        </div>
        <p class="chart-legend"><span class="dot" style="background:#b2944e" /> {{ $t('analytics.legendNormal') }} &nbsp; <span class="dot" style="background:#f87171" /> {{ $t('analytics.legendCritical') }}</p>
      </div>
    </template>

    <!-- US38 Scenario 2 – empty state -->
    <div v-else class="gc-card empty">
      <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--gc-border)" stroke-width="3" />
        <path d="M35 78 L52 60 L66 70 L86 44" fill="none" stroke="var(--gc-gold-mid)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.4" />
        <circle cx="60" cy="60" r="6" fill="var(--gc-gold-mid)" opacity="0.5" />
      </svg>
      <p class="empty-title">{{ $t('analytics.emptyTitle') }}</p>
      <p class="empty-desc">{{ $t('analytics.emptyDesc') }}</p>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; }
.toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.filter { display: flex; flex-direction: column; gap: 0.4rem; }
.filter label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.gc-input-dark { padding: 0.55rem 0.8rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; color-scheme: dark; }
.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-outline { background: transparent; border: 1px solid var(--gc-border); color: var(--gc-text-secondary); }
.gc-btn-outline:hover { border-color: var(--gc-gold-mid); color: var(--gc-text-primary); }
.export-msg { font-size: 0.82rem; color: var(--gc-gold-mid); margin: 0.75rem 0 0; }
.center { text-align: center; padding: 2.5rem; color: var(--gc-text-muted); }
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin: 1.25rem 0; }
.kpi { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 10px; padding: 1rem; display: flex; flex-direction: column; gap: 0.3rem; }
.kpi span { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-text-muted); }
.kpi strong { font-size: 1.3rem; color: var(--gc-text-primary); }
.chart-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1.5rem; }
.chart { display: flex; align-items: flex-end; gap: 1rem; min-height: 200px; overflow-x: auto; padding-bottom: 0.5rem; }
.bar-col { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; min-width: 56px; }
.bar-val { font-size: 0.75rem; font-weight: 700; color: var(--gc-text-secondary); }
.bar { width: 34px; border-radius: 6px 6px 0 0; transition: height 0.4s ease; }
.bar-label { font-size: 0.72rem; font-family: monospace; color: var(--gc-gold-mid); }
.bar-type { font-size: 0.66rem; color: var(--gc-text-muted); }
.chart-legend { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: var(--gc-text-muted); margin-top: 1.25rem; }
.dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
.empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 3rem; gap: 0.5rem; }
.empty-title { font-size: 1rem; font-weight: 700; color: var(--gc-text-primary); margin: 0.5rem 0 0; }
.empty-desc { font-size: 0.85rem; color: var(--gc-text-muted); margin: 0; max-width: 320px; }
</style>
