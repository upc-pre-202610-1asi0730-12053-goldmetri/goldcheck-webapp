<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMineralStore } from '../../../application/mineral.store.js'
import { useMaterialOperationsStore } from '../../../../material-operations/application/material-operations.store.js'

const { t } = useI18n()
const store = useMineralStore()
const materialStore = useMaterialOperationsStore()

const selectedCycleId = ref(null)
const batchId         = ref('')
const grossWeight     = ref(null)
const submitting      = ref(false)
const result          = ref(null) // { ok, exceedsCapacity }
const formError       = ref('')

onMounted(async () => {
  await Promise.all([store.fetchBatches(), store.fetchSupporting()])
})

// Cycles awaiting initial weighing (started but not yet loaded).
const cyclesAwaiting = computed(() =>
  store.batches.filter(b => b.status === 'Cargando')
)

const selectedCycle = computed(() =>
  store.batches.find(b => b.id === selectedCycleId.value) || null
)

// Technical capacity of the vehicle linked to the selected cycle (if known).
const selectedCapacity = computed(() => {
  const cyc = selectedCycle.value
  if (!cyc) return null
  const v = store.vehicles.find(x => x.id === cyc.vehicleId)
  return v ? v.capacity : null
})

// The batch code is taken from the selected cycle (e.g. "HC-14") — no need to invent one.
watch(selectedCycleId, () => {
  batchId.value = selectedCycle.value?.batchCode || ''
})

function resetForm() {
  selectedCycleId.value = null
  batchId.value = ''
  grossWeight.value = null
  formError.value = ''
}

async function submitWeighing() {
  formError.value = ''
  result.value = null
  if (!selectedCycleId.value) { formError.value = t('mineral.weighingSelectCycleError'); return }
  if (!batchId.value.trim()) { formError.value = t('mineral.weighingBatchRequired'); return }
  if (!grossWeight.value || Number(grossWeight.value) <= 0) { formError.value = t('mineral.weighingWeightRequired'); return }

  submitting.value = true

  // US14 – the batch (material) must exist before weighing. Create it on the fly as 'Gold'
  // if it isn't registered yet; an "already exists" result is fine.
  const created = await materialStore.identifyMineral(batchId.value.trim(), 'Gold', Number(grossWeight.value))
  if (!created && materialStore.errors[0] !== 'materialExists') {
    submitting.value = false
    formError.value = t('mineral.weighingError')
    return
  }

  const res = await store.registerInitialWeight(selectedCycleId.value, Number(grossWeight.value), batchId.value.trim())
  submitting.value = false

  if (res.ok) {
    result.value = res
    batchId.value = ''
    grossWeight.value = null
    selectedCycleId.value = null
  } else {
    const code = store.errors[0]
    const map = {
      weightRequired: t('mineral.weighingWeightRequired'),
      batchRequired:  t('mineral.weighingBatchRequired'),
      batchNotFound:  t('mineral.weighingBatchNotFound'),
      weightError:    t('mineral.weighingError'),
    }
    formError.value = map[code] || t('mineral.weighingError')
  }
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('mineral.weighingTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('mineral.weighingSubtitle') }}</p>
      </div>
    </div>

    <div class="gc-card weighing-card">
      <!-- Result banners -->
      <div v-if="result && result.exceedsCapacity" class="gc-alert gc-alert-warning">
        <i class="pi pi-exclamation-triangle" />
        <span>{{ $t('mineral.weighingCapacityAlert') }}</span>
      </div>
      <div v-else-if="result" class="gc-alert gc-alert-success">
        <i class="pi pi-check-circle" />
        <span>{{ $t('mineral.weighingSaved') }}</span>
      </div>

      <div class="form-field">
        <label>{{ $t('mineral.weighingSelectCycle') }}</label>
        <select v-model="selectedCycleId" class="gc-input-dark">
          <option :value="null" disabled>{{ $t('mineral.weighingSelectCyclePh') }}</option>
          <option v-for="c in cyclesAwaiting" :key="c.id" :value="c.id">
            {{ c.batchCode }} — {{ c.vehicleName }} ({{ c.depositName }})
          </option>
        </select>
        <p v-if="!cyclesAwaiting.length" class="hint">{{ $t('mineral.weighingNoCycles') }}</p>
      </div>

      <div v-if="selectedCapacity !== null && selectedCapacity > 0" class="capacity-note">
        <i class="pi pi-info-circle" />
        {{ $t('mineral.weighingCapacityInfo', { capacity: selectedCapacity }) }}
      </div>

      <div class="form-field">
        <label>{{ $t('mineral.weighingBatchId') }}</label>
        <input
          v-model="batchId"
          type="text"
          class="gc-input-dark"
          :placeholder="$t('mineral.weighingBatchIdPh')"
          readonly
        />
        <p class="hint">{{ $t('mineral.weighingBatchIdHint') }}</p>
      </div>

      <div class="form-field">
        <label>{{ $t('mineral.weighingGrossWeight') }}</label>
        <input
          v-model.number="grossWeight"
          type="number"
          min="0"
          step="0.1"
          class="gc-input-dark"
          :placeholder="$t('mineral.weighingGrossWeightPh')"
          @keyup.enter="submitWeighing"
        />
      </div>

      <span v-if="formError" class="field-error">{{ formError }}</span>

      <div class="actions">
        <button class="gc-btn gc-btn-outline" @click="resetForm">{{ $t('common.cancel') }}</button>
        <button class="gc-btn gc-btn-gold" :disabled="submitting" @click="submitWeighing">
          <i v-if="submitting" class="pi pi-spin pi-spinner" />
          {{ $t('mineral.weighingSubmit') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.weighing-card { max-width: 560px; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; }

.form-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
.form-field label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

.gc-input-dark { width: 100%; box-sizing: border-box; padding: 0.6rem 0.8rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; transition: border-color 0.2s; }
.gc-input-dark:focus { outline: none; border-color: var(--gc-gold-mid); }

.hint { font-size: 0.76rem; color: var(--gc-text-muted); margin: 0; }
.field-error { font-size: 0.78rem; color: var(--gc-danger); display: block; margin-bottom: 0.75rem; }

.capacity-note { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: var(--gc-gold-mid); margin: -0.4rem 0 1rem; }

.actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--gc-border); }
.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-gold { background: var(--gc-gold-mid); color: #000; }
.gc-btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }
.gc-btn-outline { background: transparent; border: 1px solid var(--gc-border); color: var(--gc-text-secondary); }
.gc-btn-outline:hover { border-color: var(--gc-gold-mid); color: var(--gc-text-primary); }

.gc-alert { display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.gc-alert-success { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
.gc-alert-warning { background: rgba(234,179,8,.12); color: #eab308; border: 1px solid rgba(234,179,8,.3); }
</style>
