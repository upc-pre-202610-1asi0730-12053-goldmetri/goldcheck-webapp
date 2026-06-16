<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAnalyticsStore } from '../../../application/analytics.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'

const { t } = useI18n()
const store = useAnalyticsStore()

function shrinkagePct(b) {
  return (((b.initialWeight - b.finalWeight) / b.initialWeight) * 100).toFixed(2)
}

function translateStatus(s) {
  const map = {
    'Cargando':           t('mineral.statusLoading'),
    'En Tránsito':        t('mineral.statusInTransit'),
    'En Balanza':         t('mineral.statusOnScale'),
    'En Planta':          t('mineral.statusAtPlant'),
    'Completado':         t('mineral.statusCompleted'),
    'Procesado':          t('mineral.statusCompleted'),
    'Alerta':             t('mineral.statusAlert'),
    'Bajo Investigación': t('mineral.statusUnderInvestigation'),
  }
  return map[s] || s || '—'
}

onMounted(() => store.fetchAnalyticsData())
</script>

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
      <div class="gc-kpi-grid">
        <StatCard :label="$t('analytics.totalBatches')" :value="store.totalBatches" icon="pi pi-inbox" trend="" />
        <StatCard :label="$t('analytics.activeBatches')" :value="store.activeBatches" icon="pi pi-truck" trend="" />
        <StatCard :label="$t('analytics.avgShrinkage')" :value="store.avgShrinkage + '%'" icon="pi pi-chart-line" trend="" :alert-active="store.avgShrinkage > 5" />
        <StatCard :label="$t('analytics.totalJewels')" :value="store.totalJewels" icon="pi pi-star" trend="" />
        <StatCard :label="$t('analytics.certifiedJewels')" :value="store.certifiedJewels" icon="pi pi-shield" trend="" />
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
              <td>{{ translateStatus(b.status) }}</td>
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

<style scoped>
.gc-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
@media (max-width: 1200px) { .gc-kpi-grid { grid-template-columns: repeat(3, 1fr); } }
</style>
