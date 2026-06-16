<script setup>
import { onMounted } from 'vue'
import { useReportingStore } from '../../../application/reporting.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'

const store = useReportingStore()

onMounted(() => store.fetchReports())
</script>

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
      <div class="gc-kpi-grid">
        <StatCard :label="$t('reporting.totalBatches')" :value="store.totalBatches" icon="pi pi-inbox" trend="" />
        <StatCard :label="$t('reporting.processed')" :value="store.processedBatches" icon="pi pi-check-circle" trend="" />
        <StatCard :label="$t('reporting.totalAlerts')" :value="store.totalAlerts" icon="pi pi-bell" trend="" :alert-active="store.totalAlerts > 0" />
        <StatCard :label="$t('reporting.certified')" :value="store.certifiedItems" icon="pi pi-shield" trend="" />
      </div>

      <div class="gc-card gc-coming-soon" style="margin-top:1.5rem">
        <i class="pi pi-file-pdf" style="font-size:2.5rem;color:var(--gc-gold-mid);margin-bottom:1rem" />
        <p style="color:var(--gc-text-secondary)">{{ $t('common.comingSoon') }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.gc-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.gc-coming-soon { display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 2rem;text-align:center; }
</style>
