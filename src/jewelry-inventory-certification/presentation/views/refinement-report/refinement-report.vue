<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { jsPDF } from 'jspdf'
import { useJewelryStore } from '../../../application/jewelry.store.js'

const { t } = useI18n()
const store = useJewelryStore()

const selectedMaterialId = ref('')
const report             = ref(null)
const loadingReport      = ref(false)
const feedback           = ref('')
const feedbackType       = ref('')

onMounted(() => store.fetchItems())

const clientLots = computed(() => store.materials.filter(m => m.source === 'Client'))

async function loadReport() {
  report.value = null
  feedback.value = ''
  if (!selectedMaterialId.value) return
  loadingReport.value = true
  const res = await store.getRefinementReport(selectedMaterialId.value)
  loadingReport.value = false
  if (res.ok) {
    report.value = res.report
    if (!res.report.hasRefinement) { feedback.value = t('jewelry.rrNoData'); feedbackType.value = 'warn' }
  } else {
    feedback.value = t('jewelry.rrError'); feedbackType.value = 'error'
  }
}

function exportPdf() {
  const r = report.value
  if (!r || !r.hasRefinement) return

  const doc = new jsPDF()
  doc.setFillColor(178, 148, 78)
  doc.rect(0, 0, 210, 26, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.text('GoldMetrics — Reporte de Refinamiento', 14, 17)

  doc.setTextColor(30, 30, 30)
  doc.setFontSize(12)
  let y = 42
  const line = (label, value) => { doc.setFont(undefined, 'bold'); doc.text(`${label}:`, 14, y); doc.setFont(undefined, 'normal'); doc.text(String(value), 90, y); y += 11 }

  line(t('jewelry.rrPdfLot'), r.materialId)
  line(t('jewelry.rrPdfGross'), `${r.grossWeightGrams} g`)
  line(t('jewelry.rrPdfShrinkage'), `${Number(r.shrinkagePercent).toFixed(2)} %`)
  line(t('jewelry.rrPdfNet'), `${r.netWeightGrams} g`)

  y += 6
  doc.setFontSize(10)
  doc.setTextColor(90, 90, 90)
  doc.text(doc.splitTextToSize(t('jewelry.rrPdfNote'), 180), 14, y)

  doc.save(`reporte-refinamiento-${r.materialId}.pdf`)
  feedback.value = t('jewelry.rrDone'); feedbackType.value = 'success'
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.rrTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.rrSubtitle') }}</p>
      </div>
    </div>

    <div class="gc-card rr-card">
      <div v-if="feedback" class="gc-alert" :class="`gc-alert-${feedbackType}`">{{ feedback }}</div>

      <div class="form-field">
        <label>{{ $t('jewelry.rrSelectLot') }}</label>
        <select v-model="selectedMaterialId" class="gc-input-dark" @change="loadReport">
          <option value="" disabled>{{ $t('jewelry.rrSelectLotPh') }}</option>
          <option v-for="m in clientLots" :key="m.materialId" :value="m.materialId">{{ m.materialId }}</option>
        </select>
        <p v-if="!clientLots.length" class="hint">{{ $t('jewelry.rrNoLots') }}</p>
      </div>

      <div v-if="loadingReport" class="hint"><i class="pi pi-spin pi-spinner" /> {{ $t('common.loading') }}</div>

      <div v-else-if="report && report.hasRefinement" class="report-box">
        <div class="rep-row"><span>{{ $t('jewelry.rrGross') }}</span><strong>{{ report.grossWeightGrams }} g</strong></div>
        <div class="rep-row"><span>{{ $t('jewelry.rrShrinkage') }}</span><strong class="shr">{{ Number(report.shrinkagePercent).toFixed(2) }} %</strong></div>
        <div class="rep-row"><span>{{ $t('jewelry.rrNet') }}</span><strong>{{ report.netWeightGrams }} g</strong></div>
        <button class="gc-btn gc-btn-gold" style="margin-top:1rem" @click="exportPdf">
          <i class="pi pi-file-pdf" /> {{ $t('jewelry.rrExport') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.rr-card { max-width: 480px; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; }
.form-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
.form-field label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.gc-input-dark { width: 100%; box-sizing: border-box; padding: 0.6rem 0.8rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; }
.gc-input-dark:focus { outline: none; border-color: var(--gc-gold-mid); }
.hint { font-size: 0.78rem; color: var(--gc-text-muted); margin: 0; }
.report-box { border-top: 1px solid var(--gc-border); padding-top: 1rem; }
.rep-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; padding: 0.5rem 0; border-bottom: 1px solid var(--gc-border); }
.rep-row span { color: var(--gc-text-muted); }
.rep-row .shr { color: #eab308; }
.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-gold { background: var(--gc-gold-mid); color: #000; }
.gc-alert { padding: 0.7rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.gc-alert-success { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
.gc-alert-warn { background: rgba(234,179,8,.12); color: #eab308; border: 1px solid rgba(234,179,8,.3); }
.gc-alert-error { background: rgba(239,68,68,.1); color: #ef4444; border: 1px solid rgba(239,68,68,.25); }
</style>
