<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('reporting.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('reporting.dashboardSubtitle') }}</p>
      </div>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-stats-row">
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('reporting.totalBatches') }}</p>
          <p class="gc-stat-value">{{ store.totalBatches }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('reporting.processed') }}</p>
          <p class="gc-stat-value" style="color:#4ade80">{{ store.processedBatches }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('reporting.totalAlerts') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-danger)">{{ store.totalAlerts }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('reporting.certified') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-gold-mid)">{{ store.certifiedItems }}</p>
        </div>
      </div>

      <div class="gc-card gc-coming-soon" style="margin-top:1.5rem">
        <i class="pi pi-file-pdf" style="font-size:2.5rem;color:var(--gc-gold-mid);margin-bottom:1rem" />
        <p style="color:var(--gc-text-secondary)">{{ $t('common.comingSoon') }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useReportingStore } from '../../../application/reporting.store.js'

const store = useReportingStore()
onMounted(() => store.fetchReports())
</script>

<style scoped>
.gc-stats-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.gc-stat-card { background: var(--gc-surface); border: 1px solid var(--gc-border); border-radius: 10px; padding: 1.25rem 2rem; min-width: 160px; }
.gc-stat-label { font-size: 0.75rem; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .35rem; }
.gc-stat-value { font-size: 1.8rem; font-weight: 800; color: var(--gc-text-primary); }
.gc-coming-soon { display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 2rem;text-align:center; }
</style>
