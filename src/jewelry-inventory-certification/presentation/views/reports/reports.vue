<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.reportsTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.reportsSubtitle') }}</p>
      </div>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-stats-row">
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('jewelry.goldValidated') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-gold-mid)">{{ totalValidatedWeight }}g</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('jewelry.certifiedJewels') }}</p>
          <p class="gc-stat-value" style="color:#4ade80">{{ store.certifiedCount }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('jewelry.avgShrinkage') }}</p>
          <p class="gc-stat-value">{{ avgWeight }}g</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('jewelry.currentInventory') }}</p>
          <p class="gc-stat-value">{{ store.items.length }}</p>
        </div>
      </div>

      <div class="gc-card" style="margin-top:1.5rem">
        <p class="gc-section-title">{{ $t('jewelry.inventoryTable') }}</p>
        <table class="gc-table" v-if="store.items.length">
          <thead>
            <tr>
              <th>{{ $t('jewelry.pieceName') }}</th>
              <th>{{ $t('jewelry.colType') }}</th>
              <th>{{ $t('jewelry.netWeight') }}</th>
              <th>{{ $t('jewelry.purity') }}</th>
              <th>{{ $t('jewelry.colStatus') }}</th>
              <th>{{ $t('jewelry.qrStatus') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in store.items" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.weight }}g</td>
              <td>{{ item.purity }}</td>
              <td><span class="gc-status" :class="statusClass(item.status)">{{ item.status }}</span></td>
              <td>
                <span class="gc-status" :class="item.certificationId ? 'gc-status-done' : 'gc-status-loading'">
                  {{ item.certificationId ? $t('jewelry.generated') : $t('jewelry.pending') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('jewelry.noItems') }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useJewelryStore } from '../../../application/jewelry.store.js'

const store = useJewelryStore()
onMounted(() => store.fetchItems())

const totalValidatedWeight = computed(() =>
  store.items.filter(i => i.status !== 'Pendiente').reduce((s, i) => s + (i.weight || 0), 0).toFixed(1)
)
const avgWeight = computed(() => {
  if (!store.items.length) return '0'
  return (store.items.reduce((s, i) => s + (i.weight || 0), 0) / store.items.length).toFixed(1)
})

function statusClass(s) {
  return { 'Pendiente': 'gc-status-loading', 'Validado': 'gc-status-transit', 'Certificado': 'gc-status-done' }[s] || ''
}
</script>

<style scoped>
.gc-stats-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.gc-stat-card { background: var(--gc-surface); border: 1px solid var(--gc-border); border-radius: 10px; padding: 1.25rem 2rem; min-width: 160px; }
.gc-stat-label { font-size: 0.75rem; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .35rem; }
.gc-stat-value { font-size: 1.8rem; font-weight: 800; color: var(--gc-text-primary); }
.gc-status { font-size:0.75rem; padding:0.2rem 0.55rem; border-radius:20px; font-weight:500; }
.gc-status-loading { background:rgba(250,204,21,0.15); color:#facc15; }
.gc-status-transit { background:rgba(59,130,246,0.15); color:#60a5fa; }
.gc-status-done    { background:rgba(74,222,128,0.15); color:#4ade80; }
</style>
