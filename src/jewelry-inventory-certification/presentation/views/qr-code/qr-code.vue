<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
import { useJewelryStore } from '../../../application/jewelry.store.js'

const { t } = useI18n()
const store = useJewelryStore()

const selectedMaterialId = ref('')
const generating         = ref(false)
const formError          = ref('')
const qrValue            = ref('')
const qrImage            = ref('')

onMounted(() => store.fetchItems())

const materials = computed(() => store.materials)

const selected = computed(() => store.materials.find(m => m.materialId === selectedMaterialId.value) || null)
const purityConfirmed = computed(() => !!selected.value?.verifiedKarats)

async function generate() {
  formError.value = ''
  qrValue.value = ''
  qrImage.value = ''
  if (!selectedMaterialId.value) { formError.value = t('jewelry.qrSelectError'); return }

  generating.value = true
  const res = await store.generateQR(selectedMaterialId.value)
  generating.value = false

  if (res.ok) {
    qrValue.value = res.qrCode
    qrImage.value = await QRCode.toDataURL(res.qrCode, { width: 240, margin: 2 })
  } else {
    formError.value = store.errors[0] === 'qrRequiresPurity' ? t('jewelry.qrRequiresPurity') : t('jewelry.qrError')
  }
}

// Re-render the image for a material that already has a QR (without re-generating).
async function showExisting(m) {
  selectedMaterialId.value = m.materialId
  formError.value = ''
  if (m.qrCode) {
    qrValue.value = m.qrCode
    qrImage.value = await QRCode.toDataURL(m.qrCode, { width: 240, margin: 2 })
  } else {
    qrValue.value = ''; qrImage.value = ''
  }
}

function download() {
  if (!qrImage.value) return
  const a = document.createElement('a')
  a.href = qrImage.value
  a.download = `${qrValue.value}.png`
  a.click()
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.qrTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.qrSubtitle') }}</p>
      </div>
    </div>

    <div class="qr-layout">
      <div class="gc-card qr-form">
        <div class="form-field">
          <label>{{ $t('jewelry.qrSelectMaterial') }}</label>
          <select v-model="selectedMaterialId" class="gc-input-dark">
            <option value="" disabled>{{ $t('jewelry.qrSelectMaterialPh') }}</option>
            <option v-for="m in materials" :key="m.materialId" :value="m.materialId">
              {{ m.materialId }}<template v-if="m.qrCode"> · {{ $t('jewelry.qrAlready') }}</template>
            </option>
          </select>
          <p v-if="!materials.length" class="hint">{{ $t('jewelry.qrNoMaterials') }}</p>
        </div>

        <div v-if="selected" class="purity-note" :class="{ blocked: !purityConfirmed }">
          <i :class="purityConfirmed ? 'pi pi-verified' : 'pi pi-exclamation-triangle'" />
          <span v-if="purityConfirmed">{{ $t('jewelry.qrPurityOk', { k: selected.verifiedKarats }) }}</span>
          <span v-else>{{ $t('jewelry.qrPurityMissing') }}</span>
        </div>

        <span v-if="formError" class="field-error">{{ formError }}</span>

        <div class="actions">
          <button class="gc-btn gc-btn-gold" :disabled="generating" @click="generate">
            <i v-if="generating" class="pi pi-spin pi-spinner" />
            <i v-else class="pi pi-qrcode" />
            {{ $t('jewelry.qrGenerate') }}
          </button>
        </div>
      </div>

      <div class="gc-card qr-preview" v-if="qrImage">
        <p class="gc-section-title">{{ $t('jewelry.qrPreviewTitle') }}</p>
        <img :src="qrImage" :alt="qrValue" class="qr-img" />
        <p class="qr-value">{{ qrValue }}</p>
        <button class="gc-btn gc-btn-outline" @click="download">
          <i class="pi pi-download" /> {{ $t('jewelry.qrDownload') }}
        </button>
      </div>
    </div>

    <div class="gc-card" style="margin-top:1.5rem" v-if="materials.length">
      <p class="gc-section-title">{{ $t('jewelry.qrListTitle') }}</p>
      <table class="gc-table">
        <thead>
          <tr>
            <th>{{ $t('jewelry.qrColMaterial') }}</th>
            <th>{{ $t('jewelry.qrColPurity') }}</th>
            <th>{{ $t('jewelry.qrColCode') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in materials" :key="m.materialId">
            <td>{{ m.materialId }}</td>
            <td>
              <span v-if="m.verifiedKarats" class="badge-ok">{{ m.verifiedKarats }}k</span>
              <span v-else class="badge-warn">{{ $t('jewelry.qrUnverified') }}</span>
            </td>
            <td>
              <span v-if="m.qrCode" class="code-chip">{{ m.qrCode }}</span>
              <span v-else class="hint">—</span>
            </td>
            <td style="text-align:right">
              <button v-if="m.qrCode" class="link-btn" @click="showExisting(m)">{{ $t('jewelry.qrView') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.qr-layout { display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start; }
.qr-form { flex: 1; min-width: 320px; max-width: 480px; }
.qr-preview { width: 300px; text-align: center; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; }
.gc-section-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1rem; }
.form-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
.form-field label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.gc-input-dark { width: 100%; box-sizing: border-box; padding: 0.6rem 0.8rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; }
.gc-input-dark:focus { outline: none; border-color: var(--gc-gold-mid); }
.hint { font-size: 0.76rem; color: var(--gc-text-muted); margin: 0; }
.purity-note { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: #4ade80; margin-bottom: 1rem; }
.purity-note.blocked { color: var(--gc-danger); }
.field-error { font-size: 0.78rem; color: var(--gc-danger); display: block; margin-bottom: 0.75rem; }
.actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--gc-border); }
.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-gold { background: var(--gc-gold-mid); color: #000; }
.gc-btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }
.gc-btn-outline { background: transparent; border: 1px solid var(--gc-border); color: var(--gc-text-secondary); margin-top: 1rem; }
.gc-btn-outline:hover { border-color: var(--gc-gold-mid); color: var(--gc-text-primary); }
.qr-img { width: 240px; height: 240px; background: #fff; border-radius: 8px; padding: 8px; box-sizing: border-box; }
.qr-value { font-size: 0.85rem; font-weight: 700; color: var(--gc-gold-mid); margin: 0.75rem 0 0; }
.gc-table { width: 100%; border-collapse: collapse; }
.gc-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-text-muted); padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--gc-border); }
.gc-table td { padding: 0.6rem 0.75rem; font-size: 0.85rem; color: var(--gc-text-primary); border-bottom: 1px solid var(--gc-border); }
.badge-ok { background: rgba(74,222,128,.15); color: #4ade80; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
.badge-warn { background: rgba(234,179,8,.15); color: #eab308; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
.code-chip { background: rgba(178,148,78,.15); color: var(--gc-gold-mid); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
.link-btn { background: none; border: none; color: var(--gc-gold-mid); cursor: pointer; font-size: 0.8rem; }
.link-btn:hover { text-decoration: underline; }
</style>
