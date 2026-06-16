<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useJewelryStore } from '../../../application/jewelry.store.js'

const { t } = useI18n()
const store = useJewelryStore()

function translateJewelryType(type) {
  const map = {
    'Anillo':   t('jewelry.typeRing'),
    'Collar':   t('jewelry.typeNecklace'),
    'Pulsera':  t('jewelry.typeBracelet'),
    'Arete':    t('jewelry.typeEarring'),
    'Colgante': t('jewelry.typePendant'),
  }
  return map[type] || type || '—'
}

function translateJewelryStatus(s) {
  const map = {
    'Pendiente':   t('jewelry.statusPending'),
    'Validado':    t('jewelry.statusValidated'),
    'Certificado': t('jewelry.statusCertified'),
    'Vendido':     t('jewelry.statusSold'),
  }
  return map[s] || s || '—'
}
const statusFilter = ref('')
const certModal = reactive({ show: false, cert: null })

const filteredItems = computed(() => {
  if (!statusFilter.value) return store.items
  return store.items.filter(i => i.status === statusFilter.value)
})

onMounted(() => store.fetchItems())

function statusClass(s) {
  return { 'Pendiente': 'gc-status-loading', 'Validado': 'gc-status-transit', 'Certificado': 'gc-status-done' }[s] || ''
}

async function validate(item) { await store.validateItem(item.id) }
async function certify(item) { await store.issueCertificate(item.id) }

async function viewCert(item) {
  if (!store.certificates.length) await store.fetchCertificates()
  certModal.cert = store.certificates.find(c => c.itemId === item.id || c.itemSku === item.sku) || null
  certModal.show = true
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.inventoryTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.inventorySubtitle') }}</p>
      </div>
      <button class="gc-btn gc-btn-gold" @click="$router.push('/app/jewelry/register')">
        <i class="pi pi-plus" /> {{ $t('jewelry.registerItem') }}
      </button>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div class="gc-stats-row">
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('jewelry.pendingItems') }}</p>
          <p class="gc-stat-value" style="color:#facc15">{{ store.pendingCount }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('jewelry.validatedItems') }}</p>
          <p class="gc-stat-value" style="color:#60a5fa">{{ store.validatedCount }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('jewelry.certifiedItems') }}</p>
          <p class="gc-stat-value" style="color:#4ade80">{{ store.certifiedCount }}</p>
        </div>
        <div class="gc-stat-card">
          <p class="gc-stat-label">{{ $t('jewelry.portfolioValue') }}</p>
          <p class="gc-stat-value" style="color:var(--gc-gold-mid)">S/ {{ store.totalValue.toLocaleString() }}</p>
        </div>
      </div>

      <div class="gc-card" style="margin-top:1.5rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
          <p class="gc-section-title" style="margin:0">{{ $t('jewelry.inventoryTable') }}</p>
          <select v-model="statusFilter" class="gc-select-sm">
            <option value="">{{ $t('jewelry.allStatuses') }}</option>
            <option value="Pendiente">{{ $t('jewelry.statusPending') }}</option>
            <option value="Validado">{{ $t('jewelry.statusValidated') }}</option>
            <option value="Certificado">{{ $t('jewelry.statusCertified') }}</option>
          </select>
        </div>

        <table class="gc-table" v-if="filteredItems.length">
          <thead>
            <tr>
              <th>SKU</th>
              <th>{{ $t('jewelry.colName') }}</th>
              <th>{{ $t('jewelry.colType') }}</th>
              <th>{{ $t('jewelry.colPurity') }}</th>
              <th>{{ $t('jewelry.colWeight') }}</th>
              <th>{{ $t('jewelry.portfolioValue') }}</th>
              <th>{{ $t('jewelry.colStatus') }}</th>
              <th>{{ $t('mineral.colAction') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id">
              <td><span class="gc-badge-code">{{ item.sku }}</span></td>
              <td>{{ item.name }}</td>
              <td>{{ translateJewelryType(item.type) }}</td>
              <td>{{ item.purity }}</td>
              <td>{{ item.weight }}g</td>
              <td>S/ {{ item.price?.toLocaleString() || '—' }}</td>
              <td><span class="gc-status" :class="statusClass(item.status)">{{ translateJewelryStatus(item.status) }}</span></td>
              <td style="display:flex;gap:0.4rem;flex-wrap:wrap">
                <button v-if="item.status === 'Pendiente'" class="gc-btn gc-btn-xs gc-btn-gold" @click="validate(item)">
                  {{ $t('jewelry.validate') }}
                </button>
                <button v-else-if="item.status === 'Validado'" class="gc-btn gc-btn-xs gc-btn-gold" @click="certify(item)">
                  {{ $t('jewelry.certify') }}
                </button>
                <button v-else-if="item.status === 'Certificado'" class="gc-btn gc-btn-xs gc-btn-outline" @click="viewCert(item)">
                  {{ $t('jewelry.viewCert') }}
                </button>
                <span v-else style="color:var(--gc-text-muted);font-size:0.75rem">—</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--gc-text-muted);text-align:center;padding:2rem">
          {{ $t('jewelry.noItems') }}
        </p>
      </div>
    </template>

    <div v-if="certModal.show" class="gc-modal-overlay" @click.self="certModal.show = false">
      <div class="gc-modal" style="max-width:460px">
        <div class="gc-modal-header">
          <p class="gc-modal-title">
            <i class="pi pi-shield" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('jewelry.certificationsTitle') }}
          </p>
          <button class="gc-modal-close" @click="certModal.show = false">✕</button>
        </div>
        <div v-if="certModal.cert" style="padding:1rem 0;display:flex;flex-direction:column;gap:0.75rem">
          <div class="cert-row"><span>SKU</span><strong>{{ certModal.cert.itemSku }}</strong></div>
          <div class="cert-row"><span>{{ $t('jewelry.certIssuer') }}</span><strong>{{ certModal.cert.issuerName }}</strong></div>
          <div class="cert-row"><span>{{ $t('jewelry.certPurity') }}</span><strong>{{ certModal.cert.purity }}</strong></div>
          <div class="cert-row"><span>{{ $t('jewelry.certWeight') }}</span><strong>{{ certModal.cert.weight }}g</strong></div>
          <div class="cert-row"><span>{{ $t('jewelry.certDate') }}</span><strong>{{ new Date(certModal.cert.issueDate).toLocaleDateString('es-PE') }}</strong></div>
          <div class="cert-row"><span>QR</span><strong style="color:var(--gc-gold-mid)">{{ certModal.cert.qrCode }}</strong></div>
          <div class="cert-row"><span>{{ $t('jewelry.certStatus') }}</span>
            <span class="gc-status gc-status-done">{{ certModal.cert.status }}</span>
          </div>
        </div>
        <p v-else style="color:var(--gc-text-muted);font-size:0.85rem;padding:1rem 0">
          {{ $t('jewelry.noCertificates') }}
        </p>
        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="certModal.show = false">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gc-stats-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.gc-stat-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 10px; padding: 1.25rem 2rem; min-width: 160px; }
.gc-stat-label { font-size: 0.75rem; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .35rem; }
.gc-stat-value { font-size: 1.8rem; font-weight: 800; color: var(--gc-text-primary); }
.gc-select-sm { appearance:none; height:2rem; padding:0 0.75rem; font-size:0.8rem; cursor:pointer; background:var(--gc-dark-2); border:1px solid var(--gc-border); border-radius:6px; color:var(--gc-text-primary); }
.gc-badge-code { background:rgba(178,148,78,0.15); color:var(--gc-gold-mid); border:1px solid rgba(178,148,78,0.3); padding:0.15rem 0.5rem; border-radius:4px; font-size:0.78rem; font-family:monospace; }
.gc-status { font-size:0.75rem; padding:0.2rem 0.55rem; border-radius:20px; font-weight:500; }
.gc-status-loading { background:rgba(250,204,21,0.15); color:#facc15; }
.gc-status-transit { background:rgba(59,130,246,0.15); color:#60a5fa; }
.gc-status-done    { background:rgba(74,222,128,0.15); color:#4ade80; }
.gc-btn-xs { font-size:0.72rem; padding:0.2rem 0.6rem; }
.cert-row { display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; padding:0.35rem 0; border-bottom:1px solid var(--gc-border); }
.cert-row span:first-child { color:var(--gc-text-muted); }
</style>
