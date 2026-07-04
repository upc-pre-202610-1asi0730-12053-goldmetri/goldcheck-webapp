<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useJewelryStore } from '../../../application/jewelry.store.js'

const { t } = useI18n()
const store = useJewelryStore()

const selectedMaterialId = ref('')
const refinedWeight      = ref(null)
const submitting         = ref(false)
const formError          = ref('')
const result             = ref(null) // { shrinkagePercent, refinedWeightGrams }

onMounted(() => store.fetchItems())

// Only client-gold lots can be refined.
const clientLots = computed(() => store.materials.filter(m => m.source === 'Client'))
const selected   = computed(() => store.materials.find(m => m.materialId === selectedMaterialId.value) || null)
const gramsLost  = computed(() => {
  if (!selected.value?.massGrams || !refinedWeight.value) return null
  return (Number(selected.value.massGrams) - Number(refinedWeight.value)).toFixed(2)
})

async function submit() {
  formError.value = ''
  result.value = null
  if (!selectedMaterialId.value) { formError.value = t('jewelry.refSelectError'); return }

  submitting.value = true
  const res = await store.registerRefinement(selectedMaterialId.value, Number(refinedWeight.value))
  submitting.value = false

  if (res.ok) {
    result.value = res
    refinedWeight.value = null
  } else {
    const map = {
      refinedRequired: t('jewelry.refWeightRequired'),
      refinedExceeds:  t('jewelry.refExceeds'),
      refineError:     t('jewelry.refError'),
    }
    formError.value = map[store.errors[0]] || t('jewelry.refError')
  }
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.refTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.refSubtitle') }}</p>
      </div>
    </div>

    <div class="gc-card ref-card">
      <div v-if="result" class="gc-alert gc-alert-success">
        <i class="pi pi-check-circle" /> {{ $t('jewelry.refDone', { pct: Number(result.shrinkagePercent).toFixed(2) }) }}
      </div>

      <div class="form-field">
        <label>{{ $t('jewelry.refSelectLot') }}</label>
        <select v-model="selectedMaterialId" class="gc-input-dark">
          <option value="" disabled>{{ $t('jewelry.refSelectLotPh') }}</option>
          <option v-for="m in clientLots" :key="m.materialId" :value="m.materialId">
            {{ m.materialId }} — {{ m.massGrams }} g
          </option>
        </select>
        <p v-if="!clientLots.length" class="hint">{{ $t('jewelry.refNoLots') }}</p>
      </div>

      <div v-if="selected" class="initial-note">
        <i class="pi pi-info-circle" /> {{ $t('jewelry.refInitialNote', { mass: selected.massGrams }) }}
      </div>

      <div class="form-field">
        <label>{{ $t('jewelry.refWeight') }}</label>
        <input v-model.number="refinedWeight" type="number" min="0" step="0.01"
               class="gc-input-dark" :placeholder="$t('jewelry.refWeightPh')" @keyup.enter="submit" />
        <p v-if="gramsLost !== null" class="hint">{{ $t('jewelry.refGramsLost', { g: gramsLost }) }}</p>
      </div>

      <span v-if="formError" class="field-error">{{ formError }}</span>

      <div class="actions">
        <button class="gc-btn gc-btn-gold" :disabled="submitting" @click="submit">
          <i v-if="submitting" class="pi pi-spin pi-spinner" />
          {{ $t('jewelry.refRegister') }}
        </button>
      </div>
    </div>

    <div class="gc-card" style="margin-top:1.5rem" v-if="clientLots.length">
      <p class="gc-section-title">{{ $t('jewelry.refListTitle') }}</p>
      <table class="gc-table">
        <thead>
          <tr>
            <th>{{ $t('jewelry.refColLot') }}</th>
            <th>{{ $t('jewelry.refColInitial') }}</th>
            <th>{{ $t('jewelry.refColRefined') }}</th>
            <th>{{ $t('jewelry.refColShrinkage') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in clientLots" :key="m.materialId">
            <td>{{ m.materialId }}</td>
            <td>{{ m.massGrams }} g</td>
            <td>{{ m.refinedWeightGrams != null ? m.refinedWeightGrams + ' g' : '—' }}</td>
            <td>
              <span v-if="m.refinementShrinkagePercent != null" class="shr-chip">{{ Number(m.refinementShrinkagePercent).toFixed(2) }} %</span>
              <span v-else class="hint">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.ref-card { max-width: 520px; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; }
.gc-section-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1rem; }
.form-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
.form-field label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.gc-input-dark { width: 100%; box-sizing: border-box; padding: 0.6rem 0.8rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; }
.gc-input-dark:focus { outline: none; border-color: var(--gc-gold-mid); }
.hint { font-size: 0.76rem; color: var(--gc-text-muted); margin: 0; }
.initial-note { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: var(--gc-gold-mid); margin: -0.4rem 0 1rem; }
.field-error { font-size: 0.78rem; color: var(--gc-danger); display: block; margin-bottom: 0.75rem; }
.actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--gc-border); }
.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-gold { background: var(--gc-gold-mid); color: #000; }
.gc-btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }
.gc-table { width: 100%; border-collapse: collapse; }
.gc-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-text-muted); padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--gc-border); }
.gc-table td { padding: 0.6rem 0.75rem; font-size: 0.85rem; color: var(--gc-text-primary); border-bottom: 1px solid var(--gc-border); }
.shr-chip { background: rgba(234,179,8,.15); color: #eab308; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
.gc-alert { display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.gc-alert-success { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
</style>
