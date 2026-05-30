<script setup>
import { ref, onMounted } from 'vue'
import { useIncidentManagementStore } from '../../../application/incident-management.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'

const store     = useIncidentManagementStore()
const showModal = ref(false)

function severityClass(s) {
  return { 'badge-danger': s === 'CRITICAL' || s === 'HIGH', 'badge-warning': s === 'MEDIUM', 'badge-info': s === 'LOW' }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-PE')
}

onMounted(() => store.fetchIncidents())
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('incidents.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('incidents.dashboardSubtitle') }}</p>
      </div>
      <button class="gc-btn gc-btn-gold" @click="showModal = true">
        <i class="pi pi-plus" /> {{ $t('incidents.newIncident') }}
      </button>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-kpi-grid">
        <StatCard :label="$t('incidents.openCount')" :value="store.openCount" icon="pi pi-folder-open" trend="" :alert-active="store.openCount > 0" />
        <StatCard :label="$t('incidents.criticalCount')" :value="store.criticalIncidents.length" icon="pi pi-exclamation-circle" trend="" :alert-active="store.criticalIncidents.length > 0" />
      </div>

      <div class="gc-card" style="margin-top:1.5rem">
        <p class="gc-section-title">{{ $t('incidents.listTitle') }}</p>
        <table class="gc-table" v-if="store.incidents.length">
          <thead>
            <tr>
              <th>{{ $t('incidents.colType') }}</th>
              <th>{{ $t('incidents.colSeverity') }}</th>
              <th>{{ $t('incidents.colStatus') }}</th>
              <th>{{ $t('incidents.colDate') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inc in store.incidents" :key="inc.id">
              <td>{{ inc.incidentType }}</td>
              <td>
                <span class="gc-badge" :class="severityClass(inc.severity)">{{ inc.severity }}</span>
              </td>
              <td>{{ inc.status }}</td>
              <td>{{ formatDate(inc.reportedAt) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('incidents.noIncidents') }}
        </p>
      </div>
    </template>

    <div v-if="showModal" class="gc-modal-overlay" @click.self="showModal = false">
      <div class="gc-modal" style="max-width:440px">
        <div class="gc-modal-header">
          <p class="gc-modal-title">
            <i class="pi pi-exclamation-triangle" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('incidents.newIncident') }}
          </p>
          <button class="gc-modal-close" @click="showModal = false">✕</button>
        </div>
        <p style="color:var(--gc-text-muted);font-size:0.85rem;padding:1rem 0">
          {{ $t('common.comingSoon') }}
        </p>
        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="showModal = false">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gc-kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.gc-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
.badge-danger  { background: rgba(239,68,68,.15); color: #ef4444; }
.badge-warning { background: rgba(234,179,8,.15);  color: #eab308; }
.badge-info    { background: rgba(59,130,246,.15); color: #3b82f6; }
</style>
