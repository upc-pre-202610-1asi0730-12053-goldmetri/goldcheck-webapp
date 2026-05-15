<template>
  <pv-dialog
    :visible="true"
    @update:visible="v => !v && $emit('close')"
    :modal="true"
    :closable="true"
    :style="{ width: '460px' }"
  >
    <template #header>
      <span>
        <i class="pi pi-link" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
        {{ $t('consumer.linkJewelry') }}
        <small style="display:block;font-size:0.78rem;color:var(--gc-text-muted);font-weight:400">
          {{ $t('consumer.linkSubtitle') }}
        </small>
      </span>
    </template>

    <div class="form-field">
      <label for="trace-code">{{ $t('consumer.traceabilityCode') }}</label>
      <pv-icon-field>
        <pv-input-icon class="pi pi-qrcode" />
        <pv-input-text
          id="trace-code"
          v-model="form.traceabilityCode"
          :placeholder="$t('consumer.codePlaceholder')"
          :invalid="submitted && !form.traceabilityCode"
          fluid
        />
      </pv-icon-field>
      <span v-if="submitted && !form.traceabilityCode" class="gc-error-msg">{{ $t('consumer.codeRequired') }}</span>
    </div>

    <div class="form-field">
      <label for="purchase-name">{{ $t('consumer.purchaseName') }}</label>
      <pv-input-text
        id="purchase-name"
        v-model="form.name"
        :placeholder="$t('consumer.purchaseNamePh')"
        :invalid="submitted && !form.name"
        fluid
      />
      <span v-if="submitted && !form.name" class="gc-error-msg">{{ $t('consumer.nameRequired') }}</span>
    </div>

    <div class="form-row">
      <div class="form-field">
        <label for="piece-type">{{ $t('consumer.pieceType') }}</label>
        <pv-select
          id="piece-type"
          v-model="form.type"
          :options="typeOptions"
          :placeholder="$t('consumer.selectType')"
          fluid
        />
      </div>
      <div class="form-field">
        <label for="piece-purity">{{ $t('consumer.purity') }}</label>
        <pv-input-text id="piece-purity" v-model="form.purity" placeholder="Ej: 18K" fluid />
      </div>
    </div>

    <div v-if="consumerStore.errors.length" class="gc-alert gc-alert-danger" style="margin-top:0.5rem">
      {{ $t('consumer.linkError') }}
    </div>

    <template #footer>
      <pv-button :label="$t('mineral.cancel')" severity="secondary" outlined @click="$emit('close')" />
      <pv-button
        :label="$t('consumer.linkBtn')"
        icon="pi pi-link"
        :loading="consumerStore.loading"
        @click="handleLink"
      />
    </template>
  </pv-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useConsumerStore } from '../../../application/consumer.store.js'
import { useIamStore } from '../../../../iam/application/iam.store.js'

const emit = defineEmits(['close', 'linked'])
const consumerStore = useConsumerStore()
const iamStore = useIamStore()
const submitted = ref(false)

const typeOptions = ['Anillo', 'Collar', 'Pulsera', 'Arete']
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
