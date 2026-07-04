<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useJewelryStore } from '../../../application/jewelry.store.js'

const { t } = useI18n()
const store = useJewelryStore()

const selectedMaterialId = ref('')
const verifiedKarats     = ref(null)
const submitting         = ref(false)
const formError          = ref('')
const result             = ref(null) // { verifiedKarats, declaredKarats, hasDiscrepancy }

onMounted(() => store.fetchItems())

// Only parent lots (not child pieces) are testable.
const materials = computed(() => store.materials.filter(m => !m.parentMaterialId))

const selected = computed(() => store.materials.find(m => m.materialId === selectedMaterialId.value) || null)

async function submit() {
  formError.value = ''
  result.value = null
  if (!selectedMaterialId.value) { formError.value = t('jewelry.purSelectError'); return }

  submitting.value = true
  const res = await store.registerPurityTest(selectedMaterialId.value, Number(verifiedKarats.value))
  submitting.value = false

  if (res.ok) {
    result.value = res
    verifiedKarats.value = null
  } else {
    formError.value = store.errors[0] === 'invalidPurity' ? t('jewelry.purInvalid') : t('jewelry.purError')
  }
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.purTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.purSubtitle') }}</p>
      </div>
    </div>

    <div class="gc-card pur-card">
      <div v-if="result" class="gc-alert" :class="result.hasDiscrepancy ? 'gc-alert-warn' : 'gc-alert-success'">
        <i :class="result.hasDiscrepancy ? 'pi pi-exclamation-triangle' : 'pi pi-check-circle'" />
        <span v-if="result.hasDiscrepancy">{{ $t('jewelry.purDiscrepancy', { declared: result.declaredKarats, verified: result.verifiedKarats }) }}</span>
        <span v-else>{{ $t('jewelry.purSaved', { karats: result.verifiedKarats }) }}</span>
      </div>

      <div class="form-field">
        <label>{{ $t('jewelry.purSelectMaterial') }}</label>
        <select v-model="selectedMaterialId" class="gc-input-dark">
          <option value="" disabled>{{ $t('jewelry.purSelectMaterialPh') }}</option>
          <option v-for="m in materials" :key="m.materialId" :value="m.materialId">
            {{ m.materialId }}<template v-if="m.declaredKarats"> · {{ $t('jewelry.purDeclared', { k: m.declaredKarats }) }}</template>
          </option>
        </select>
        <p v-if="!materials.length" class="hint">{{ $t('jewelry.purNoMaterials') }}</p>
      </div>

      <div v-if="selected && selected.declaredKarats" class="declared-note">
        <i class="pi pi-info-circle" /> {{ $t('jewelry.purDeclaredNote', { k: selected.declaredKarats }) }}
      </div>

      <div class="form-field">
        <label>{{ $t('jewelry.purVerifiedKarats') }}</label>
        <input v-model.number="verifiedKarats" type="number" min="1" max="24"
               class="gc-input-dark" :placeholder="$t('jewelry.purVerifiedPh')" @keyup.enter="submit" />
      </div>

      <span v-if="formError" class="field-error">{{ formError }}</span>

      <div class="actions">
        <button class="gc-btn gc-btn-gold" :disabled="submitting" @click="submit">
          <i v-if="submitting" class="pi pi-spin pi-spinner" />
          {{ $t('jewelry.purRegister') }}
        </button>
      </div>
    </div>

    <div class="gc-card" style="margin-top:1.5rem" v-if="materials.length">
      <p class="gc-section-title">{{ $t('jewelry.purListTitle') }}</p>
      <table class="gc-table">
        <thead>
          <tr>
            <th>{{ $t('jewelry.purColMaterial') }}</th>
            <th>{{ $t('jewelry.purColDeclared') }}</th>
            <th>{{ $t('jewelry.purColVerified') }}</th>
            <th>{{ $t('jewelry.purColResult') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in materials" :key="m.materialId">
            <td>{{ m.materialId }}</td>
            <td>{{ m.declaredKarats ? m.declaredKarats + 'k' : '—' }}</td>
            <td>{{ m.verifiedKarats ? m.verifiedKarats + 'k' : '—' }}</td>
            <td>
              <span v-if="m.hasCommercialDiscrepancy" class="badge-warn">{{ $t('jewelry.purDiscrepancyBadge') }}</span>
              <span v-else-if="m.verifiedKarats" class="badge-ok">{{ $t('jewelry.purOkBadge') }}</span>
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
.pur-card { max-width: 560px; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; }
.gc-section-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1rem; }
.form-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
.form-field label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.gc-input-dark { width: 100%; box-sizing: border-box; padding: 0.6rem 0.8rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; }
.gc-input-dark:focus { outline: none; border-color: var(--gc-gold-mid); }
.hint { font-size: 0.76rem; color: var(--gc-text-muted); margin: 0; }
.declared-note { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: var(--gc-gold-mid); margin: -0.4rem 0 1rem; }
.field-error { font-size: 0.78rem; color: var(--gc-danger); display: block; margin-bottom: 0.75rem; }
.actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--gc-border); }
.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-gold { background: var(--gc-gold-mid); color: #000; }
.gc-btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }
.gc-table { width: 100%; border-collapse: collapse; }
.gc-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-text-muted); padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--gc-border); }
.gc-table td { padding: 0.6rem 0.75rem; font-size: 0.85rem; color: var(--gc-text-primary); border-bottom: 1px solid var(--gc-border); }
.badge-ok { background: rgba(74,222,128,.15); color: #4ade80; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
.badge-warn { background: rgba(234,179,8,.15); color: #eab308; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
.gc-alert { display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.gc-alert-success { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
.gc-alert-warn { background: rgba(234,179,8,.12); color: #eab308; border: 1px solid rgba(234,179,8,.3); }
</style>
