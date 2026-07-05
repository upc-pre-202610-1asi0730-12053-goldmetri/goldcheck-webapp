<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMaterialOperationsStore } from '../../../application/material-operations.store.js'
import { useStatusLabel } from '../../../../shared/application/status-label.js'

const { t } = useI18n()
const { statusLabel } = useStatusLabel()
const store = useMaterialOperationsStore()

const selectedBatchId = ref(null)
const finalWeight     = ref(null)
const submitting      = ref(false)
const formError       = ref('')
const result          = ref(null) // { shrinkagePercent, underInvestigation }

onMounted(() => store.fetchReceptions())

const materials = computed(() => store.receptions)

const selectedMaterial = computed(() =>
  store.receptions.find(r => String(r.batchId) === String(selectedBatchId.value)) || null
)

async function submit() {
  formError.value = ''
  result.value = null
  if (!selectedBatchId.value) { formError.value = t('materialOps.shrSelectError'); return }

  submitting.value = true
  const res = await store.calculateShrinkage(selectedBatchId.value, Number(finalWeight.value))
  submitting.value = false

  if (res.ok) {
    result.value = res
    finalWeight.value = null
  } else {
    const map = {
      finalWeightRequired: t('materialOps.shrWeightRequired'),
      finalWeightInvalid:  t('materialOps.shrWeightInvalid'),
      updateError:         t('materialOps.shrError'),
    }
    formError.value = map[store.errors[0]] || t('materialOps.shrError')
  }
}

function fmtShrink(v) {
  return (v === null || v === undefined) ? '—' : `${Number(v).toFixed(2)} %`
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('materialOps.shrTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('materialOps.shrSubtitle') }}</p>
      </div>
    </div>

    <div class="gc-card shr-card">
      <div v-if="result" class="gc-alert" :class="result.underInvestigation ? 'gc-alert-danger' : 'gc-alert-success'">
        <i :class="result.underInvestigation ? 'pi pi-exclamation-triangle' : 'pi pi-check-circle'" />
        <span v-if="result.underInvestigation">{{ $t('materialOps.shrCritical', { pct: Number(result.shrinkagePercent).toFixed(2) }) }}</span>
        <span v-else>{{ $t('materialOps.shrNormal', { pct: Number(result.shrinkagePercent).toFixed(2) }) }}</span>
      </div>

      <div class="form-field">
        <label>{{ $t('materialOps.shrSelectBatch') }}</label>
        <select v-model="selectedBatchId" class="gc-input-dark">
          <option :value="null" disabled>{{ $t('materialOps.shrSelectBatchPh') }}</option>
          <option v-for="m in materials" :key="m.batchId" :value="m.batchId">
            HC-{{ m.batchId }} — {{ $t('materialOps.shrInitial') }}: {{ m.initialWeight }} t
          </option>
        </select>
        <p v-if="!materials.length" class="hint">{{ $t('materialOps.shrNoBatches') }}</p>
      </div>

      <div v-if="selectedMaterial" class="initial-note">
        <i class="pi pi-info-circle" />
        {{ $t('materialOps.shrInitialNote', { weight: selectedMaterial.initialWeight }) }}
      </div>

      <div class="form-field">
        <label>{{ $t('materialOps.shrFinalWeight') }}</label>
        <input
          v-model.number="finalWeight"
          type="number" min="0" step="0.01"
          class="gc-input-dark"
          :placeholder="$t('materialOps.shrFinalWeightPh')"
          @keyup.enter="submit"
        />
      </div>

      <span v-if="formError" class="field-error">{{ formError }}</span>

      <div class="actions">
        <button class="gc-btn gc-btn-gold" :disabled="submitting" @click="submit">
          <i v-if="submitting" class="pi pi-spin pi-spinner" />
          {{ $t('materialOps.shrCalculate') }}
        </button>
      </div>
    </div>

    <div class="gc-card" style="margin-top:1.5rem" v-if="materials.length">
      <p class="gc-section-title">{{ $t('materialOps.shrListTitle') }}</p>
      <table class="gc-table">
        <thead>
          <tr>
            <th>{{ $t('materialOps.shrColBatch') }}</th>
            <th>{{ $t('materialOps.shrColInitial') }}</th>
            <th>{{ $t('materialOps.shrColFinal') }}</th>
            <th>{{ $t('materialOps.shrColShrinkage') }}</th>
            <th>{{ $t('materialOps.shrColStatus') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in materials" :key="m.batchId">
            <td>HC-{{ m.batchId }}</td>
            <td>{{ m.initialWeight }} t</td>
            <td>{{ m.shrinkagePercent !== null ? m.receivedWeight + ' t' : '—' }}</td>
            <td>
              <span v-if="m.shrinkagePercent !== null"
                    class="shr-chip"
                    :class="m.shrinkagePercent > 5 ? 'shr-crit' : 'shr-ok'">
                {{ fmtShrink(m.shrinkagePercent) }}
              </span>
              <span v-else class="hint">—</span>
            </td>
            <td>
              <span v-if="m.status === 'UnderInvestigation'" class="badge-danger">{{ $t('materialOps.shrUnderInvestigation') }}</span>
              <span v-else>{{ statusLabel(m.status) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.shr-card { max-width: 560px; }
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
.shr-chip { font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
.shr-ok { background: rgba(74,222,128,.15); color: #4ade80; }
.shr-crit { background: rgba(239,68,68,.15); color: #ef4444; }
.badge-danger { background: rgba(239,68,68,.15); color: #ef4444; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }

.gc-alert { display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.gc-alert-success { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
.gc-alert-danger { background: rgba(239,68,68,.1); color: #ef4444; border: 1px solid rgba(239,68,68,.25); }
</style>
