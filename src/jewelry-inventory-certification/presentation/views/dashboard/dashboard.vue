<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useJewelryStore } from '../../../application/jewelry.store.js'
import { useIamStore }     from '../../../../iam/application/iam.store.js'
import StatCard from '../../../../shared/presentation/components/stat-card.vue'

const { t }        = useI18n()
const store        = useJewelryStore()
const iamStore     = useIamStore()

function currentJewelerId() {
  return String(iamStore.currentUser?.userId || '')
}

// ── Scan QR Modal ─────────────────────────────────────────────────────────────
const scanModal  = reactive({ show: false, materialId: '' })
const scanQRCode = ref('')
const scanError  = ref('')

function openScan(material) {
  scanModal.materialId = material.materialId
  scanQRCode.value     = ''
  scanError.value      = ''
  scanModal.show       = true
}

async function submitScan() {
  if (!scanQRCode.value.trim()) { scanError.value = t('jewelry.qrRequired'); return }
  const ok = await store.scanQR(scanModal.materialId, scanQRCode.value.trim())
  if (ok) { scanModal.show = false; await store.fetchItems() }
  else     { scanError.value = t('jewelry.scanError') }
}

// ── Generate Certificate ───────────────────────────────────────────────────────
async function generateCert(material) {
  const cert = await store.generateCertificate(material.materialId)
  if (cert) await store.fetchItems()
}

// ── Sign Certificate ───────────────────────────────────────────────────────────
const certModal = reactive({ show: false, cert: null })

async function signCert(material) {
  if (!material.certificateId) return
  const cert = await store.signCertificate(material.certificateId, currentJewelerId())
  if (cert) { certModal.cert = cert; certModal.show = true }
}

function statusClass(status) {
  const map = {
    'NonCertified': 'gc-status gc-status-loading',
    'Pending':      'gc-status gc-status-transit',
    'Certified':    'gc-status gc-status-done',
  }
  return map[status] || 'gc-status'
}

onMounted(() => store.fetchItems())
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
      <StatCard :label="$t('jewelry.pendingItems')"   :value="store.pendingCount"   icon="pi-clock"    trend="" />
      <StatCard :label="$t('jewelry.certifiedItems')" :value="store.certifiedCount" icon="pi-shield"   trend="" />
      <StatCard :label="$t('jewelry.totalItems')"     :value="store.materials.length" icon="pi-list"   trend="" />
    </div>

    <!-- Materials Table -->
    <div class="gc-card">
      <div class="gc-card-header">
        <span class="gc-card-title">
          <i class="pi pi-list" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
          {{ $t('jewelry.inventoryTable') }}
        </span>
      </div>

      <div v-if="store.loading" class="gc-loading-row">
        <i class="pi pi-spinner pi-spin" /> {{ $t('common.loading') }}
      </div>

      <table v-else class="gc-table">
        <thead>
          <tr>
            <th>{{ $t('jewelry.colMaterialId') }}</th>
            <th>{{ $t('jewelry.colJewelerId') }}</th>
            <th>{{ $t('jewelry.colStatus') }}</th>
            <th>{{ $t('jewelry.colQR') }}</th>
            <th>{{ $t('jewelry.colCertificate') }}</th>
            <th>{{ $t('mineral.colAction') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="store.materials.length === 0">
            <td colspan="6" class="gc-table-empty">{{ $t('jewelry.noItems') }}</td>
          </tr>
          <tr v-for="m in store.materials" :key="m.id">
            <td><span class="gc-badge gc-badge-code">{{ m.materialId }}</span></td>
            <td>{{ m.jewelerId }}</td>
            <td><span :class="statusClass(m.status)">{{ m.status }}</span></td>
            <td>{{ m.qrCode || '—' }}</td>
            <td>{{ m.certificateId || '—' }}</td>
            <td style="display:flex;gap:0.4rem;flex-wrap:wrap">
              <!-- Step 1: scan QR to move to Pending -->
              <button
                v-if="m.status === 'NonCertified'"
                class="gc-btn gc-btn-xs gc-btn-gold"
                @click="openScan(m)"
              >{{ $t('jewelry.scanQR') }}</button>

              <!-- Step 2: generate certificate -->
              <button
                v-else-if="m.status === 'Pending' && !m.certificateId"
                class="gc-btn gc-btn-xs gc-btn-gold"
                @click="generateCert(m)"
              >{{ $t('jewelry.certify') }}</button>

              <!-- Step 3: sign certificate -->
              <button
                v-else-if="m.certificateId && m.status !== 'Certified'"
                class="gc-btn gc-btn-xs gc-btn-gold"
                @click="signCert(m)"
              >{{ $t('jewelry.signCert') }}</button>

              <span v-else class="gc-text-muted" style="font-size:0.75rem">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Scan QR Modal -->
    <div v-if="scanModal.show" class="gc-modal-overlay" @click.self="scanModal.show = false">
      <div class="gc-modal" style="max-width:420px">
        <div class="gc-modal-header">
          <p class="gc-modal-title">
            <i class="pi pi-qrcode" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('jewelry.scanModalTitle') }}
          </p>
          <button class="gc-modal-close" @click="scanModal.show = false">✕</button>
        </div>
        <div style="padding:1rem 0;display:flex;flex-direction:column;gap:0.75rem">
          <p style="font-size:0.85rem;color:var(--gc-text-muted)">
            Material: <strong>{{ scanModal.materialId }}</strong>
          </p>
          <label style="font-size:0.82rem;color:var(--gc-text-secondary)">{{ $t('jewelry.qrCodeLabel') }}</label>
          <input v-model="scanQRCode" class="gc-input-dark" :placeholder="$t('jewelry.qrCodePh')" />
          <span v-if="scanError" class="gc-error-msg">{{ scanError }}</span>
        </div>
        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="scanModal.show = false">{{ $t('common.cancel') }}</button>
          <button class="gc-btn gc-btn-gold" :disabled="store.loading" @click="submitScan">{{ $t('jewelry.scanBtn') }}</button>
        </div>
      </div>
    </div>

    <!-- Signed Certificate Modal -->
    <div v-if="certModal.show" class="gc-modal-overlay" @click.self="certModal.show = false">
      <div class="gc-modal" style="max-width:420px">
        <div class="gc-modal-header">
          <p class="gc-modal-title">
            <i class="pi pi-shield" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('jewelry.certificationsTitle') }}
          </p>
          <button class="gc-modal-close" @click="certModal.show = false">✕</button>
        </div>
        <div v-if="certModal.cert" style="padding:1rem 0;display:flex;flex-direction:column;gap:0.75rem">
          <div class="cert-row"><span>{{ $t('jewelry.certId') }}</span><strong>{{ certModal.cert.certificateId }}</strong></div>
          <div class="cert-row"><span>Material ID</span><strong>{{ certModal.cert.materialId }}</strong></div>
          <div class="cert-row"><span>Jeweler ID</span><strong>{{ certModal.cert.jewelerId }}</strong></div>
          <div class="cert-row"><span>{{ $t('jewelry.certStatus') }}</span>
            <span class="gc-status gc-status-done">{{ certModal.cert.isSigned ? $t('jewelry.signed') : $t('jewelry.unsigned') }}</span>
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
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.gc-card-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem; }
.gc-card-title  { font-size:0.9rem;font-weight:600;color:var(--gc-text-primary); }
.gc-loading-row, .gc-table-empty { text-align:center;color:var(--gc-text-muted);font-size:0.85rem;padding:2rem 0; }
.gc-badge-code  { background:rgba(178,148,78,0.15);color:var(--gc-gold-mid);border:1px solid rgba(178,148,78,0.3);padding:0.15rem 0.5rem;border-radius:4px;font-size:0.78rem;font-family:monospace; }
.gc-status      { font-size:0.75rem;padding:0.2rem 0.55rem;border-radius:20px;font-weight:500; }
.gc-status-loading { background:rgba(250,204,21,0.15);color:#facc15; }
.gc-status-transit { background:rgba(59,130,246,0.15);color:#60a5fa; }
.gc-status-done    { background:rgba(74,222,128,0.15);color:#4ade80; }
.gc-btn-xs      { font-size:0.72rem;padding:0.2rem 0.6rem; }
.gc-text-muted  { color:var(--gc-text-muted); }
.cert-row       { display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;padding:0.35rem 0;border-bottom:1px solid var(--gc-border); }
.cert-row span:first-child { color:var(--gc-text-muted); }
@media (max-width:900px) { .gc-kpi-grid { grid-template-columns:repeat(2,1fr); } }
</style>
