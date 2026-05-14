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
            <label>{{ $t('jewelry.fieldName') }}</label>
            <input v-model="form.name" class="gc-input-dark" :placeholder="$t('jewelry.fieldNamePh')" />
            <span v-if="submitted && !form.name" class="gc-error-msg">{{ $t('jewelry.requiredField') }}</span>
          </div>
          <div class="form-field">
            <label>{{ $t('jewelry.fieldType') }}</label>
            <select v-model="form.type" class="gc-input-dark">
              <option value="" disabled>{{ $t('jewelry.selectType') }}</option>
              <option>Anillo</option>
              <option>Collar</option>
              <option>Pulsera</option>
              <option>Arete</option>
              <option>Colgante</option>
            </select>
            <span v-if="submitted && !form.type" class="gc-error-msg">{{ $t('jewelry.requiredField') }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>{{ $t('jewelry.fieldPurity') }}</label>
            <select v-model="form.purity" class="gc-input-dark">
              <option value="" disabled>{{ $t('jewelry.selectPurity') }}</option>
              <option>18K</option>
              <option>24K</option>
              <option>750</option>
              <option>925 (Plata)</option>
            </select>
            <span v-if="submitted && !form.purity" class="gc-error-msg">{{ $t('jewelry.requiredField') }}</span>
          </div>
          <div class="form-field">
            <label>{{ $t('jewelry.fieldWeight') }} (g)</label>
            <input v-model.number="form.weight" type="number" min="0" step="0.01" class="gc-input-dark" placeholder="Ej: 12.50" />
            <span v-if="submitted && !form.weight" class="gc-error-msg">{{ $t('jewelry.requiredField') }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>{{ $t('jewelry.fieldBatchRef') }}</label>
            <input v-model="form.batchRef" class="gc-input-dark" placeholder="Ej: GM-4821" />
          </div>
          <div class="form-field">
            <label>{{ $t('jewelry.fieldPrice') }} (S/)</label>
            <input v-model.number="form.price" type="number" min="0" class="gc-input-dark" placeholder="Ej: 850" />
          </div>
        </div>

        <div v-if="jewelryStore.errors.length" class="gc-alert gc-alert-danger" style="margin-top:0.5rem">
          {{ $t('jewelry.registerError') }}
        </div>

        <div v-if="success" class="gc-alert gc-alert-success" style="margin-top:0.5rem">
          <i class="pi pi-check-circle" /> {{ $t('jewelry.registerSuccess') }}
        </div>

        <div class="gc-modal-footer" style="margin-top:1.5rem;padding:0;border:none">
          <button type="button" class="gc-btn gc-btn-outline" @click="$router.push('/jewelry/dashboard')">
            {{ $t('mineral.cancel') }}
          </button>
          <button type="submit" class="gc-btn gc-btn-gold" :disabled="jewelryStore.loading">
            <i v-if="jewelryStore.loading" class="pi pi-spinner pi-spin" />
            <i v-else class="pi pi-plus" />
            {{ $t('jewelry.registerBtn') }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useJewelryStore } from '../../../application/jewelry.store.js'

const jewelryStore = useJewelryStore()
const submitted = ref(false)
const success = ref(false)

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
