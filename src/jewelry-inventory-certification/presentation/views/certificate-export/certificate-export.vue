<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { jsPDF } from 'jspdf'
import { useJewelryStore } from '../../../application/jewelry.store.js'

const { t } = useI18n()
const store = useJewelryStore()

const selectedMaterialId = ref('')
const detailsForm        = reactive({ photo: '', description: '' })
const feedback           = ref('')
const feedbackType       = ref('')

onMounted(() => store.fetchItems())

const materials = computed(() => store.materials)
const selected  = computed(() => store.materials.find(m => m.materialId === selectedMaterialId.value) || null)
const isComplete = computed(() => !!selected.value?.hasCompleteTraceability)

function onSelect() {
  feedback.value = ''
  detailsForm.photo = selected.value?.photo || ''
  detailsForm.description = selected.value?.description || ''
}

async function saveDetails() {
  feedback.value = ''
  if (!detailsForm.photo.trim() || !detailsForm.description.trim()) {
    feedback.value = t('jewelry.expFieldsRequired'); feedbackType.value = 'error'; return
  }
  const res = await store.assignDetails(selectedMaterialId.value, detailsForm.photo.trim(), detailsForm.description.trim())
  if (res.ok) { feedback.value = t('jewelry.expDetailsSaved'); feedbackType.value = 'success' }
  else { feedback.value = t('jewelry.expDetailsError'); feedbackType.value = 'error' }
}

function exportPdf() {
  const m = selected.value
  if (!m) return
  // US27 – Scenario 2: incomplete data blocks the export.
  if (!m.hasCompleteTraceability) {
    feedback.value = t('jewelry.expIncomplete'); feedbackType.value = 'error'; return
  }

  const doc = new jsPDF()
  doc.setFillColor(178, 148, 78)
  doc.rect(0, 0, 210, 26, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.text('GoldMetrics — Certificado de Autenticidad', 14, 17)

  doc.setTextColor(30, 30, 30)
  doc.setFontSize(12)
  let y = 40
  const line = (label, value) => { doc.setFont(undefined, 'bold'); doc.text(`${label}:`, 14, y); doc.setFont(undefined, 'normal'); doc.text(String(value ?? '—'), 70, y); y += 10 }

  line(t('jewelry.expPdfPiece'), m.materialId)
  line(t('jewelry.expPdfJeweler'), m.jewelerId)
  line(t('jewelry.expPdfPurity'), m.verifiedKarats ? `${m.verifiedKarats}k` : '—')
  line(t('jewelry.expPdfMass'), m.massGrams ? `${m.massGrams} g` : '—')
  line(t('jewelry.expPdfQR'), m.qrCode || '—')
  line(t('jewelry.expPdfCert'), m.certificateId || '—')
  line(t('jewelry.expPdfDescription'), '')
  doc.setFontSize(11)
  doc.text(doc.splitTextToSize(m.description || '', 180), 14, y); y += 20
  doc.setFontSize(11)
  line(t('jewelry.expPdfPhoto'), m.photo)

  doc.setDrawColor(178, 148, 78)
  doc.line(14, 270, 90, 270)
  doc.setFontSize(9)
  doc.text(t('jewelry.expPdfSignature'), 14, 276)
  doc.text(`${t('jewelry.expPdfDate')}: ${new Date().toLocaleDateString()}`, 150, 276)

  doc.save(`certificado-${m.materialId}.pdf`)
  feedback.value = t('jewelry.expDone'); feedbackType.value = 'success'
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.expTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.expSubtitle') }}</p>
      </div>
    </div>

    <div class="gc-card exp-card">
      <div v-if="feedback" class="gc-alert" :class="`gc-alert-${feedbackType}`">{{ feedback }}</div>

      <div class="form-field">
        <label>{{ $t('jewelry.expSelectMaterial') }}</label>
        <select v-model="selectedMaterialId" class="gc-input-dark" @change="onSelect">
          <option value="" disabled>{{ $t('jewelry.expSelectMaterialPh') }}</option>
          <option v-for="m in materials" :key="m.materialId" :value="m.materialId">
            {{ m.materialId }}<template v-if="m.hasCompleteTraceability"> · {{ $t('jewelry.expComplete') }}</template>
          </option>
        </select>
        <p v-if="!materials.length" class="hint">{{ $t('jewelry.expNoMaterials') }}</p>
      </div>

      <template v-if="selected">
        <div class="trace-note" :class="{ ok: isComplete }">
          <i :class="isComplete ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle'" />
          <span v-if="isComplete">{{ $t('jewelry.expReady') }}</span>
          <span v-else>{{ $t('jewelry.expMissing') }}</span>
        </div>

        <!-- US27 Scenario 2: complete the missing fields -->
        <div v-if="!isComplete" class="details-box">
          <p class="box-title">{{ $t('jewelry.expCompleteFields') }}</p>
          <div class="form-field">
            <label>{{ $t('jewelry.expPhoto') }}</label>
            <input v-model="detailsForm.photo" class="gc-input-dark" :placeholder="$t('jewelry.expPhotoPh')" />
          </div>
          <div class="form-field">
            <label>{{ $t('jewelry.expDescription') }}</label>
            <textarea v-model="detailsForm.description" class="gc-input-dark" rows="2" :placeholder="$t('jewelry.expDescriptionPh')" />
          </div>
          <button class="gc-btn gc-btn-outline" @click="saveDetails">{{ $t('jewelry.expSaveDetails') }}</button>
        </div>

        <div class="actions">
          <button class="gc-btn gc-btn-gold" :disabled="!isComplete" @click="exportPdf">
            <i class="pi pi-file-pdf" /> {{ $t('jewelry.expExport') }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.exp-card { max-width: 560px; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; }
.form-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
.form-field label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.gc-input-dark { width: 100%; box-sizing: border-box; padding: 0.6rem 0.8rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; font-family: inherit; }
.gc-input-dark:focus { outline: none; border-color: var(--gc-gold-mid); }
.hint { font-size: 0.76rem; color: var(--gc-text-muted); margin: 0; }
.trace-note { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--gc-danger); margin-bottom: 1rem; }
.trace-note.ok { color: #4ade80; }
.details-box { background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 10px; padding: 1rem; margin-bottom: 1rem; }
.box-title { font-size: 0.82rem; font-weight: 700; color: var(--gc-text-primary); margin: 0 0 0.75rem; }
.actions { display: flex; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--gc-border); }
.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-gold { background: var(--gc-gold-mid); color: #000; }
.gc-btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }
.gc-btn-outline { background: transparent; border: 1px solid var(--gc-border); color: var(--gc-text-secondary); }
.gc-btn-outline:hover { border-color: var(--gc-gold-mid); color: var(--gc-text-primary); }
.gc-alert { padding: 0.7rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.gc-alert-success { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
.gc-alert-error { background: rgba(239,68,68,.1); color: #ef4444; border: 1px solid rgba(239,68,68,.25); }
</style>
