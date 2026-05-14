<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('analytics.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('analytics.dashboardSubtitle') }}</p>
      </div>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-stats-row">
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('analytics.totalBatches') }}</p>
          <p class="gc-stat-value">{{ store.totalBatches }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('analytics.activeBatches') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-gold-mid)">{{ store.activeBatches }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('analytics.avgShrinkage') }}</p>
          <p class="gc-stat-value" :style="{ color: store.avgShrinkage > 5 ? 'var(--gc-danger)' : '#4ade80' }">
            {{ store.avgShrinkage }}%
          </p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('analytics.totalJewels') }}</p>
          <p class="gc-stat-value">{{ store.totalJewels }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('analytics.certifiedJewels') }}</p>
          <p class="gc-stat-value" style="color:#4ade80">{{ store.certifiedJewels }}</p>
        </div>
      </div>

      <div class="gc-card" style="margin-top:1.5rem">
        <p class="gc-section-title">{{ $t('analytics.batchShrinkageTitle') }}</p>
        <table class="gc-table" v-if="store.batchesWithShrinkage.length">
          <thead>
            <tr>
              <th>{{ $t('analytics.colBatch') }}</th>
              <th>{{ $t('analytics.colInitial') }}</th>
              <th>{{ $t('analytics.colFinal') }}</th>
              <th>{{ $t('analytics.colShrinkage') }}</th>
              <th>{{ $t('analytics.colStatus') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in store.batchesWithShrinkage" :key="b.id">
              <td>{{ b.batchCode }}</td>
              <td>{{ b.initialWeight }} t</td>
              <td>{{ b.finalWeight }} t</td>
              <td>
                <span :style="{ color: shrinkagePct(b) > 5 ? 'var(--gc-danger)' : '#4ade80', fontWeight: 700 }">
                  {{ shrinkagePct(b) }}%
                </span>
              </td>
              <td>{{ b.status }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('analytics.noShrinkageData') }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAnalyticsStore } from '../../../application/analytics.store.js'

const store = useAnalyticsStore()
onMounted(() => store.fetchAnalyticsData())

function shrinkagePct(b) {
  return (((b.initialWeight - b.finalWeight) / b.initialWeight) * 100).toFixed(2)
}
</script>

<style scoped>
.gc-stats-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.gc-stat-card { background: var(--gc-surface); border: 1px solid var(--gc-border); border-radius: 10px; padding: 1.25rem 2rem; min-width: 160px; }
.gc-stat-label { font-size: 0.75rem; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .35rem; }
.gc-stat-value { font-size: 1.8rem; font-weight: 800; color: var(--gc-text-primary); }
</style>
