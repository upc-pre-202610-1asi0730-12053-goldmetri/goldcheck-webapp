<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConsumerStore } from '../../../application/consumer.store.js'
import { useIamStore } from '../../../../iam/application/iam.store.js'
import VincularJoyaModal from './vincular-joya-modal.vue'

const { t } = useI18n()

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

function translateStatus(s) {
  if (!s || s === 'Activo') return t('mineral.statusAvailable')
  return s
}

const consumerStore = useConsumerStore()
const iamStore = useIamStore()
const showLinkModal = ref(false)
const traceModal = reactive({ show: false, piece: null })

function onLinked() {
  showLinkModal.value = false
}

function openTrace(piece) {
  traceModal.piece = piece
  traceModal.show = true
}

onMounted(() => {
  consumerStore.fetchPieces(iamStore.currentUser?.id)
})
</script>

<template>
  <div class="gc-page">

    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('consumer.collectionTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('consumer.collectionSubtitle') }}</p>
      </div>
      <div class="gc-page-actions">
        <button class="gc-btn gc-btn-gold" @click="showLinkModal = true">
          <i class="pi pi-plus" /> {{ $t('consumer.addPiece') }}
        </button>
      </div>
    </div>

    <div v-if="consumerStore.loading" class="gc-card gc-loading-row">
      <i class="pi pi-spinner pi-spin" /> {{ $t('common.loading') }}
    </div>

    <div v-else-if="!consumerStore.pieces.length" class="gc-card gc-empty-collection">
      <i class="pi pi-star-fill" style="font-size:3rem;color:var(--gc-gold-mid);margin-bottom:1rem;opacity:0.5" />
      <p class="gc-empty-title">{{ $t('consumer.emptyTitle') }}</p>
      <p class="gc-empty-sub">{{ $t('consumer.emptySubtitle') }}</p>
      <button class="gc-btn gc-btn-gold" style="margin-top:1.25rem" @click="showLinkModal = true">
        <i class="pi pi-link" /> {{ $t('consumer.linkFirstPiece') }}
      </button>
    </div>

    <div v-else class="jewelry-grid">
      <div v-for="piece in consumerStore.pieces" :key="piece.id" class="jewelry-card">
        <div class="jewelry-card-img">
          <img v-if="piece.imageUrl" :src="piece.imageUrl" :alt="piece.name" />
          <i v-else class="pi pi-star" style="font-size:2rem;color:var(--gc-gold-mid);opacity:0.6" />
        </div>
        <div class="jewelry-card-body">
          <div class="jewelry-sku">{{ piece.sku || piece.traceabilityCode }}</div>
          <div class="jewelry-name">{{ piece.name }}</div>
          <div class="jewelry-meta">{{ translateJewelryType(piece.type) }} · {{ piece.purity }} · {{ piece.weight }}g</div>
          <div class="jewelry-card-footer">
            <span class="gc-status gc-status-done">{{ translateStatus(piece.status) }}</span>
            <button class="gc-btn-icon" :title="$t('consumer.viewTraceability')" @click="openTrace(piece)">
              <i class="pi pi-shield" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <VincularJoyaModal
      v-if="showLinkModal"
      @close="showLinkModal = false"
      @linked="onLinked"
    />

    <!-- Traceability modal -->
    <div v-if="traceModal.show" class="gc-modal-overlay" @click.self="traceModal.show = false">
      <div class="gc-modal" style="max-width:480px">
        <div class="gc-modal-header">
          <p class="gc-modal-title">
            <i class="pi pi-shield" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('consumer.viewTraceability') }}
          </p>
          <button class="gc-modal-close" @click="traceModal.show = false">✕</button>
        </div>

        <div style="padding:1rem 0">
          <!-- QR code display -->
          <div class="qr-box">
            <div class="qr-code-visual">
              <i class="pi pi-qrcode" style="font-size:4rem;color:var(--gc-gold-mid)" />
            </div>
            <p class="qr-label">{{ traceModal.piece?.traceabilityCode }}</p>
          </div>

          <div style="display:flex;flex-direction:column;gap:0.6rem;margin-top:1rem">
            <div class="trace-row">
              <span>{{ $t('consumer.purchaseName') }}</span>
              <strong>{{ traceModal.piece?.name }}</strong>
            </div>
            <div class="trace-row">
              <span>{{ $t('consumer.pieceType') }}</span>
              <strong>{{ traceModal.piece?.type }}</strong>
            </div>
            <div class="trace-row">
              <span>{{ $t('consumer.purity') }}</span>
              <strong>{{ traceModal.piece?.purity }}</strong>
            </div>
            <div class="trace-row">
              <span>{{ $t('consumer.fieldWeight') }}</span>
              <strong>{{ traceModal.piece?.weight }}g</strong>
            </div>
            <div class="trace-row">
              <span>{{ $t('jewelry.certDate') }}</span>
              <strong>{{ traceModal.piece?.purchaseDate ? new Date(traceModal.piece.purchaseDate).toLocaleDateString('es-PE') : '—' }}</strong>
            </div>
            <div class="trace-row">
              <span>{{ $t('jewelry.certStatus') }}</span>
              <span class="gc-status gc-status-done">{{ traceModal.piece?.status }}</span>
            </div>
          </div>
        </div>

        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="traceModal.show = false">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.jewelry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}
.jewelry-card {
  background: var(--gc-dark-card); border: 1px solid var(--gc-border);
  border-radius: 12px; overflow: hidden; transition: border-color 0.2s, transform 0.2s;
}
.jewelry-card:hover { border-color: var(--gc-gold-mid); transform: translateY(-2px); }
.jewelry-card-img {
  height: 140px; background: rgba(178,148,78,0.06);
  display: flex; align-items: center; justify-content: center;
}
.jewelry-card-img img { width: 100%; height: 100%; object-fit: cover; }
.jewelry-card-body { padding: 0.9rem; }
.jewelry-sku  { font-size: 0.7rem; color: var(--gc-gold-mid); font-family: monospace; margin-bottom: 0.2rem; }
.jewelry-name { font-size: 0.9rem; font-weight: 600; color: var(--gc-text-primary); margin-bottom: 0.2rem; }
.jewelry-meta { font-size: 0.78rem; color: var(--gc-text-muted); margin-bottom: 0.75rem; }
.jewelry-card-footer { display: flex; align-items: center; justify-content: space-between; }
.gc-status      { font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 20px; font-weight: 500; }
.gc-status-done { background: rgba(74,222,128,0.15); color: #4ade80; }
.gc-btn-icon {
  background: transparent; border: none; color: var(--gc-text-muted);
  cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: color 0.2s;
}
.gc-btn-icon:hover { color: var(--gc-gold-mid); }
.gc-loading-row, .gc-empty-collection {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 4rem 2rem; text-align: center;
}
.gc-empty-title { font-size: 1rem; font-weight: 600; color: var(--gc-text-primary); }
.gc-empty-sub   { font-size: 0.85rem; color: var(--gc-text-muted); margin-top: 0.4rem; }
.qr-box { display:flex; flex-direction:column; align-items:center; padding:1.5rem; background:rgba(178,148,78,0.06); border-radius:12px; border:1px solid rgba(178,148,78,0.2); }
.qr-code-visual { padding:1rem; background:white; border-radius:8px; margin-bottom:0.75rem; }
.qr-label { font-family:monospace; font-size:1rem; font-weight:700; color:var(--gc-gold-mid); letter-spacing:0.05em; }
.trace-row { display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; padding:0.35rem 0; border-bottom:1px solid var(--gc-border); }
.trace-row span:first-child { color:var(--gc-text-muted); }
</style>
