<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConsumerStore } from '../../../application/consumer.store.js'
import VincularJoyaModal from './vincular-joya-modal.vue'

const { t }    = useI18n()
const store    = useConsumerStore()
const showLink = ref(false)
const journey  = ref(null)
const journeyModal = ref({ show: false, piece: null })

async function openJourney(piece) {
  journeyModal.value = { show: true, piece }
  journey.value = null
  journey.value = await store.fetchJourney(piece.qrCode)
}

function onLinked() { showLink.value = false }

onMounted(() => store.fetchPieces())
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('consumer.collectionTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('consumer.collectionSubtitle') }}</p>
      </div>
      <div class="gc-page-actions">
        <button class="gc-btn gc-btn-gold" @click="showLink = true">
          <i class="pi pi-plus" /> {{ $t('consumer.addPiece') }}
        </button>
      </div>
    </div>

    <!-- Empty -->
    <div v-if="!store.pieces.length" class="gc-card gc-empty-collection">
      <i class="pi pi-star-fill" style="font-size:3rem;color:var(--gc-gold-mid);margin-bottom:1rem;opacity:0.5" />
      <p class="gc-empty-title">{{ $t('consumer.emptyTitle') }}</p>
      <p class="gc-empty-sub">{{ $t('consumer.emptySubtitle') }}</p>
      <button class="gc-btn gc-btn-gold" style="margin-top:1.25rem" @click="showLink = true">
        <i class="pi pi-link" /> {{ $t('consumer.linkFirstPiece') }}
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="jewelry-grid">
      <div v-for="piece in store.pieces" :key="piece.qrCode" class="jewelry-card">
        <div class="jewelry-card-img">
          <i class="pi pi-star" style="font-size:2rem;color:var(--gc-gold-mid);opacity:0.6" />
        </div>
        <div class="jewelry-card-body">
          <div class="jewelry-sku">{{ piece.qrCode }}</div>
          <div class="jewelry-meta">
            {{ $t('consumer.scans') }}: {{ piece.scanCount || 0 }} ·
            <span class="gc-status gc-status-done">{{ piece.status }}</span>
          </div>
          <div class="jewelry-card-footer">
            <button class="gc-btn-icon" :title="$t('consumer.viewTraceability')" @click="openJourney(piece)">
              <i class="pi pi-shield" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <VincularJoyaModal v-if="showLink" @close="showLink = false" @linked="onLinked" />

    <!-- Journey modal -->
    <div v-if="journeyModal.show" class="gc-modal-overlay" @click.self="journeyModal.show = false">
      <div class="gc-modal" style="max-width:480px">
        <div class="gc-modal-header">
          <p class="gc-modal-title">
            <i class="pi pi-shield" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('consumer.viewTraceability') }}
          </p>
          <button class="gc-modal-close" @click="journeyModal.show = false">✕</button>
        </div>
        <div style="padding:1rem 0">
          <div class="trace-row"><span>QR Code</span><strong style="font-family:monospace;color:var(--gc-gold-mid)">{{ journeyModal.piece?.qrCode }}</strong></div>
          <div class="trace-row"><span>{{ $t('consumer.fieldStatus') }}</span><span class="gc-status gc-status-done">{{ journeyModal.piece?.status }}</span></div>
          <div v-if="journey" style="margin-top:1rem">
            <div class="trace-row"><span>{{ $t('consumer.journeySummary') }}</span><strong>{{ journey.journeySummary }}</strong></div>
            <div class="trace-row"><span>{{ $t('consumer.journeyStatus') }}</span><strong>{{ journey.status }}</strong></div>
          </div>
          <div v-else style="color:var(--gc-text-muted);font-size:0.83rem;margin-top:0.75rem;text-align:center">
            <i class="pi pi-spin pi-spinner" /> {{ $t('common.loading') }}
          </div>
        </div>
        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="journeyModal.show = false">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.jewelry-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1.25rem; }
.jewelry-card { background:var(--gc-dark-card);border:1px solid var(--gc-border);border-radius:12px;overflow:hidden;transition:border-color 0.2s,transform 0.2s; }
.jewelry-card:hover { border-color:var(--gc-gold-mid);transform:translateY(-2px); }
.jewelry-card-img { height:120px;background:rgba(178,148,78,0.06);display:flex;align-items:center;justify-content:center; }
.jewelry-card-body { padding:0.9rem; }
.jewelry-sku  { font-size:0.72rem;color:var(--gc-gold-mid);font-family:monospace;margin-bottom:0.4rem; }
.jewelry-meta { font-size:0.78rem;color:var(--gc-text-muted);margin-bottom:0.75rem;display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap; }
.jewelry-card-footer { display:flex;align-items:center;justify-content:flex-end; }
.gc-status      { font-size:0.72rem;padding:0.15rem 0.5rem;border-radius:20px;font-weight:500; }
.gc-status-done { background:rgba(74,222,128,0.15);color:#4ade80; }
.gc-btn-icon { background:transparent;border:none;color:var(--gc-text-muted);cursor:pointer;padding:0.25rem;border-radius:4px;transition:color 0.2s; }
.gc-btn-icon:hover { color:var(--gc-gold-mid); }
.gc-empty-collection { display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 2rem;text-align:center; }
.gc-empty-title { font-size:1rem;font-weight:600;color:var(--gc-text-primary); }
.gc-empty-sub   { font-size:0.85rem;color:var(--gc-text-muted);margin-top:0.4rem; }
.trace-row { display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;padding:0.4rem 0;border-bottom:1px solid var(--gc-border); }
.trace-row span:first-child { color:var(--gc-text-muted); }
</style>
