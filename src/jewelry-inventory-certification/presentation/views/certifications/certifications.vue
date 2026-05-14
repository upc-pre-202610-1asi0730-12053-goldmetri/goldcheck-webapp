<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.certificationsTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.certificationsSubtitle') }}</p>
      </div>
    </div>

    <div class="gc-card">
      <div v-if="jewelryStore.loading" class="gc-loading-row">
        <i class="pi pi-spinner pi-spin" /> {{ $t('common.loading') }}
      </div>

      <div v-else-if="!jewelryStore.certificates.length" class="gc-coming-soon">
        <i class="pi pi-shield" style="font-size:2.5rem;color:var(--gc-gold-mid);margin-bottom:1rem" />
        <p style="color:var(--gc-text-secondary)">{{ $t('jewelry.noCertificates') }}</p>
      </div>

      <table v-else class="gc-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>SKU</th>
            <th>{{ $t('jewelry.certIssuer') }}</th>
            <th>{{ $t('jewelry.certPurity') }}</th>
            <th>{{ $t('jewelry.certWeight') }}</th>
            <th>{{ $t('jewelry.certDate') }}</th>
            <th>{{ $t('jewelry.certStatus') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cert in jewelryStore.certificates" :key="cert.id">
            <td><span class="gc-badge gc-badge-code">#{{ cert.id }}</span></td>
            <td>{{ cert.itemSku }}</td>
            <td>{{ cert.issuerName }}</td>
            <td>{{ cert.purity }}</td>
            <td>{{ cert.weight }}g</td>
            <td>{{ new Date(cert.issueDate).toLocaleDateString() }}</td>
            <td>
              <span class="gc-status" :class="cert.status === 'Activo' ? 'gc-status-done' : 'gc-status-loading'">
                {{ cert.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useJewelryStore } from '../../../application/jewelry.store.js'

const jewelryStore = useJewelryStore()
onMounted(() => jewelryStore.fetchCertificates())
</script>

<style scoped>
.gc-loading-row { text-align:center;color:var(--gc-text-muted);font-size:0.85rem;padding:2rem 0; }
.gc-coming-soon { display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 2rem;text-align:center; }
.gc-badge-code  { background:rgba(178,148,78,0.15);color:var(--gc-gold-mid);border:1px solid rgba(178,148,78,0.3);padding:0.15rem 0.5rem;border-radius:4px;font-size:0.78rem;font-family:monospace; }
.gc-status      { font-size:0.75rem;padding:0.2rem 0.55rem;border-radius:20px;font-weight:500; }
.gc-status-done { background:rgba(74,222,128,0.15);color:#4ade80; }
.gc-status-loading { background:rgba(250,204,21,0.15);color:#facc15; }
</style>
