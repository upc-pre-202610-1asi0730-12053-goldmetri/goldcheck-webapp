<template>
  <div class="gc-modal-overlay" @click.self="$emit('close')">
    <div class="gc-modal" style="max-width:460px">

      <div class="gc-modal-header">
        <div>
          <p class="gc-modal-title">
            <i class="pi pi-link" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('consumer.linkJewelry') }}
          </p>
          <p class="gc-modal-subtitle">{{ $t('consumer.linkSubtitle') }}</p>
        </div>
        <button class="gc-modal-close" @click="$emit('close')">✕</button>
      </div>

      <div class="form-field">
        <label>{{ $t('consumer.traceabilityCode') }}</label>
        <div style="position:relative">
          <i class="pi pi-qrcode" style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);color:var(--gc-text-muted);font-size:0.9rem;pointer-events:none" />
          <input
            v-model="form.traceabilityCode"
            class="gc-input-dark"
            style="padding-left:2.25rem"
            :placeholder="$t('consumer.codePlaceholder')"
          />
        </div>
        <span v-if="submitted && !form.traceabilityCode" class="gc-error-msg">{{ $t('consumer.codeRequired') }}</span>
      </div>

      <div class="form-field">
        <label>{{ $t('consumer.purchaseName') }}</label>
        <input v-model="form.name" class="gc-input-dark" :placeholder="$t('consumer.purchaseNamePh')" />
        <span v-if="submitted && !form.name" class="gc-error-msg">{{ $t('consumer.nameRequired') }}</span>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>{{ $t('consumer.pieceType') }}</label>
          <select v-model="form.type" class="gc-input-dark">
            <option value="" disabled>{{ $t('consumer.selectType') }}</option>
            <option>Anillo</option><option>Collar</option>
            <option>Pulsera</option><option>Arete</option>
          </select>
        </div>
        <div class="form-field">
          <label>{{ $t('consumer.purity') }}</label>
          <input v-model="form.purity" class="gc-input-dark" placeholder="Ej: 18K" />
        </div>
      </div>

      <div v-if="consumerStore.errors.length" class="gc-alert gc-alert-danger" style="margin-top:0.5rem">
        {{ $t('consumer.linkError') }}
      </div>

      <div class="gc-modal-footer">
        <button class="gc-btn gc-btn-outline" @click="$emit('close')">{{ $t('mineral.cancel') }}</button>
        <button class="gc-btn gc-btn-gold" :disabled="consumerStore.loading" @click="handleLink">
          <i v-if="consumerStore.loading" class="pi pi-spinner pi-spin" />
          <i v-else class="pi pi-link" />
          {{ $t('consumer.linkBtn') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useConsumerStore } from '../../../application/consumer.store.js'
import { useIamStore } from '../../../../iam/application/iam.store.js'

const emit = defineEmits(['close', 'linked'])
const consumerStore = useConsumerStore()
const iamStore = useIamStore()
const submitted = ref(false)

const form = ref({ traceabilityCode: '', name: '', type: '', purity: '' })

async function handleLink() {
  submitted.value = true
  if (!form.value.traceabilityCode || !form.value.name) return
  const piece = await consumerStore.linkPiece({
    ...form.value,
    ownerId: iamStore.currentUser?.id || null
  })
  if (piece) emit('linked', piece)
}
</script>

<style scoped>
.form-field { margin-bottom: 1rem; }
.form-field label { display: block; font-size: 0.82rem; color: var(--gc-text-secondary); margin-bottom: 0.4rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
</style>
