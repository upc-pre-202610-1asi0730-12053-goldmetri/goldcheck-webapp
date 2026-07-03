<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMaterialOperationsStore } from '../../../application/material-operations.store.js'

const { t } = useI18n()
const store = useMaterialOperationsStore()

const MINERAL_TYPES = ['Gold', 'Silver', 'Copper']

const selectedBatchId = ref(null)
const mineralType     = ref('')
const submitting      = ref(false)
const formError       = ref('')
const success         = ref(false)

onMounted(() => store.fetchReceptions())

const materials = computed(() => store.receptions)

function typeLabel(type) {
  const map = { Gold: t('materialOps.mineralGold'), Silver: t('materialOps.mineralSilver'), Copper: t('materialOps.mineralCopper') }
  return map[type] || type || '—'
}

async function submitChange() {
  formError.value = ''
  success.value = false
  if (!selectedBatchId.value) { formError.value = t('materialOps.typingSelectError'); return }
  if (!mineralType.value) { formError.value = t('materialOps.typingTypeRequired'); return }

  submitting.value = true
  const res = await store.changeMineralType(selectedBatchId.value, mineralType.value)
  submitting.value = false

  if (res.ok) {
    success.value = true
    setTimeout(() => { success.value = false }, 4000)
  } else {
    const map = {
      mineralTypeRequired: t('materialOps.typingTypeRequired'),
      mineralTypeBlocked:  t('materialOps.typingBlocked'),
      mineralTypeInvalid:  t('materialOps.typingInvalid'),
      updateError:         t('materialOps.typingError'),
    }
    formError.value = map[store.errors[0]] || t('materialOps.typingError')
  }
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('materialOps.typingTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('materialOps.typingSubtitle') }}</p>
      </div>
    </div>

    <div class="gc-card typing-card">
      <div v-if="success" class="gc-alert gc-alert-success">
        <i class="pi pi-check-circle" /> {{ $t('materialOps.typingSaved') }}
      </div>

      <div class="form-field">
        <label>{{ $t('materialOps.typingSelectBatch') }}</label>
        <select v-model="selectedBatchId" class="gc-input-dark">
          <option :value="null" disabled>{{ $t('materialOps.typingSelectBatchPh') }}</option>
          <option v-for="m in materials" :key="m.batchId" :value="m.batchId">
            HC-{{ m.batchId }} — {{ typeLabel(m.mineralType) }}
          </option>
        </select>
        <p v-if="!materials.length" class="hint">{{ $t('materialOps.typingNoBatches') }}</p>
      </div>

      <div class="form-field">
        <label>{{ $t('materialOps.typingNewType') }}</label>
        <select v-model="mineralType" class="gc-input-dark">
          <option value="" disabled>{{ $t('materialOps.typingNewTypePh') }}</option>
          <option v-for="tp in MINERAL_TYPES" :key="tp" :value="tp">{{ typeLabel(tp) }}</option>
        </select>
      </div>

      <span v-if="formError" class="field-error">{{ formError }}</span>

      <div class="actions">
        <button class="gc-btn gc-btn-gold" :disabled="submitting" @click="submitChange">
          <i v-if="submitting" class="pi pi-spin pi-spinner" />
          {{ $t('materialOps.typingSubmit') }}
        </button>
      </div>
    </div>

    <div class="gc-card" style="margin-top:1.5rem" v-if="materials.length">
      <p class="gc-section-title">{{ $t('materialOps.typingListTitle') }}</p>
      <table class="gc-table">
        <thead>
          <tr>
            <th>{{ $t('materialOps.typingColBatch') }}</th>
            <th>{{ $t('materialOps.typingColType') }}</th>
            <th>{{ $t('materialOps.typingColStatus') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in materials" :key="m.batchId">
            <td>HC-{{ m.batchId }}</td>
            <td><span class="type-chip">{{ typeLabel(m.mineralType) }}</span></td>
            <td>{{ m.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.typing-card { max-width: 560px; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; }
.gc-section-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1rem; }

.form-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
.form-field label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

.gc-input-dark { width: 100%; box-sizing: border-box; padding: 0.6rem 0.8rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; transition: border-color 0.2s; }
.gc-input-dark:focus { outline: none; border-color: var(--gc-gold-mid); }

.hint { font-size: 0.76rem; color: var(--gc-text-muted); margin: 0; }
.field-error { font-size: 0.78rem; color: var(--gc-danger); display: block; margin-bottom: 0.75rem; }

.actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--gc-border); }
.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-gold { background: var(--gc-gold-mid); color: #000; }
.gc-btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }

.gc-table { width: 100%; border-collapse: collapse; }
.gc-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-text-muted); padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--gc-border); }
.gc-table td { padding: 0.6rem 0.75rem; font-size: 0.85rem; color: var(--gc-text-primary); border-bottom: 1px solid var(--gc-border); }
.type-chip { background: rgba(178,148,78,.15); color: var(--gc-gold-mid); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }

.gc-alert { display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.gc-alert-success { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
</style>
