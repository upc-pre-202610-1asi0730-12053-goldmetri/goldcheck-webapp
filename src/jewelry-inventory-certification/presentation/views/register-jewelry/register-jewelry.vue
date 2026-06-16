<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useJewelryStore } from '../../../application/jewelry.store.js'

const { t } = useI18n()
const jewelryStore = useJewelryStore()
const submitted = ref(false)
const success = ref(false)

const typeOptions = computed(() => [
  { value: 'Anillo',   label: t('jewelry.typeRing') },
  { value: 'Collar',   label: t('jewelry.typeNecklace') },
  { value: 'Pulsera',  label: t('jewelry.typeBracelet') },
  { value: 'Arete',    label: t('jewelry.typeEarring') },
  { value: 'Colgante', label: t('jewelry.typePendant') },
])
const purityOptions = ['18K', '24K', '750', '925 (Plata)']

const form = ref({ name: '', type: '', purity: '', weight: null, batchRef: '', price: null })

async function handleSubmit() {
  submitted.value = true
  if (!form.value.name || !form.value.type || !form.value.purity || !form.value.weight) return
  const item = await jewelryStore.registerItem(form.value)
  if (item) {
    success.value = true
    form.value = { name: '', type: '', purity: '', weight: null, batchRef: '', price: null }
    submitted.value = false
    setTimeout(() => { success.value = false }, 3000)
  }
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.registerTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.registerSubtitle') }}</p>
      </div>
    </div>

    <div class="gc-card" style="max-width:600px">
      <form @submit.prevent="handleSubmit">

        <div class="form-row">
          <div class="form-field">
            <label for="jewelry-name">{{ $t('jewelry.fieldName') }}</label>
            <pv-input-text id="jewelry-name" v-model="form.name" :placeholder="$t('jewelry.fieldNamePh')" :invalid="submitted && !form.name" fluid />
            <span v-if="submitted && !form.name" class="gc-error-msg">{{ $t('jewelry.requiredField') }}</span>
          </div>
          <div class="form-field">
            <label for="jewelry-type">{{ $t('jewelry.fieldType') }}</label>
            <pv-select id="jewelry-type" v-model="form.type" :options="typeOptions" option-label="label" option-value="value" :placeholder="$t('jewelry.selectType')" :invalid="submitted && !form.type" fluid />
            <span v-if="submitted && !form.type" class="gc-error-msg">{{ $t('jewelry.requiredField') }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="jewelry-purity">{{ $t('jewelry.fieldPurity') }}</label>
            <pv-select id="jewelry-purity" v-model="form.purity" :options="purityOptions" :placeholder="$t('jewelry.selectPurity')" :invalid="submitted && !form.purity" fluid />
            <span v-if="submitted && !form.purity" class="gc-error-msg">{{ $t('jewelry.requiredField') }}</span>
          </div>
          <div class="form-field">
            <label for="jewelry-weight">{{ $t('jewelry.fieldWeight') }} (g)</label>
            <pv-input-number id="jewelry-weight" v-model="form.weight" :min="0" :min-fraction-digits="2" :max-fraction-digits="2" placeholder="Ej: 12.50" :invalid="submitted && !form.weight" fluid />
            <span v-if="submitted && !form.weight" class="gc-error-msg">{{ $t('jewelry.requiredField') }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="jewelry-batch">{{ $t('jewelry.fieldBatchRef') }}</label>
            <pv-input-text id="jewelry-batch" v-model="form.batchRef" placeholder="Ej: GM-4821" fluid />
          </div>
          <div class="form-field">
            <label for="jewelry-price">{{ $t('jewelry.fieldPrice') }} (S/)</label>
            <pv-input-number id="jewelry-price" v-model="form.price" :min="0" placeholder="Ej: 850" fluid />
          </div>
        </div>

        <div v-if="jewelryStore.errors.length" class="gc-alert gc-alert-danger" style="margin-top:0.5rem">
          {{ $t('jewelry.registerError') }}
        </div>

        <div v-if="success" class="gc-alert gc-alert-success" style="margin-top:0.5rem">
          <i class="pi pi-check-circle" /> {{ $t('jewelry.registerSuccess') }}
        </div>

        <div class="flex gap-2 justify-content-end" style="margin-top:1.5rem">
          <pv-button type="button" :label="$t('mineral.cancel')" severity="secondary" outlined @click="$router.push({ name: 'jewelry-dashboard' })" />
          <pv-button type="submit" :label="$t('jewelry.registerBtn')" icon="pi pi-plus" :loading="jewelryStore.loading" />
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
.form-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.25rem;
}
.form-field { margin-bottom: 1rem; }
.form-field label { display: block; font-size: 0.82rem; color: var(--gc-text-secondary); margin-bottom: 0.4rem; }

.gc-alert-success {
  background: rgba(74,222,128,0.1); color: #4ade80;
  border: 1px solid rgba(74,222,128,0.25); padding: 0.6rem 0.9rem;
  border-radius: 6px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;
}

@media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
</style>
