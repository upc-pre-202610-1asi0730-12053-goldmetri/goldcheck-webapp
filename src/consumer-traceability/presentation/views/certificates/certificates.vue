<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('consumer.certsTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('consumer.certsSubtitle') }}</p>
      </div>
    </div>

    <div v-if="store.loading" class="gc-card" style="text-align:center;padding:3rem">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid)" />
    </div>

    <template v-else>
      <div v-if="!store.certificates.length" class="gc-card" style="display:flex;flex-direction:column;align-items:center;padding:4rem 2rem;text-align:center">
        <i class="pi pi-shield" style="font-size:2.5rem;color:var(--gc-gold-mid);margin-bottom:1rem;opacity:0.5" />
        <p style="color:var(--gc-text-muted)">{{ $t('jewelry.noCertificates') }}</p>
        <p style="color:var(--gc-text-muted);font-size:0.8rem;margin-top:0.4rem">
          {{ $t('consumer.noCertsHint') }}
        </p>
      </div>

      <div v-else class="certs-grid">
        <div v-for="cert in store.certificates" :key="cert.id" class="cert-card">
          <div class="cert-card-header">
            <i class="pi pi-shield" style="font-size:1.5rem;color:var(--gc-gold-mid)" />
            <span class="cert-badge">{{ $t('consumer.certActive') }}</span>
          </div>
          <div class="cert-sku">{{ cert.itemSku }}</div>
          <div class="cert-issuer">{{ cert.issuerName }}</div>
          <div class="cert-details">
            <div class="cert-row"><span>{{ $t('consumer.fieldPurity') }}</span><strong>{{ cert.purity }}</strong></div>
            <div class="cert-row"><span>{{ $t('consumer.fieldWeight') }}</span><strong>{{ cert.weight }}g</strong></div>
            <div class="cert-row"><span>{{ $t('consumer.certIssueDate') }}</span><strong>{{ new Date(cert.issueDate).toLocaleDateString() }}</strong></div>
            <div class="cert-row"><span>{{ $t('consumer.certExpiry') }}</span><strong>{{ cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : $t('consumer.noExpiry') }}</strong></div>
          </div>
          <div class="cert-qr">
            <div class="qr-visual"><i class="pi pi-qrcode" style="font-size:2.5rem;color:var(--gc-gold-mid)" /></div>
            <p class="qr-code">{{ cert.qrCode }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useConsumerStore } from '../../../application/consumer.store.js'
import { useIamStore } from '../../../../iam/application/iam.store.js'

const store    = useConsumerStore()
const iamStore = useIamStore()

onMounted(async () => {
  if (!store.pieces.length) await store.fetchPieces(iamStore.currentUser?.id)
  await store.fetchCertificates()
})
</script>

<style scoped>
.certs-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:1.25rem; }
.cert-card {
  background:var(--gc-dark-card); border:1px solid var(--gc-border); border-radius:12px;
  padding:1.25rem; transition:border-color 0.2s;
}
.cert-card:hover { border-color:var(--gc-gold-mid); }
.cert-card-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; }
.cert-badge { font-size:0.7rem; font-weight:700; padding:0.2rem 0.6rem; border-radius:20px; background:rgba(74,222,128,0.15); color:#4ade80; }
.cert-sku { font-family:monospace; font-size:0.8rem; color:var(--gc-gold-mid); margin-bottom:0.2rem; }
.cert-issuer { font-size:0.75rem; color:var(--gc-text-muted); margin-bottom:0.75rem; }
.cert-details { display:flex; flex-direction:column; gap:0.3rem; margin-bottom:1rem; }
.cert-row { display:flex; justify-content:space-between; font-size:0.82rem; padding:0.25rem 0; border-bottom:1px solid var(--gc-border); }
.cert-row span:first-child { color:var(--gc-text-muted); }
.cert-qr { display:flex; flex-direction:column; align-items:center; padding:0.75rem; background:rgba(178,148,78,0.06); border-radius:8px; }
.qr-visual { padding:0.5rem; background:white; border-radius:6px; margin-bottom:0.4rem; }
.qr-code { font-family:monospace; font-size:0.78rem; color:var(--gc-gold-mid); font-weight:700; }
</style>
