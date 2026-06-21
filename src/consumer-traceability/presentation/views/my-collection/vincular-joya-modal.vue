<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConsumerStore } from '../../../application/consumer.store.js'

const { t }   = useI18n()
const emit    = defineEmits(['close', 'linked'])
const store   = useConsumerStore()
const qrCode  = ref('')
const submitted = ref(false)
const errorMsg  = ref('')

async function handleLink() {
  submitted.value = true
  errorMsg.value  = ''
  if (!qrCode.value.trim()) return

  const result = await store.linkPiece(qrCode.value.trim())
  if (result) {
    emit('linked', result)
  } else {
    errorMsg.value = t('consumer.linkError')
  }
}
</script>

<template>
  <div class="gc-modal-overlay" @click.self="$emit('close')">
    <div class="gc-modal" style="max-width:420px">
      <div class="gc-modal-header">
        <p class="gc-modal-title">
          <i class="pi pi-link" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
          {{ $t('consumer.linkJewelry') }}
        </p>
        <button class="gc-modal-close" @click="$emit('close')">✕</button>
      </div>

      <div style="padding:1rem 0;display:flex;flex-direction:column;gap:0.75rem">
        <p style="font-size:0.83rem;color:var(--gc-text-muted)">{{ $t('consumer.linkSubtitle') }}</p>
        <label style="font-size:0.82rem;color:var(--gc-text-secondary)">{{ $t('consumer.traceabilityCode') }}</label>
        <input
          v-model="qrCode"
          class="gc-input-dark"
          :placeholder="$t('consumer.codePlaceholder')"
          @keyup.enter="handleLink"
        />
        <span v-if="submitted && !qrCode.trim()" class="gc-error-msg">{{ $t('consumer.codeRequired') }}</span>
        <span v-if="errorMsg" class="gc-error-msg">{{ errorMsg }}</span>
      </div>

      <div class="gc-modal-footer">
        <button class="gc-btn gc-btn-outline" @click="$emit('close')">{{ $t('common.cancel') }}</button>
        <button class="gc-btn gc-btn-gold" :disabled="store.loading" @click="handleLink">
          <i v-if="store.loading" class="pi pi-spin pi-spinner" />
          <i v-else class="pi pi-link" />
          {{ $t('consumer.linkBtn') }}
        </button>
      </div>
    </div>
  </div>
</template>
