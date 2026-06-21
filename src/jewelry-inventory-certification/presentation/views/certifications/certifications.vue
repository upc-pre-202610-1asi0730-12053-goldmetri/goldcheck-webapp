<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { materialOperationsApi } from '../../../../material-operations/infrastructure/material-operations-api.js'

const { t }    = useI18n()
const batchId  = ref('')
const result   = ref(null)
const searched = ref(false)
const loading  = ref(false)
const errorMsg = ref('')

async function lookup() {
  if (!batchId.value.trim()) return
  loading.value  = true
  result.value   = null
  searched.value = false
  errorMsg.value = ''
  try {
    const res = await materialOperationsApi.getMaterialById(batchId.value.trim())
    if (res.data) {
      const m = res.data
      result.value = {
        batchId:     m.batchId,
        mineralType: m.mineralType,
        payloadTons: m.payloadTons,
        status:      m.status,
        qrCode:      `QR-GC-${m.batchId}-${Date.now().toString(36).toUpperCase()}`
      }
    } else {
      errorMsg.value = t('jewelry.batchNotFound')
    }
  } catch {
    errorMsg.value = t('jewelry.batchNotFound')
  } finally {
    loading.value  = false
    searched.value = true
  }
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.certificationsTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.certificationsSubtitle') }}</p>
      </div>
    </div>

    <!-- Search -->
    <div class="gc-card search-row">
      <input
        v-model="batchId"
        class="gc-input-dark"
        style="flex:1"
        :placeholder="$t('jewelry.certBatchPh')"
        @keyup.enter="lookup"
      />
      <button class="gc-btn gc-btn-gold" :disabled="loading || !batchId.trim()" @click="lookup">
        <i v-if="loading" class="pi pi-spin pi-spinner" />
        <i v-else class="pi pi-search" />
        {{ $t('jewelry.certLookupBtn') }}
      </button>
    </div>

    <!-- Not found -->
    <div v-if="searched && !result" class="gc-alert gc-alert-danger" style="margin-top:1rem">
      <i class="pi pi-times-circle" style="margin-right:0.5rem" />
      {{ errorMsg }}
    </div>

    <!-- Result -->
    <div v-if="result" class="gc-card cert-card" style="margin-top:1rem">
      <div class="cert-left">
        <div class="qr-box">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="140" height="140">
            <!-- QR ficticio generado con el batchId como seed -->
            <rect width="100" height="100" fill="#1a1a2e"/>
            <!-- Top-left finder -->
            <rect x="5" y="5" width="30" height="30" rx="3" fill="#b2944e"/>
            <rect x="10" y="10" width="20" height="20" rx="2" fill="#1a1a2e"/>
            <rect x="14" y="14" width="12" height="12" rx="1" fill="#b2944e"/>
            <!-- Top-right finder -->
            <rect x="65" y="5" width="30" height="30" rx="3" fill="#b2944e"/>
            <rect x="70" y="10" width="20" height="20" rx="2" fill="#1a1a2e"/>
            <rect x="74" y="14" width="12" height="12" rx="1" fill="#b2944e"/>
            <!-- Bottom-left finder -->
            <rect x="5" y="65" width="30" height="30" rx="3" fill="#b2944e"/>
            <rect x="10" y="70" width="20" height="20" rx="2" fill="#1a1a2e"/>
            <rect x="14" y="74" width="12" height="12" rx="1" fill="#b2944e"/>
            <!-- Data modules (pseudo-random pattern) -->
            <rect x="40" y="5"  width="5" height="5" fill="#b2944e"/>
            <rect x="50" y="5"  width="5" height="5" fill="#b2944e"/>
            <rect x="55" y="10" width="5" height="5" fill="#b2944e"/>
            <rect x="40" y="15" width="5" height="5" fill="#b2944e"/>
            <rect x="50" y="20" width="5" height="5" fill="#b2944e"/>
            <rect x="40" y="25" width="5" height="5" fill="#b2944e"/>
            <rect x="60" y="20" width="5" height="5" fill="#b2944e"/>
            <rect x="5"  y="40" width="5" height="5" fill="#b2944e"/>
            <rect x="15" y="40" width="5" height="5" fill="#b2944e"/>
            <rect x="25" y="45" width="5" height="5" fill="#b2944e"/>
            <rect x="5"  y="50" width="5" height="5" fill="#b2944e"/>
            <rect x="20" y="55" width="5" height="5" fill="#b2944e"/>
            <rect x="10" y="60" width="5" height="5" fill="#b2944e"/>
            <rect x="40" y="40" width="5" height="5" fill="#b2944e"/>
            <rect x="50" y="45" width="5" height="5" fill="#b2944e"/>
            <rect x="60" y="40" width="5" height="5" fill="#b2944e"/>
            <rect x="45" y="55" width="5" height="5" fill="#b2944e"/>
            <rect x="55" y="50" width="5" height="5" fill="#b2944e"/>
            <rect x="65" y="55" width="5" height="5" fill="#b2944e"/>
            <rect x="70" y="45" width="5" height="5" fill="#b2944e"/>
            <rect x="80" y="40" width="5" height="5" fill="#b2944e"/>
            <rect x="85" y="50" width="5" height="5" fill="#b2944e"/>
            <rect x="75" y="55" width="5" height="5" fill="#b2944e"/>
            <rect x="40" y="65" width="5" height="5" fill="#b2944e"/>
            <rect x="50" y="70" width="5" height="5" fill="#b2944e"/>
            <rect x="60" y="65" width="5" height="5" fill="#b2944e"/>
            <rect x="45" y="80" width="5" height="5" fill="#b2944e"/>
            <rect x="55" y="75" width="5" height="5" fill="#b2944e"/>
            <rect x="65" y="80" width="5" height="5" fill="#b2944e"/>
            <rect x="75" y="70" width="5" height="5" fill="#b2944e"/>
            <rect x="80" y="80" width="5" height="5" fill="#b2944e"/>
            <rect x="90" y="65" width="5" height="5" fill="#b2944e"/>
            <rect x="85" y="75" width="5" height="5" fill="#b2944e"/>
          </svg>
          <p class="qr-code-text">{{ result.qrCode }}</p>
        </div>
      </div>

      <div class="cert-right">
        <p class="cert-title">
          <i class="pi pi-shield" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
          {{ $t('jewelry.certCardTitle') }}
        </p>
        <div class="cert-row"><span>Batch ID</span><strong style="font-family:monospace;color:var(--gc-gold-mid)">{{ result.batchId }}</strong></div>
        <div class="cert-row"><span>{{ $t('jewelry.certMineralType') }}</span><strong>{{ result.mineralType }}</strong></div>
        <div class="cert-row"><span>{{ $t('jewelry.certPayload') }}</span><strong>{{ result.payloadTons }} t</strong></div>
        <div class="cert-row"><span>{{ $t('jewelry.certStatus') }}</span>
          <span class="gc-status gc-status-done">{{ result.status }}</span>
        </div>
        <div class="cert-row"><span>{{ $t('jewelry.certIssuer') }}</span><strong>GoldMetrics Cert Authority</strong></div>
        <div class="cert-row" style="border:none"><span>{{ $t('jewelry.certDate') }}</span><strong>{{ new Date().toLocaleDateString('es-PE') }}</strong></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-row { display:flex;gap:0.75rem;align-items:center;padding:1.25rem; }

.cert-card {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding: 1.5rem;
}

.cert-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.qr-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem;
  background: rgba(178,148,78,0.06);
  border: 1px solid rgba(178,148,78,0.2);
  border-radius: 10px;
}

.qr-code-text {
  font-size: 0.7rem;
  font-family: monospace;
  color: var(--gc-gold-mid);
  word-break: break-all;
  text-align: center;
  max-width: 150px;
}

.cert-right { flex: 1; }

.cert-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gc-text-primary);
  margin-bottom: 1rem;
}

.cert-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--gc-border);
}
.cert-row span:first-child { color: var(--gc-text-muted); }

.gc-status      { font-size:0.75rem;padding:0.2rem 0.55rem;border-radius:20px;font-weight:500; }
.gc-status-done { background:rgba(74,222,128,0.15);color:#4ade80; }

@media (max-width: 600px) { .cert-card { flex-direction: column; } }
</style>
