<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useJewelryStore } from '../../../application/jewelry.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'
import ValidateLotModal from './validate-lot-modal.vue'

const { t } = useI18n()
const jewelryStore = useJewelryStore()

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
const showValidateModal = ref(false)
const selectedItem = ref(null)
const certModal = reactive({ show: false, cert: null })

const filteredItems = computed(() => {
  if (!statusFilter.value) return jewelryStore.items
  return jewelryStore.items.filter(i => i.status === statusFilter.value)
})

function itemStatusClass(status) {
  const map = {
    'Pendiente':   'gc-status gc-status-loading',
    'Validado':    'gc-status gc-status-transit',
    'Certificado': 'gc-status gc-status-done',
    'Vendido':     'gc-status gc-status-scale',
  }
  return map[status] || 'gc-status'
}

function openValidate(item) {
  selectedItem.value = item
  showValidateModal.value = true
}

function onValidated() {
  showValidateModal.value = false
}

async function certify(item) {
  await jewelryStore.issueCertificate(item.id)
}

async function viewCert(item) {
  if (!jewelryStore.certificates.length) await jewelryStore.fetchCertificates()
  const cert = jewelryStore.certificates.find(c => c.itemId === item.id || c.itemSku === item.sku)
  certModal.cert = cert || null
  certModal.show = true
}

onMounted(() => jewelryStore.fetchItems())
</script>

<template>
  <div class="gc-page">

    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.dashboardSubtitle') }}</p>
      </div>
      <div class="gc-page-actions">
        <button class="gc-btn gc-btn-gold" @click="$router.push({ name: 'jewelry-register' })">
          <i class="pi pi-plus" /> {{ $t('jewelry.registerItem') }}
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="gc-kpi-grid">
      <StatCard :label="$t('jewelry.pendingItems')" :value="jewelryStore.pendingCount" icon="pi-clock" trend="" />
      <StatCard :label="$t('jewelry.validatedItems')" :value="jewelryStore.validatedCount" icon="pi-verified" trend="" />
      <StatCard :label="$t('jewelry.certifiedItems')" :value="jewelryStore.certifiedCount" icon="pi-shield" trend="" />
      <StatCard :label="$t('jewelry.portfolioValue')" :value="'S/ ' + jewelryStore.totalValue.toLocaleString()" icon="pi-dollar" trend="" />
    </div>

    <!-- Inventory Table -->
    <div class="gc-card">
      <div class="gc-card-header">
        <span class="gc-card-title">
          <i class="pi pi-list" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
          {{ $t('jewelry.inventoryTable') }}
        </span>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <select v-model="statusFilter" class="gc-input-dark gc-select-sm">
            <option value="">{{ $t('jewelry.allStatuses') }}</option>
            <option value="Pendiente">{{ $t('jewelry.statusPending') }}</option>
            <option value="Validado">{{ $t('jewelry.statusValidated') }}</option>
            <option value="Certificado">{{ $t('jewelry.statusCertified') }}</option>
            <option value="Vendido">{{ $t('jewelry.statusSold') }}</option>
          </select>
        </div>
      </div>

      <div v-if="jewelryStore.loading" class="gc-loading-row">
        <i class="pi pi-spinner pi-spin" /> {{ $t('common.loading') }}
      </div>

      <table v-else class="gc-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>{{ $t('jewelry.colName') }}</th>
            <th>{{ $t('jewelry.colType') }}</th>
            <th>{{ $t('jewelry.colPurity') }}</th>
            <th>{{ $t('jewelry.colWeight') }}</th>
            <th>{{ $t('jewelry.colStatus') }}</th>
            <th>{{ $t('mineral.colAction') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredItems.length === 0">
            <td colspan="7" class="gc-table-empty">{{ $t('jewelry.noItems') }}</td>
          </tr>
          <tr v-for="item in filteredItems" :key="item.id">
            <td><span class="gc-badge gc-badge-code">{{ item.sku }}</span></td>
            <td>{{ item.name }}</td>
            <td>{{ translateJewelryType(item.type) }}</td>
            <td>{{ item.purity }}</td>
            <td>{{ item.weight }}g</td>
            <td><span :class="itemStatusClass(item.status)">{{ translateJewelryStatus(item.status) }}</span></td>
            <td style="display:flex;gap:0.4rem;flex-wrap:wrap">
              <button
                v-if="item.status === 'Pendiente'"
                class="gc-btn gc-btn-xs gc-btn-gold"
                @click="openValidate(item)"
              >{{ $t('jewelry.validate') }}</button>
              <button
                v-else-if="item.status === 'Validado'"
                class="gc-btn gc-btn-xs gc-btn-gold"
                @click="certify(item)"
              >{{ $t('jewelry.certify') }}</button>
              <button
                v-else-if="item.status === 'Certificado'"
                class="gc-btn gc-btn-xs gc-btn-outline"
                @click="viewCert(item)"
              >{{ $t('jewelry.viewCert') }}</button>
              <span v-else class="gc-text-muted" style="font-size:0.75rem">—</span>
              <button
                v-if="item.batchRef || item.materialOrigin"
                class="gc-btn gc-btn-xs gc-btn-origin"
                @click="$router.push({ name: 'jewelry-mineral-origin', query: { batch: item.batchRef || item.materialOrigin } })"
                :title="$t('trace.viewMineralOrigin')"
              >
                <i class="pi pi-sitemap" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ValidateLotModal
      v-if="showValidateModal"
      :item="selectedItem"
      @close="showValidateModal = false"
      @validated="onValidated"
    />

    <!-- Certificate modal -->
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
        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="certModal.show = false">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.gc-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.gc-card-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;
}

.gc-card-title {
  font-size: 0.9rem; font-weight: 600; color: var(--gc-text-primary);
}

.gc-select-sm {
  appearance: none; height: 2rem; padding: 0 0.75rem;
  font-size: 0.8rem; cursor: pointer;
}

.gc-loading-row, .gc-table-empty {
  text-align: center; color: var(--gc-text-muted); font-size: 0.85rem; padding: 2rem 0;
}

.gc-badge-code {
  background: rgba(178,148,78,0.15); color: var(--gc-gold-mid);
  border: 1px solid rgba(178,148,78,0.3);
  padding: 0.15rem 0.5rem; border-radius: 4px;
  font-size: 0.78rem; font-family: monospace;
}

.gc-status { font-size: 0.75rem; padding: 0.2rem 0.55rem; border-radius: 20px; font-weight: 500; }
.gc-status-loading  { background: rgba(250,204,21,0.15); color: #facc15; }
.gc-status-transit  { background: rgba(59,130,246,0.15); color: #60a5fa; }
.gc-status-done     { background: rgba(74,222,128,0.15); color: #4ade80; }
.gc-status-scale    { background: rgba(168,85,247,0.15); color: #c084fc; }

.gc-btn-xs { font-size: 0.72rem; padding: 0.2rem 0.6rem; }
.gc-btn-origin {
  font-size: 0.75rem; padding: 0.2rem 0.5rem;
  background: rgba(178,148,78,0.12); border: 1px solid rgba(178,148,78,0.3);
  color: var(--gc-gold-mid); border-radius: 6px; cursor: pointer; transition: background 0.2s;
}
.gc-btn-origin:hover { background: rgba(178,148,78,0.22); }

.gc-text-muted { color: var(--gc-text-muted); }

@media (max-width: 1100px) { .gc-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
.cert-row { display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;padding:0.35rem 0;border-bottom:1px solid var(--gc-border); }
.cert-row span:first-child { color:var(--gc-text-muted); }
</style>
