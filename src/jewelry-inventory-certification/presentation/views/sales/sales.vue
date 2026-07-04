<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useJewelryStore } from '../../../application/jewelry.store.js'

const { t } = useI18n()
const store = useJewelryStore()

const feedback     = ref('')
const feedbackType = ref('')
const busyId       = ref('')

onMounted(() => store.fetchItems())

const materials = computed(() => store.materials)

function isSold(m) { return m.status === 'Sold' }

async function markSold(m) {
  feedback.value = ''
  busyId.value = m.materialId
  const res = await store.markAsSold(m.materialId)
  busyId.value = ''
  if (res.ok) {
    feedback.value = t('jewelry.saleSold', { id: m.materialId }); feedbackType.value = 'success'
  } else {
    feedback.value = store.errors[0] === 'alreadySold' ? t('jewelry.saleAlready') : t('jewelry.saleError')
    feedbackType.value = 'error'
  }
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.saleTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.saleSubtitle') }}</p>
      </div>
    </div>

    <div v-if="feedback" class="gc-alert" :class="`gc-alert-${feedbackType}`">{{ feedback }}</div>

    <div class="gc-card">
      <p class="gc-section-title">{{ $t('jewelry.saleListTitle') }}</p>
      <table class="gc-table" v-if="materials.length">
        <thead>
          <tr>
            <th>{{ $t('jewelry.saleColPiece') }}</th>
            <th>{{ $t('jewelry.saleColPurity') }}</th>
            <th>{{ $t('jewelry.saleColQr') }}</th>
            <th>{{ $t('jewelry.saleColStatus') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in materials" :key="m.materialId">
            <td>{{ m.materialId }}</td>
            <td>{{ m.verifiedKarats ? m.verifiedKarats + 'k' : '—' }}</td>
            <td>{{ m.qrCode || '—' }}</td>
            <td>
              <span class="status-chip" :class="isSold(m) ? 'chip-sold' : 'chip-active'">
                {{ isSold(m) ? $t('jewelry.saleStatusSold') : $t('jewelry.saleStatusActive') }}
              </span>
            </td>
            <td style="text-align:right">
              <button
                class="gc-btn gc-btn-gold gc-btn-xs"
                :disabled="isSold(m) || busyId === m.materialId"
                @click="markSold(m)"
              >
                <i v-if="busyId === m.materialId" class="pi pi-spin pi-spinner" />
                <i v-else class="pi pi-check" />
                {{ isSold(m) ? $t('jewelry.saleSoldBtn') : $t('jewelry.saleMarkBtn') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">{{ $t('jewelry.saleNoMaterials') }}</p>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; }
.gc-section-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1rem; }
.gc-table { width: 100%; border-collapse: collapse; }
.gc-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-text-muted); padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--gc-border); }
.gc-table td { padding: 0.6rem 0.75rem; font-size: 0.85rem; color: var(--gc-text-primary); border-bottom: 1px solid var(--gc-border); }
.status-chip { font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
.chip-active { background: rgba(74,222,128,.15); color: #4ade80; }
.chip-sold { background: rgba(148,148,148,.18); color: #9ca3af; }
.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-xs { font-size: 0.75rem; padding: 0.35rem 0.75rem; }
.gc-btn-gold { background: var(--gc-gold-mid); color: #000; }
.gc-btn-gold:disabled { opacity: 0.45; cursor: not-allowed; }
.empty { color: var(--gc-text-muted); text-align: center; padding: 1.5rem; }
.gc-alert { padding: 0.7rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.gc-alert-success { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
.gc-alert-error { background: rgba(239,68,68,.1); color: #ef4444; border: 1px solid rgba(239,68,68,.25); }
</style>
